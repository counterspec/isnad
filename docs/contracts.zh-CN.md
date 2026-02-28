# 智能合约

ISNAD 部署在 Base 网络上，采用模块化合约架构。

## 合约地址

### Base Sepolia (测试网)

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
│                      ISNAD 协议                             │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  ISNADToken  │ ISNADRegistry│ ISNADStaking │  ISNADOracle  │
│  (ERC20 +    │  (铭刻       │  (质押 +     │  (标记 +      │
│   投票权)    │   + 元数据)  │   认证)      │   陪审团)     │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  ISNADRewardPool        │        ISNADGovernor             │
│  (收益分配)              │        (DAO + 时间锁)            │
└─────────────────────────┴──────────────────────────────────┘
```

## 合约描述

### ISNADToken

具有治理功能的 ERC20 代币。

**特性：**
- ERC20 标准功能
- ERC20Votes 扩展用于治理
- 固定最大供应量：10 亿代币
- MINTER_ROLE：奖励池可以铸造
- BURNER_ROLE：质押合约可以销毁（惩罚）

**关键函数：**
```solidity
function mint(address to, uint256 amount) external;
function burn(address from, uint256 amount) external;
function delegate(address delegatee) external;
```

### ISNADRegistry

将资源铭刻永久存储在链上。

**特性：**
- 资源通过 SHA-256 内容哈希标识
- 元数据存储在 calldata 中（铭刻风格）
- 支持大文件分块上传
- 一旦铭刻不可更改

**关键函数：**
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
- 审计员在资源上质押代币
- 可配置的锁定期（7-90 天）
- 带乘数的信任分数计算
- Oracle 裁决时执行惩罚

**关键函数：**
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

检测和陪审团系统。

**特性：**
- 标记恶意资源
- 随机陪审团选择（5 名成员）
- 67% 超级多数裁决
- 申诉需 2 倍押金

**关键函数：**
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

向审计员分配收益。

**特性：**
- 基于质押金额和期限的收益
- 锁定乘数：30天=1x，60天=1.25x，90天=1.5x
- 由协议费用和财库资助
- 可通过治理调整 APY

**关键函数：**
```solidity
function claimRewards() external;

function calculateRewards(address auditor) external view returns (uint256);
```

### ISNADGovernor + TimelockController

用于协议升级的 DAO 治理。

**特性：**
- OpenZeppelin Governor 模式
- 执行前 2 天时间锁
- 4% 法定人数要求
- 100,000 $ISNAD 提案门槛

**可治理参数：**
- 信任等级阈值
- 锁定期限制
- 奖励池 APY
- 标记押金金额
- 合约升级

## 信任等级阈值

| 等级 | 枚举值 | 阈值 |
|------|--------|------|
| 未验证 | 0 | 0 |
| 社区 | 1 | 100 $ISNAD |
| 已验证 | 2 | 1,000 $ISNAD |
| 可信 | 3 | 10,000 $ISNAD |

## 锁定期乘数

| 期限 | 乘数 | 加权分数 |
|------|------|----------|
| 7 天 | 1.0x | 质押 × 1.0 |
| 30 天 | 1.0x | 质押 × 1.0 |
| 60 天 | 1.25x | 质押 × 1.25 |
| 90 天 | 1.5x | 质押 × 1.5 |

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

// 质押代币（需要钱包）
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

## 安全

- 所有合约使用 OpenZeppelin 库
- 完成 Slither 静态分析
- 所有输入进行零地址检查
- 状态变更函数使用 Reentrancy