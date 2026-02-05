# API Reference

ISNAD provides a REST API for querying trust scores and attestation data.

**Base URL:** `https://api.isnad.md/api/v1`

## Endpoints

### GET /trust/:resourceHash

Get trust information for a resource.

```bash
curl https://api.isnad.md/api/v1/trust/0x1234...abcd
```

**Response:**
```json
{
  "resourceHash": "0x1234...abcd",
  "trustScore": "2500000000000000000000",
  "trustTier": "VERIFIED",
  "attestationCount": 3,
  "attestations": [
    {
      "auditor": "0xABC...123",
      "stake": "1000000000000000000000",
      "timestamp": 1706745600,
      "signature": "0x..."
    }
  ]
}
```

### GET /auditors

List registered auditors.

```bash
curl https://api.isnad.md/api/v1/auditors
```

### GET /auditors/:address

Get auditor details.

```bash
curl https://api.isnad.md/api/v1/auditors/0xABC...123
```

### POST /attest

Submit an attestation (requires signature).

```bash
curl -X POST https://api.isnad.md/api/v1/attest \
  -H "Content-Type: application/json" \
  -d '{
    "resourceHash": "0x...",
    "positive": true,
    "signature": "0x..."
  }'
```

## Rate Limits

- **Public endpoints:** 100 requests/minute
- **Authenticated:** 1000 requests/minute

## SDK

For TypeScript/JavaScript, use the official SDK:

```bash
npm install @isnad/sdk
```

```typescript
import { IsnadClient } from "@isnad/sdk";

const client = new IsnadClient();
const trust = await client.getTrust("0x1234...abcd");
console.log(trust.tier); // "VERIFIED"
```
