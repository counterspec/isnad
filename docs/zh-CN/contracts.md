# 智能合约

ISNAD 部署在 Base 网络上，采用模块化合约架构。

## 合约地址

### Base Sepolia（测试网）

| 合约 | 地址 |
|------|------|
| ISNADToken | `0xc41c1006A1AaC093C758A2f09de16fee2561651A` |
| ISNADRegistry | `0x5A06453257874Fd000738F28C462d17BFf8e1EA3` |
| ISNADStaking | `0x58983D142A388A96B7d9F970005483AA044CCAD9` |
| ISNADOracle | `0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7` |
| ISNADRewardPool | `0x474cB2441C0Af053DAe052302a6829a218Aa656F` |
| TimelockController | `0x2c99dB618a6dBFf0F0e74f7949fcC9A23ffB4A69` |
| ISNADGovernor | `0xf08269e04029eB0eeAfcE10Ed3aa9Fb2bAbB61Cd` |

### Base 主网

测试网验证完成后即将上线。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      ISNAD 协议                              │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  ISNADToken  │ ISNADRegistry│ ISNADStaking │  ISNADOracle  │
│  (ERC20 +    │  (铭刻 +     │  (质押 +     │  (标记 +      │
│   投票)      │   元数据)    │   认证)      │   陪审团)     │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  ISNADRewardPool        │        ISNADGovernor             │
│  (收益分配)              │        (DAO + 时间锁)            │
└─────────────────────────┴──────────────────────────────────┘
```

## 合约说明

### ISNADToken

具备治理功能的 ERC20 代币。

**特性：**
- ERC20 标准功能
- ERC20Votes 扩展，支持治理投票
- 固定最大供应量：10 亿枚
- MINTER_ROLE：奖励池可铸造
- BURNER_ROLE：质押合约可销毁（惩罚机制）

**核心函数：**
```solidity
function mint(address to, uint256 amount) external;
function burn(address from, uint256 amount) external;
function delegate(address delegatee) external;
```

### ISNADRegistry

将资源铭刻永久存储在链上。

**特性：**
- 资源通过 SHA-256 内容哈希标识
- 元数据存储在 calldata 中（铭刻方式）
- 支持大文件分块上传
- 铭刻后不可篡改

**核心函数：**
```solidity
function inscribe(
    bytes32 contentHash,
    uint8 resourceType,
    bytes calldata metadata,
    bytes calldata content
) external returns (bytes32);

function getResource(bytes32 contentHash) external view returns (
    bool inscribed,
    address author,
    uint256 blockNumber,
    string memory metadataUri
);
```

### ISNADStaking

核心认证机制。

**特性：**
- 审计者对资源进行质押
- 可配置锁定期（7-90 天）
- 带乘数的信任分数计算
- Oracle 裁决后执行惩罚

**核心函数：**
```solidity
function stake(
    bytes32 resourceHash,
    uint256 amount,
    uint256 lockDuration
) external returns (bytes32 attestationId);

function unstake(bytes32 attestationId) external;

function getTrustScore(bytes32 resourceHash) external view returns (uint256);

function getTrustTier(bytes32 resourceHash) external view returns (uint8);

function getAttestation(bytes32 attestationId) external view returns (
    address auditor,
    bytes32 resourceHash,
    uint256 amount,
    uint256 lockUntil,
    uint256 lockDuration,
    bool slashed
);
```

### ISNADOracle

检测与陪审团系统。

**特性：**
- 标记恶意资源
- 随机选择陪审团（5 名成员）
- 67% 绝对多数通过裁决
- 支持申诉（需 2 倍保证金）

**核心函数：**
```solidity
function flag(
    bytes32 resourceHash,
    string calldata evidence
) external;

function vote(bytes32 flagId, uint8 verdict) external;

function executeVerdict(bytes32 flagId) external;

function appeal(bytes32 flagId) external;
```

### ISNADRewardPool

向审计者分配收益。

**特性：**
- 收益基于质押数量和锁定时长
- 锁定乘数：30 天=1x，60 天=1.25x，90 天=1.5x
- 由协议费用和国库资金支持
- APY 可通过治理调整

**核心函数：**
```solidity
function claimRewards() external;

function calculateRewards(address auditor) external view returns (uint256);
```

### ISNADGovernor + TimelockController

协议升级的 DAO 治理。

**特性：**
- 基于 OpenZeppelin Governor 模式
- 执行前 2 天时间锁
- 4% 法定人数要求
- 提案门槛：100,000 $ISNAD

**可治理参数：**
- 信任等级阈值
- 锁定期限制
- 奖励池 APY
- 标记保证金金额
- 合约升级

## 信任等级阈值

| 等级 | 枚举值 | 阈值 |
|------|--------|------|
| UNVERIFIED | 0 | 0 |
| COMMUNITY | 1 | 100 $ISNAD |
| VERIFIED | 2 | 1,000 $ISNAD |
| TRUSTED | 3 | 10,000 $ISNAD |

## 锁定期乘数

| 时长 | 乘数 | 加权分数 |
|------|------|---------|
| 7 天 | 1.0x | 质押量 × 1.0 |
| 30 天 | 1.0x | 质押量 × 1.0 |
| 60 天 | 1.25x | 质押量 × 1.25 |
| 90 天 | 1.5x | 质押量 × 1.5 |

## 集成示例

使用 viem：

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { ISNADStakingABI, ISNADTokenABI } from '@isnad/contracts';

const STAKING_ADDRESS = '0x58983D142A388A96B7d9F970005483AA044CCAD9';
const TOKEN_ADDRESS = '0xc41c1006A1AaC093C758A2f09de16fee2561651A';

// 读取信任分数
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const trustScore = await publicClient.readContract({
  address: STAKING_ADDRESS,
  abi: ISNADStakingABI,
  functionName: 'getTrustScore',
  args: [resourceHash],
});

// 质押 token（需要钱包）
const walletClient = createWalletClient({ ... });

// 1. 授权
await walletClient.writeContract({
  address: TOKEN_ADDRESS,
  abi: ISNADTokenABI,
  functionName: 'approve',
  args: [STAKING_ADDRESS, amount],
});

// 2. 质押
await walletClient.writeContract({
  address: STAKING_ADDRESS,
  abi: ISNADStakingABI,
  functionName: 'stake',
  args: [resourceHash, amount, lockDuration],
});
```

## 安全性

- 所有合约使用 OpenZeppelin 库
- 已完成 Slither 静态分析
- 所有输入均有零地址检查
- 状态变更函数使用 ReentrancyGuard
- 基于角色的访问控制

## 源代码

所有合约均为开源，已在 BaseScan 上验证：

- GitHub：https://github.com/counterspec/isnad/tree/main/contracts
- BaseScan：https://sepolia.basescan.org/address/[contract_address]
