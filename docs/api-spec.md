# ISNAD API Specification

**Base URL:** `https://api.isnad.md`  
**Version:** v1  
**Default Network:** mainnet (Base, chainId 8453)

---

## Common Patterns

### Network Selection
All endpoints accept an optional `network` query parameter:
```
?network=mainnet  (default)
?network=sepolia  (testnet)
```

### Standard Response Envelope
Every response includes network context:
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": { ... }
}
```

### Error Response
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

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_HASH` | 400 | Resource hash is not valid bytes32 |
| `INVALID_NETWORK` | 400 | Unknown network parameter |
| `RESOURCE_NOT_FOUND` | 404 | No attestations for resource |
| `AUDITOR_NOT_FOUND` | 404 | Auditor address not found |
| `RPC_ERROR` | 502 | Blockchain RPC failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Endpoints

### GET /v1/networks

Returns available networks and their status.

**Request:**
```
GET /v1/networks
```

**Response:**
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

Get the trust score and tier for a resource.

**Request:**
```
GET /v1/score/0x7f3a8b2c4d5e6f...?network=mainnet
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `resourceHash` | bytes32 | Yes | Keccak256 hash of resource content |
| `network` | string | No | `mainnet` or `sepolia` (default: mainnet) |

**Response:**
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

**Trust Tiers:**
| Tier | Threshold |
|------|-----------|
| `UNVERIFIED` | 0 |
| `COMMUNITY` | 100 ISNAD |
| `VERIFIED` | 1,000 ISNAD |
| `TRUSTED` | 10,000 ISNAD |

---

### GET /v1/resource/:resourceHash

Get detailed attestation info for a resource.

**Request:**
```
GET /v1/resource/0x7f3a8b2c...?network=mainnet
```

**Response:**
```json
{
  "success": true,
  "network": "mainnet",
  "chainId": 8453,
  "timestamp": "2026-02-01T15:00:00Z",
  "data": {
    "resourceHash": "0x7f3a8b2c...",
    "trustScore": "15000.00",
    "trustTier": "VERIFIED",
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

Get auditor profile and staking history.

**Request:**
```
GET /v1/auditor/0xABC123...?network=mainnet
```

**Response:**
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

Compute the resource hash for given content.

**Request:**
```
POST /v1/hash
Content-Type: application/json

{
  "content": "# My Skill\n\nThis skill does X, Y, Z..."
}
```

**Or with file upload:**
```
POST /v1/hash
Content-Type: multipart/form-data

file: [binary data]
```

**Response:**
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
    "inputType": "text/markdown"
  }
}
```

---

### GET /v1/stats

Get protocol-wide statistics.

**Request:**
```
GET /v1/stats?network=mainnet
```

**Response:**
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
    "resourcesByTier": {
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

Get top resources or auditors.

**Request:**
```
GET /v1/leaderboard?type=resources&limit=10&network=mainnet
GET /v1/leaderboard?type=auditors&limit=10&network=mainnet
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `resources` or `auditors` |
| `limit` | number | No | Max results (default: 10, max: 100) |
| `network` | string | No | Network selection |

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
        "trustTier": "TRUSTED",
        "auditorCount": 8
      },
      {
        "rank": 2,
        "resourceHash": "0x9a8b7c6d...",
        "trustScore": "15000.00",
        "trustTier": "VERIFIED",
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

## Rate Limits

| Tier | Requests/min | Requests/day |
|------|--------------|--------------|
| Anonymous | 60 | 1,000 |
| Authenticated | 300 | 10,000 |

**Rate limit headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706799600
```

---

## Authentication (Future)

Currently all endpoints are public. Future authenticated endpoints will use:
```
Authorization: Bearer isnad_sk_...
```

---

## Webhooks (Future)

Subscribe to events:
- `resource.attested` — New attestation on a resource
- `resource.tier_changed` — Resource crossed tier threshold
- `auditor.slashed` — Auditor stake was slashed

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ISNADClient } from '@isnad/sdk';

const client = new ISNADClient({ network: 'sepolia' });

const score = await client.getScore('0x7f3a8b2c...');
console.log(score.trustTier); // "VERIFIED"
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

## Changelog

### v1.0.0 (2026-02-01)
- Initial release
- Network selection via query parameter
- Score, resource, auditor, hash, stats, leaderboard endpoints
