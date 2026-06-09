# API 参考

用于查询信任评分、资源和审计员数据的 REST API。

**基础 URL：** `https://api.isnad.md`

## 端点

### 获取协议统计

```
GET /api/v1/stats
```

返回协议范围的统计数据。

**响应：**
```json
{
  "success": true,
  "stats": {
    "resources": 142,
    "attestations": 1847,
    "auditors": 38,
    "totalStaked": "4250000000000000000000000",
    "tiers": {
      "UNVERIFIED": 45,
      "COMMUNITY": 52,
      "VERIFIED": 38,
      "TRUSTED": 7
    },
    "lastSyncedBlock": "12345678",
    "lastSyncedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 获取信任信息

```
GET /api/v1/trust/:hash
```

获取资源的信任评分和认证。

**参数：**
- `hash` — 资源内容哈希（0x...）

**响应：**
```json
{
  "success": true,
  "resource": {
    "hash": "0x1234...abcd",
    "type": "SKILL",
    "name": "weather",
    "author": "0x...",
    "version": "1.0.0",
    "inscribedAt": "2024-01-10T08:00:00Z",
    "blockNumber": 12345000
  },
  "trustScore": "2500000000000000000000",
  "trustTier": "VERIFIED",
  "attestations": [
    {
      "id": "0x...",
      "auditor": "0x...",
      "amount": "1000000000000000000000",
      "lockUntil": 1705420800,
      "lockDuration": 2592000,
      "slashed": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 列出资源

```
GET /api/v1/resources
```

列出已铭刻的资源，支持可选过滤。

**查询参数：**
| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| type | string | 按类型过滤（SKILL、CONFIG、PROMPT 等） |
| limit | number | 最大结果数（默认 20，最大 100） |
| offset | number | 分页偏移量 |

**响应：**
```json
{
  "success": true,
  "resources": [
    {
      "hash": "0x...",
      "type": "SKILL",
      "name": "weather",
      "author": "0x...",
      "version": "1.0.0",
      "trustScore": "2500000000000000000000",
      "trustTier": 2,
      "inscribedAt": "2024-01-10T08:00:00Z",
      "blockNumber": 12345000
    }
  ],
  "total": 142
}
```

### 获取单个资源

```
GET /api/v1/resources/:hash
```

通过哈希获取单个资源。

**响应：**
```json
{
  "success": true,
  "resource": {
    "hash": "0x...",
    "type": "SKILL",
    "name": "weather",
    "author": "0x...",
    "version": "1.0.0",
    "metadata": { ... },
    "trustScore": "2500000000000000000000",
    "trustTier": 2,
    "inscribedAt": "2024-01-10T08:00:00Z",
    "blockNumber": 12345000
  }
}
```

### 获取审计员列表

```
GET /api/v1/auditors
```

获取审计员排行榜。

**查询参数：**
| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| limit | number | 最大结果数（默认 10，最大 100） |

**响应：**
```json
{
  "success": true,
  "auditors": [
    {
      "address": "0x...",
      "totalStaked": "45000000000000000000000",
      "attestationCount": 127,
      "accuracy": 99.2,
      "burnCount": 1
    }
  ]
}
```

### 健康检查

```
GET /health
```

健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## 错误响应

所有错误返回统一格式：

```json
{
  "success": false,
  "error": "Resource not found"
}
```

**HTTP 状态码：**
| 代码 | 含义 |
|------|---------|
| 200 | 成功 |
| 400 | 错误请求（参数无效） |
| 404 | 资源未找到 |
| 429 | 超出速率限制 |
| 500 | 服务器错误 |

## 速率限制

- 每个 IP 每分钟 100 次请求
- 响应缓存 30 秒
- 如需更高限制，请联系我们获取 API 密钥

## 代币数量

所有代币数量以 wei 返回（18 位小数）。转换方法：

```javascript
const tokens = BigInt(amount) / BigInt(1e18);
// 或用于显示：
const formatted = Number(amount) / 1e18;
```

## 使用示例

### JavaScript/TypeScript

```typescript
async function checkTrust(hash: string) {
  const res = await fetch(`https://api.isnad.md/api/v1/trust/${hash}`);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return {
    score: Number(data.trustScore) / 1e18,
    tier: data.trustTier,
    auditors: data.attestations.length,
  };
}
```

### cURL

```bash
# 获取信任信息
curl https://api.isnad.md/api/v1/trust/0x1234567890abcdef...

# 获取统计
curl https://api.isnad.md/api/v1/stats

# 列出技能
curl "https://api.isnad.md/api/v1/resources?type=SKILL&limit=10"
```

### Python

```python
import requests

def get_trust(hash: str):
    r = requests.get(f"https://api.isnad.md/api/v1/trust/{hash}")
    data = r.json()

    if not data["success"]:
        raise Exception(data["error"])

    return {
        "score": int(data["trustScore"]) / 1e18,
        "tier": data["trustTier"],
        "auditors": len(data["attestations"]),
    }
```
