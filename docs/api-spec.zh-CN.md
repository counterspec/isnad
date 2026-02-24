# ISNAD API 规范

**基础 URL:** `https://api.isnad.md`  
**版本:** v1  
**默认网络:** mainnet (Base, chainId 8453)

---

## 通用模式

### 网络选择
所有端点接受可选的 `network` 查询参数:
```
?network=mainnet  (default)
?network=sepolia  (testnet)
```

### 标准响应封装
每个响应都包含网络上下文:
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

### 错误代码
| Code | HTTP | 描述 |
|------|------|-------------|
| `INVALID_HASH` | 400 | 资源哈希不是有效的 bytes32 |
| `INVALID_NETWORK` | 400 | 未知的网络参数 |
| `RESOURCE_NOT_FOUND` | 404 | 资源无认证 |
| `AUDITOR_NOT_FOUND` | 404 | 审计员地址未找到 |
| `RPC_ERROR` | 502 | 区块链 RPC 失败 |
| `INTERNAL_ERROR` | 500 | 意外的服务器错误 |

---

## 端点

### GET /v1/networks

返回可用网络及其状态.

**请求：**
```
GET /v1/networks
```

**响应：**
```json
{
  "success": true,
  "timestamp": "2026-02-01T15:00:00Z",
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
          "staking": "0x916FFb3eB82616220b81b99f70c3B7679B9D62ca",
          "oracle": "0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd",
          "rewardPool": "0x790b0766e9e2db7c59526b247851D16bB493a95B"
        },
        "explorer": "https://basescan.org"
      },
      "sepolia": {
        "chainId": 84532,
        "name": "Base Sepolia",
        "status": "active",
        "contracts": {
          "token": "0x...",
          "registry": "0x...",
          "staking": "0x...",
          "oracle": "0x...",
          "rewardPool": "0x..."
        },
        "explorer": "https://sepolia.basescan.org"
      }
    }
  }
}
```

---

### GET /v1/score/:resourceHash

获取资源的信任分数和等级.

**请求：**
```
GET /v1/score/0x7f3a8b2c4d5e6f...?network=mainnet
```

**参数：**
| 参数 | 类型 | 必需 | 描述 |
|-------|------|----------|-------------|
| `resourceHash` | bytes32 | Yes | 资源内容的 Keccak256 哈希 |
| `network` | string | No | `mainnet` or `sepolia` (默认: mainnet) |

**响应：**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "resourceHash": "0x7f3a8b2c4d5e6f...",
    "trustScore": "15000.00",
    "trustScoreWei": "15000000000000000000000",
    "trust等级": "VERIFIED",
    "tier阈值s": {
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
|------|-----------|
| `UNVERIFIED` | 0 |
| `COMMUNITY` | 100 ISNAD |
| `VERIFIED` | 1,000 ISNAD |
| `TRUSTED` | 10,000 ISNAD |

---

### GET /v1/resource/:resourceHash

获取资源的详细认证信息.

**请求：**
```
GET /v1/resource/0x7f3a8b2c...?network=mainnet
```

**响应：**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "resourceHash": "0x7f3a8b2c...",
    "trustScore": "15000.00",
    "trust等级": "VERIFIED",
    "auditorCount": 5,
    "attestations": [
      {
        "auditor": "0xABC123...",
        "amount": "5000.00",
        "amountWei": "5000000000000000000000",
        "lockDuration": 7776000,
        "lockDurationDays": 90,
        "multiplier": "1.5",
        "effectiveStake": "7500.00",
        "stakedAt": "2026-02-01T12:00:00Z",
        "unlocksAt": "2026-05-02T12:00:00Z",
        "isLocked": true
      },
      {
        "auditor": "0xDEF456...",
        "amount": "10000.00",
        "amountWei": "10000000000000000000000",
        "lockDuration": 2592000,
        "lockDurationDays": 30,
        "multiplier": "1.0",
        "effectiveStake": "10000.00",
        "stakedAt": "2026-02-01T13:00:00Z",
        "unlocksAt": "2026-03-03T13:00:00Z",
        "isLocked": true
      }
    ]
  }
}
```

---

### GET /v1/auditor/:address

获取审计员资料和质押历史.

**请求：**
```
GET /v1/auditor/0xABC123...?network=mainnet
```

**响应：**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "address": "0xABC123...",
    "totalStaked": "25000.00",
    "activeStakes": 3,
    "resourcesAttested": 3,
    "stakingHistory": [
      {
        "resourceHash": "0x7f3a8b2c...",
        "amount": "10000.00",
        "lockDurationDays": 90,
        "stakedAt": "2026-02-01T12:00:00Z",
        "status": "active"
      },
      {
        "resourceHash": "0x9a8b7c6d...",
        "amount": "5000.00",
        "lockDurationDays": 30,
        "stakedAt": "2026-02-01T12:30:00Z",
        "status": "active"
      }
    ],
    "slashHistory": [],
    "rewardsEarned": "150.00",
    "rewardsClaimed": "0.00"
  }
}
```

---

### POST /v1/hash

计算给定内容的资源哈希.

**请求：**
```
POST /v1/hash
Content-类型: application/json

{
  "content": "# My Skill\n\nThis skill does X, Y, Z..."
}
```

**或使用文件上传:**
```
POST /v1/hash
Content-类型: multipart/form-data

file: [binary data]
```

**响应：**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "hash": "0x7f3a8b2c4d5e6f...",
    "algorithm": "keccak256",
    "inputSize": 1234,
    "input类型": "text/markdown"
  }
}
```

---

### GET /v1/stats

获取协议范围的统计数据.

**请求：**
```
GET /v1/stats?network=mainnet
```

**响应：**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "totalStaked": "8750000000.00",
    "totalAuditors": 42,
    "totalResources": 156,
    "resourcesBy等级": {
      "UNVERIFIED": 89,
      "COMMUNITY": 45,
      "VERIFIED": 18,
      "TRUSTED": 4
    },
    "rewardPoolBalance": "50000000.00",
    "totalRewardsDistributed": "1500.00",
    "averageStakePerResource": "56089.74",
    "averageLockDuration": 45.3
  }
}
```

---

### GET /v1/leaderboard

获取顶级资源或审计员.

**请求：**
```
GET /v1/leaderboard?type=resources&limit=10&network=mainnet
GET /v1/leaderboard?type=auditors&limit=10&network=mainnet
```

**参数：**
| 参数 | 类型 | 必需 | 描述 |
|-------|------|----------|-------------|
| `type` | string | Yes | `resources` or `auditors` |
| `limit` | number | No | 最大结果数 (default: 10, max: 100) |
| `network` | string | No | 网络选择 |

**Response (resources):**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "type": "resources",
    "items": [
      {
        "rank": 1,
        "resourceHash": "0x7f3a8b2c...",
        "trustScore": "25000.00",
        "trust等级": "TRUSTED",
        "auditorCount": 8
      },
      {
        "rank": 2,
        "resourceHash": "0x9a8b7c6d...",
        "trustScore": "15000.00",
        "trust等级": "VERIFIED",
        "auditorCount": 5
      }
    ]
  }
}
```

**Response (auditors):**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "type": "auditors",
    "items": [
      {
        "rank": 1,
        "address": "0xABC123...",
        "totalStaked": "50000.00",
        "resourcesAttested": 12,
        "slashCount": 0
      },
      {
        "rank": 2,
        "address": "0xDEF456...",
        "totalStaked": "35000.00",
        "resourcesAttested": 8,
        "slashCount": 0
      }
    ]
  }
}
```

---

## 速率限制

| 等级 | 请求/分钟 | 请求/天 |
|------|--------------|--------------|
| Anonymous | 60 | 1,000 |
| Authenticated | 300 | 10,000 |

**速率限制头：**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706799600
```

---

## 认证（未来）

目前所有端点都是公开的. 未来的认证端点将使用:
```
Authorization: Bearer isnad_sk_...
```

---

## Webhooks（未来）

订阅事件:
- `resource.attested` — 资源上的新认证
- `resource.tier_changed` — 资源跨越等级阈值
- `auditor.slashed` — 审计员质押被惩罚

---

## SDK 示例

### JavaScript/类型Script
```typescript
import { ISNADClient } from '@isnad/sdk';

const client = new ISNADClient({ network: 'sepolia' });

const score = await client.getScore('0x7f3a8b2c...');
console.log(score.trust等级); // "VERIFIED"
```

### Python
```python
from isnad import Client

client = Client(network="sepolia")
score = client.get_score("0x7f3a8b2c...")
print(score.trust_tier)  # "VERIFIED"
```

### cURL
```bash
curl "https://api.isnad.md/v1/score/0x7f3a8b2c...?network=sepolia"
```

---

## 更新日志

### v1.0.0 (2026-02-01)
- 初始发布
- 网络选择 via 查询参数
- Score、resource、auditor、hash、stats、leaderboard 端点
