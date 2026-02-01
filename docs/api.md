# API Reference

REST API for querying trust scores, resources, and auditor data.

**Base URL:** `https://api.isnad.md`

## Endpoints

### Get Protocol Stats

```
GET /api/v1/stats
```

Returns protocol-wide statistics.

**Response:**
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

### Get Trust Info

```
GET /api/v1/trust/:hash
```

Get trust score and attestations for a resource.

**Parameters:**
- `hash` — Resource content hash (0x...)

**Response:**
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

### List Resources

```
GET /api/v1/resources
```

List inscribed resources with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type (SKILL, CONFIG, PROMPT, etc.) |
| limit | number | Max results (default 20, max 100) |
| offset | number | Pagination offset |

**Response:**
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

### Get Resource

```
GET /api/v1/resources/:hash
```

Get a single resource by hash.

**Response:**
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

### Get Auditors

```
GET /api/v1/auditors
```

Get auditor leaderboard.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max results (default 10, max 100) |

**Response:**
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

### Health Check

```
GET /health
```

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## Error Responses

All errors return a consistent format:

```json
{
  "success": false,
  "error": "Resource not found"
}
```

**HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

## Rate Limits

- 100 requests per minute per IP
- Responses are cached for 30 seconds
- For higher limits, contact us about API keys

## Token Amounts

All token amounts are returned in wei (18 decimals). To convert:

```javascript
const tokens = BigInt(amount) / BigInt(1e18);
// Or for display:
const formatted = Number(amount) / 1e18;
```

## Example Usage

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
# Get trust info
curl https://api.isnad.md/api/v1/trust/0x1234567890abcdef...

# Get stats
curl https://api.isnad.md/api/v1/stats

# List skills
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
