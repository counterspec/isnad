# ISNAD 架构

## 设计原则

1. **链上优先** — 认证、质押和资源存储在 Base L2 上
2. **测试驱动** — 每个组件在实现前都有测试
3. **关注点分离** — 层与层之间有清晰的边界
4. **默认安全** — 假设对抗性环境

---

## 系统概览

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ isnad.md │  │  代理人  │  │ CLI/SDK  │  │ 审计员   │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
└───────┼─────────────┼─────────────┼─────────────┼───────────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API 层 (api.isnad.md)                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  REST API（链状态的只读缓存）                                │    │
│  │  • GET /resources/{hash}                                    │    │
│  │  • GET /resources/{hash}/attestations                       │    │
│  │  • GET /auditors/{address}                                  │    │
│  │  • GET /trust/{hash} → 信任分数 + 等级                      │    │
│  │  • WS  /subscribe → 实时更新                                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ 读取自
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      索引器层                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  链索引器                                                    │    │
│  │  • 监听 ISNAD 注册表合约事件                                 │    │
│  │  • 解析铭刻 calldata                                        │    │
│  │  • 构建可查询数据库                                          │    │
│  │  • 优雅处理重组                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ 索引
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      链层 (Base L2)                                  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ ISNAD 代币   │  │   注册表     │  │   质押       │              │
│  │   (ERC20)    │  │ (铭刻        │  │ (认证        │              │
│  │              │  │  + 元数据)   │  │  + 罚没)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │   预言机     │  │  奖励池      │                                │
│  │  (检测       │  │   (收益      │                                │
│  │   裁决)      │  │ 分配)        │                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 智能合约

### 安全考虑

**威胁模型：**
- 恶意审计员串通为不良资源背书
- 质押的闪电贷攻击
- 铭刻 + 认证的前置运行攻击
- 质押/解除质押的重入攻击
- 预言机操纵
- 治理攻击

**缓解措施：**
- 高等级需要多审计员
- 锁定期防止闪电贷攻击
- 认证的提交-揭示机制（可选）
- 所有状态变更函数使用 ReentrancyGuard
- 带陪审团系统的多层检测
- 治理操作的时间锁

### 合约 1: ISNADToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ISNADToken
 * @notice 带许可、快照和受控铸造的 ERC20 代币
 * 
 * 安全说明：
 * - MINTER_ROLE 仅用于奖励池
 * - BURNER_ROLE 仅用于质押合约（罚没）
 * - Snapshot 用于治理投票
 * - Permit 用于无 gas 授权
 */
contract ISNADToken is ERC20Permit, ERC20Snapshot, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 10亿
    uint256 public constant MAX_ANNUAL_INFLATION = 3; // 3%
    
    // 测试：
    // - test_mint_onlyMinter
    // - test_mint_respectsMaxSupply
    // - test_burn_onlyBurner
    // - test_snapshot_onlySnapshotRole
    // - test_permit_works
    // - test_transfer_basic
}
```

### 合约 2: ISNADRegistry.sol

```solidity
/**
 * @title ISNADRegistry
 * @notice 跟踪铭刻及其元数据
 * 
 * 铭刻存储在 calldata 中，而非合约存储。
 * 此合约为索引器发出事件并存储最小链上状态。
 * 
 * 安全说明：
 * - 部署后无管理员函数
 * - 事件是索引器的真实来源
 * - contentHash 根据 calldata 验证
 */
contract ISNADRegistry {
    event ResourceInscribed(
        bytes32 indexed contentHash,
        uint8 resourceType,
        address indexed author,
        uint256 indexed blockNumber
    );
    
    event ResourceDeprecated(
        bytes32 indexed contentHash,
        bytes32 indexed supersededBy
    );
    
    // 最小链上状态（仅用于验证）
    mapping(bytes32 => bool) public exists;
    mapping(bytes32 => address) public author;
    
    // 测试：
    // - test_inscribe_emitsEvent
    // - test_inscribe_storesMinimalState
    // - test_inscribe_verifiesContentHash
    // - test_inscribe_rejectsInvalidFormat
    // - test_deprecate_onlyAuthor
    // - test_inscribe_chunkReassembly
}
```

### 合约 3: ISNADStaking.sol

```solidity
/**
 * @title ISNADStaking
 * @notice 管理资源上的认证（质押）
 * 
 * 安全说明：
 * - ReentrancyGuard 用于质押/解除质押
 * - 强制执行锁定期
 * - 只有预言机可以罚没
 * - 强制执行巨鲸上限
 */
contract ISNADStaking is ReentrancyGuard {
    struct Attestation {
        address auditor;
        bytes32 resourceHash;
        uint256 amount;
        uint256 lockUntil;
        uint256 lockDuration;
        bool slashed;
    }
    
    uint256 public constant MAX_STAKE_PER_RESOURCE = 10_000 * 1e18;
    uint256 public constant MAX_STAKE_PERCENT = 33; // 33% 的总量
    
    // 测试：
    // - test_stake_locksTokens
    // - test_stake_emitsEvent
    // - test_stake_respectsMaxStake
    // - test_stake_respectsMaxPercent
    // - test_unstake_revertsIfLocked
    // - test_unstake_returnsTokens
    // - test_slash_onlyOracle