# API 参考文档

ISNAD REST API 用于查询信任评分、资源和审计者数据。

**Base URL：** `https://api.isnad.md`
**版本：** v1
**默认网络：** mainnet（Base，chainId 8453）

---

## 通用约定

### 网络选择

所有端点接受可选的 `network` 查询参数：

```
?network=mainnet  (默认)
?network=sepolia  (测试网)
```

### 标准响应格式

每个响应包含网络上下文：

```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "No attestations found for this resource hash"
  }
}
```

### 错误码

| 错误码 | HTTP 状态码 | 描述 |
|--------|------------|------|
| `INVALID_HASH` | 400 | 资源哈希不是有效的 bytes32 |
| `INVALID_NETWORK` | 400 | 未知的网络参数 |
| `RESOURCE_NOT_FOUND` | 404 | 该资源无认证记录 |
| `AUDITOR_NOT_FOUND` | 404 | 审计者地址未找到 |
| `RPC_ERROR` | 502 | 区块链 RPC 调用失败 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## 端点

### GET /v1/networks

返回可用网络及其状态。

**响应：**
```json
{
  "success": true,
  "data": {
    "default": "mainnet",
    "networks": {
      "mainnet": {
        "chainId": 8453,
        "name": "Base",
        "status": "active",
        "contracts": {
          "token": "0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5",
          "registry": "0xb8264f3117b498ddF912EBF641B2301103D80f06",
          "staking": "0x916FFb3eB82616220b81b99f70c3B7679B9D62ca"
        },
        "explorer": "https://basescan.org"
      }
    }
  }
}
```

---

### GET /v1/score/:resourceHash

获取资源的信任评分和等级。

**参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `resourceHash` | bytes32 | 是 | 资源内容的 Keccak256 哈希 |
| `network` | string | 否 | `mainnet` 或 `sepolia`（默认：mainnet） |

**响应：**
```json
{
  "success": true,
  "data": {
    "resourceHash": "0x7f3a8b2c4d5e6f...",
    "trustScore": "15000.00",
    "trustScoreWei": "15000000000000000000000",
    "trustTier": "VERIFIED",
    "tierThresholds": {
      "COMMUNITY": "100",
      "VERIFIED": "1000",
      "TRUSTED": "10000"
    },
    "auditorCount": 5,
    "totalStaked": "15000.00",
    "oldestAttestation": "2026-02-01T12:00:00Z",
    "newestAttestation": "2026-02-01T14:30:00Z"
  }
}
```

**信任等级：**

| 等级 | 阈值 |
|------|------|
| `UNVERIFIED` | 0 |
| `COMMUNITY` | 100 ISNAD |
| `VERIFIED` | 1,000 ISNAD |
| `TRUSTED` | 10,000 ISNAD |

---

### GET /v1/resource/:resourceHash

获取资源的详细认证信息。

**响应：**
```json
{
  "success": true,
  "data": {
    "resourceHash": "0x7f3a8b2c...",
    "trustScore": "15000.00",
    "trustTier": "VERIFIED",
    "auditorCount": 5,
    "attestations": [
      {
        "auditor": "0xABC123...",
        "amount": "5000.00",
        "lockDuration": 7776000,
        "lockDurationDays": 90,
        "multiplier": "1.5",
        "effectiveStake": "7500.00",
        "stakedAt": "2026-02-01T12:00:00Z",
        "unlocksAt": "2026-05-02T12:00:00Z",
        "isLocked": true
      }
    ]
  }
}
```

---

### GET /v1/auditor/:address

获取审计者资料和质押历史。

**响应：**
```json
{
  "success": true,
  "data": {
    "address": "0xABC123...",
    "totalStaked": "25000.00",
    "activeStakes": 3,
    "resourcesAttested": 3,
    "stakingHistory": [...],
    "slashHistory": [],
    "rewardsEarned": "150.00",
    "rewardsClaimed": "0.00"
  }
}
```

---

### POST /v1/hash

计算给定内容的资源哈希。

**请求：**
```json
{
  "content": "# My Skill\n\nThis skill does X, Y, Z..."
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "hash": "0x7f3a8b2c4d5e6f...",
    "algorithm": "keccak256",
    "inputSize": 1234,
    "inputType": "text/markdown"
  }
}
```

---

### GET /v1/stats

获取协议全局统计。

**响应：**
```json
{
  "success": true,
  "data": {
    "totalStaked": "8750000000.00",
    "totalAuditors": 42,
    "totalResources": 156,
    "resourcesByTier": {
      "UNVERIFIED": 89,
      "COMMUNITY": 45,
      "VERIFIED": 18,
      "TRUSTED": 4
    },
    "rewardPoolBalance": "50000000.00",
    "totalRewardsDistributed": "1500.00"
  }
}
```

---

### GET /v1/leaderboard

获取资源或审计者排行榜。

**参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `type` | string | 是 | `resources` 或 `auditors` |
| `limit` | number | 否 | 最大返回数（默认：10，最大：100） |
| `network` | string | 否 | 网络选择 |

**示例：**
```bash
curl "https://api.isnad.md/v1/leaderboard?type=resources&limit=10"
curl "https://api.isnad.md/v1/leaderboard?type=auditors&limit=10"
```

---

## 速率限制

| 层级 | 请求数/分钟 | 请求数/天 |
|------|------------|----------|
| 匿名 | 60 | 1,000 |
| 认证用户 | 300 | 10,000 |

**速率限制响应头：**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706799600
```

---

## 代币金额

所有代币金额以 wei 返回（18 位小数）。转换方法：

```javascript
const tokens = BigInt(amount) / BigInt(1e18);
// 或用于显示：
const formatted = Number(amount) / 1e18;
```

---

## SDK 示例

### JavaScript/TypeScript

```typescript
import { ISNADClient } from '@isnad/sdk';

const client = new ISNADClient({ network: 'mainnet' });

const score = await client.getScore('0x7f3a8b2c...');
console.log(score.trustTier); // "VERIFIED"
```

### Python

```python
from isnad import Client

client = Client(network="mainnet")
score = client.get_score("0x7f3a8b2c...")
print(score.trust_tier)  # "VERIFIED"
```

### cURL

```bash
# 查询信任评分
curl "https://api.isnad.md/v1/score/0x7f3a8b2c..."

# 查询统计
curl "https://api.isnad.md/v1/stats"

# 列出技能资源
curl "https://api.isnad.md/v1/leaderboard?type=resources&limit=10"
```

---

## 更新日志

### v1.0.0 (2026-02-01)
- 初始发布
- 通过查询参数选择网络
- 评分、资源、审计者、哈希、统计、排行榜端点
