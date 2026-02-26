# API 参考

ISNAD REST API 文档 — 查询信任分数、资源信息、审计者数据。

## 基础信息

**Base URL:** `https://api.isnad.md/api/v1`

**认证:** 大多数读取操作无需认证。写入操作需要签名。

**速率限制:**
- 未认证：100 请求/分钟
- 认证：1000 请求/分钟

**响应格式:** JSON

## 端点

### 资源查询

#### 获取资源信息

```http
GET /resource/{hash}
```

**参数：**
- `hash` (string, required) — 资源哈希（0x...）

**响应：**

```json
{
  "hash": "0x7f3a8b2c...",
  "type": "SKILL",
  "inscription": "base:0x1234...",
  "metadata": {
    "name": "weather-skill",
    "version": "1.2.0",
    "author": "0xabcd...",
    "description": "Get weather forecasts",
    "license": "MIT",
    "contentType": "application/javascript",
    "size": 4096
  },
  "trust": {
    "totalStaked": 1000,
    "auditorCount": 3,
    "tier": "VERIFIED",
    "tierBadge": "✅"
  },
  "createdAt": "2026-02-15T10:30:00Z",
  "updatedAt": "2026-02-20T14:20:00Z"
}
```

#### 获取资源内容

```http
GET /resource/{hash}/content
```

**响应：** 原始资源内容（根据 contentType）

```javascript
// 示例：JavaScript skill
async function getWeather(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}`
  );
  return response.json();
}

module.exports = { getWeather };
```

#### 获取信任分数

```http
GET /trust/{hash}
```

**响应：**

```json
{
  "hash": "0x7f3a8b2c...",
  "totalStaked": 1000,
  "auditorCount": 3,
  "tier": "VERIFIED",
  "attestations": [
    {
      "auditor": "0x1111...",
      "amount": 500,
      "lockDays": 90,
      "startDate": "2026-02-15",
      "unlockDate": "2026-05-16",
      "reputation": 0.982
    },
    {
      "auditor": "0x2222...",
      "amount": 300,
      "lockDays": 90,
      "startDate": "2026-02-16",
      "unlockDate": "2026-05-17",
      "reputation": 0.917
    },
    {
      "auditor": "0x3333...",
      "amount": 200,
      "lockDays": 30,
      "startDate": "2026-02-20",
      "unlockDate": "2026-03-22",
      "reputation": 1.0
    }
  ],
  "history": {
    "flags": 0,
    "slashes": 0,
    "daysClean": 11
  }
}
```

#### 列出资源

```http
GET /resources
```

**查询参数：**
- `type` (string, optional) — 资源类型（SKILL, CONFIG, PROMPT, etc.）
- `tier` (string, optional) — 信任等级（UNVERIFIED, REVIEWED, VERIFIED, TRUSTED, CERTIFIED）
- `author` (string, optional) — 作者地址
- `minStake` (number, optional) — 最低质押量
- `limit` (number, optional, default: 20) — 每页数量
- `offset` (number, optional, default: 0) — 偏移量

**响应：**

```json
{
  "total": 156,
  "limit": 20,
  "offset": 0,
  "resources": [
    {
      "hash": "0x7f3a8b2c...",
      "name": "weather-skill",
      "type": "SKILL",
      "tier": "VERIFIED",
      "totalStaked": 1000,
      "auditorCount": 3,
      "createdAt": "2026-02-15T10:30:00Z"
    }
    // ... 更多资源
  ]
}
```

### 审计者查询

#### 获取审计者信息

```http
GET /auditor/{address}
```

**响应：**

```json
{
  "address": "0x1111...",
  "stats": {
    "totalStaked": 5000,
    "activeStakes": 8,
    "completedAudits": 47,
    "slashes": 0,
    "accuracy": 0.982,
    "reputation": 0.982
  },
  "earnings": {
    "totalEarned": 387.5,
    "pendingRewards": 42.3
  },
  "jury": {
    "casesParticipated": 12,
    "votingAccuracy": 0.917,
    "totalEarned": 156.8
  }
}
```

#### 获取审计者的质押

```http
GET /auditor/{address}/stakes
```

**查询参数：**
- `status` (string, optional) — active, unlocked, slashed

**响应：**

```json
{
  "stakes": [
    {
      "id": "stake-123",
      "resource": "0x7f3a8b2c...",
      "resourceName": "weather-skill",
      "amount": 1000,
      "lockDays": 90,
      "startDate": "2026-02-15",
      "unlockDate": "2026-05-16",
      "status": "active",
      "expectedYield": 19.73
    }
    // ... 更多质押
  ]
}
```

### 案件查询

#### 获取案件信息

```http
GET /case/{caseId}
```

**响应：**

```json
{
  "id": "case-12345",
  "resource": "0x7f3a8b2c...",
  "resourceName": "weather-skill v1.2.0",
  "flagger": "0xabcd...",
  "severity": "critical",
  "evidence": "base:0xef01...",
  "status": "voting",
  "jury": [
    {
      "address": "0x1111...",
      "vote": null,
      "reputation": 0.982
    }
    // ... 6 more jurors
  ],
  "deadline": "2026-02-29T23:59:59Z",
  "createdAt": "2026-02-26T10:00:00Z"
}
```

#### 列出案件

```http
GET /cases
```

**查询参数：**
- `status` (string, optional) — pending, voting, decided, appealed
- `resource` (string, optional) — 资源哈希
- `juror` (string, optional) — 陪审员地址

**响应：**

```json
{
  "cases": [
    {
      "id": "case-12345",
      "resource": "0x7f3a8b2c...",
      "severity": "critical",
      "status": "voting",
      "deadline": "2026-02-29T23:59:59Z"
    }
    // ... 更多案件
  ]
}
```

### 统计数据

#### 获取协议统计

```http
GET /stats
```

**响应：**

```json
{
  "protocol": {
    "totalResources": 1247,
    "totalStaked": 1250000,
    "totalAuditors": 342,
    "totalSlashed": 15000,
    "totalRewarded": 87500
  },
  "tiers": {
    "UNVERIFIED": 856,
    "REVIEWED": 234,
    "VERIFIED": 123,
    "TRUSTED": 28,
    "CERTIFIED": 6
  },
  "types": {
    "SKILL": 678,
    "CONFIG": 234,
    "PROMPT": 189,
    "MEMORY": 98,
    "MODEL": 34,
    "API": 14
  },
  "cases": {
    "total": 23,
    "pending": 2,
    "decided": 21,
    "malicious": 8,
    "clean": 13
  }
}
```

## 写入操作

### 铭刻资源

```http
POST /inscribe
```

**请求体：**

```json
{
  "type": "SKILL",
  "metadata": {
    "name": "weather-skill",
    "version": "1.2.0",
    "author": "0xYourAddress",
    "description": "Get weather forecasts",
    "license": "MIT",
    "contentType": "application/javascript"
  },
  "content": "base64_encoded_content",
  "signature": "0x..."
}
```

**响应：**

```json
{
  "hash": "0x7f3a8b2c...",
  "inscription": "base:0x1234...",
  "txHash": "0xabcd...",
  "status": "pending"
}
```

### 质押认证

```http
POST /attest
```

**请求体：**

```json
{
  "resourceHash": "0x7f3a8b2c...",
  "amount": "1000",
  "lockDays": 90,
  "signature": "0x..."
}
```

**响应：**

```json
{
  "stakeId": "stake-456",
  "txHash": "0xef01...",
  "unlockDate": "2026-05-16",
  "expectedYield": 19.73
}
```

### 举报资源

```http
POST /flag
```

**请求体：**

```json
{
  "resourceHash": "0x7f3a8b2c...",
  "severity": "critical",
  "evidence": "base64_encoded_evidence",
  "description": "Exfiltrates API keys",
  "signature": "0x..."
}
```

**响应：**

```json
{
  "caseId": "case-789",
  "evidenceHash": "base:0x2345...",
  "txHash": "0x3456...",
  "juryDeadline": "2026-02-29T23:59:59Z"
}
```

## Webhooks

订阅事件通知：

```http
POST /webhooks
```

**请求体：**

```json
{
  "url": "https://your-server.com/webhook",
  "events": [
    "resource_flagged",
    "new_version",
    "jury_selected",
    "stake_unlocked",
    "verdict_decided"
  ],
  "filters": {
    "auditor": "0xYourAddress",
    "resources": ["0x7f3a8b2c..."]
  },
  "signature": "0x..."
}
```

**Webhook 负载示例：**

```json
{
  "event": "resource_flagged",
  "timestamp": "2026-02-26T15:30:00Z",
  "data": {
    "caseId": "case-789",
    "resource": "0x7f3a8b2c...",
    "severity": "critical",
    "flagger": "0xabcd..."
  }
}
```

## 错误响应

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource with hash 0x... not found",
    "details": {}
  }
}
```

**错误代码：**

| 代码 | HTTP 状态 | 描述 |
|------|----------|------|
| RESOURCE_NOT_FOUND | 404 | 资源不存在 |
| INVALID_SIGNATURE | 401 | 签名无效 |
| INSUFFICIENT_STAKE | 400 | 质押量不足 |
| RATE_LIMIT_EXCEEDED | 429 | 超过速率限制 |
| INVALID_PARAMETERS | 400 | 参数错误 |
| INTERNAL_ERROR | 500 | 服务器错误 |

## SDK 示例

### JavaScript/TypeScript

```bash
npm install @isnad/sdk
```

```typescript
import { IsnadClient } from '@isnad/sdk';

const client = new IsnadClient({
  apiKey: 'your-api-key',  // 可选，提高速率限制
  network: 'mainnet'       // 或 'testnet'
});

// 查询信任分数
const trust = await client.getTrust('0x7f3a8b2c...');
console.log(`Trust tier: ${trust.tier}`);
console.log(`Total staked: ${trust.totalStaked} $ISNAD`);

// 列出资源
const resources = await client.listResources({
  type: 'SKILL',
  tier: 'VERIFIED',
  limit: 10
});

// 质押（需要钱包）
const wallet = new ethers.Wallet(privateKey);
const signer = client.connect(wallet);

await signer.attest({
  resourceHash: '0x7f3a8b2c...',
  amount: ethers.parseEther('1000'),
  lockDays: 90
});
```

### Python

```bash
pip install isnad-sdk
```

```python
from isnad import IsnadClient

client = IsnadClient(
    api_key='your-api-key',
    network='mainnet'
)

# 查询信任分数
trust = client.get_trust('0x7f3a8b2c...')
print(f"Trust tier: {trust['tier']}")
print(f"Total staked: {trust['totalStaked']} $ISNAD")

# 列出资源
resources = client.list_resources(
    type='SKILL',
    tier='VERIFIED',
    limit=10
)

# 质押（需要私钥）
from web3 import Web3
w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
account = w3.eth.account.from_key(private_key)

client.attest(
    resource_hash='0x7f3a8b2c...',
    amount=1000,
    lock_days=90,
    account=account
)
```

### CLI

```bash
npm install -g @isnad/cli
```

```bash
# 配置
isnad config set api-key YOUR_API_KEY
isnad config set network mainnet

# 查询
isnad trust 0x7f3a8b2c...
isnad list --type SKILL --tier VERIFIED

# 质押（需要私钥）
export ISNAD_PRIVATE_KEY=0x...
isnad attest 0x7f3a8b2c... --amount 1000 --lock 90

# 监控
isnad watch --auditor 0xYourAddress
```

## 速率限制

**未认证：**
- 100 请求/分钟
- 1000 请求/小时

**认证（API key）：**
- 1000 请求/分钟
- 10000 请求/小时

**超出限制响应：**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2026-02-26T16:00:00Z"
    }
  }
}
```

**响应头：**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1709049600
```

## 分页

大多数列表端点支持分页：

```http
GET /resources?limit=20&offset=40
```

**响应包含分页信息：**

```json
{
  "total": 156,
  "limit": 20,
  "offset": 40,
  "hasMore": true,
  "resources": [...]
}
```

## 过滤和排序

```http
GET /resources?type=SKILL&tier=VERIFIED&sort=stake&order=desc
```

**支持的排序字段：**
- `stake` — 按质押量
- `auditors` — 按审计者数量
- `created` — 按创建时间
- `updated` — 按更新时间

**排序顺序：**
- `asc` — 升序
- `desc` — 降序（默认）

## 批量查询

```http
POST /batch
```

**请求体：**

```json
{
  "requests": [
    { "method": "GET", "path": "/trust/0x7f3a8b2c..." },
    { "method": "GET", "path": "/trust/0x1234..." },
    { "method": "GET", "path": "/auditor/0xabcd..." }
  ]
}
```

**响应：**

```json
{
  "responses": [
    { "status": 200, "body": {...} },
    { "status": 200, "body": {...} },
    { "status": 200, "body": {...} }
  ]
}
```

## 缓存

API 响应包含缓存头：

```
Cache-Control: public, max-age=60
ETag: "abc123"
```

使用 `If-None-Match` 头进行条件请求：

```http
GET /trust/0x7f3a8b2c...
If-None-Match: "abc123"
```

如果未修改，返回 `304 Not Modified`。

## 下一步

- [智能合约文档](./contracts.md) — 直接与合约交互
- [审计者指南](./auditors.md) — 了解审计流程
- [质押指南](./staking.md) — 开始质押
