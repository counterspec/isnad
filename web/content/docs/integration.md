# Integration Guide

Integrate ISNAD trust verification into your agent platform or skill marketplace.

## Use Cases

- **Skill marketplaces:** Show trust badges on listings
- **Agent frameworks:** Verify skills before installation
- **CI/CD pipelines:** Block untrusted dependencies
- **Wallets:** Warn users about unverified agent actions

## Quick Integration

### Option 1: API (Simplest)

```typescript
async function checkTrust(skillHash: string): Promise<TrustInfo> {
  const res = await fetch(`https://api.isnad.md/api/v1/trust/${skillHash}`);
  return res.json();
}

// Usage
const trust = await checkTrust("0x1234...abcd");
if (trust.tier === "VERIFIED" || trust.tier === "TRUSTED") {
  // Safe to install
} else {
  // Warn user or block
}
```

### Option 2: SDK

```bash
npm install @isnad/sdk
```

```typescript
import { IsnadClient, TrustTier } from "@isnad/sdk";

const isnad = new IsnadClient();

// Check trust
const trust = await isnad.getTrust(skillHash);

// Helper methods
if (trust.isVerified()) {
  console.log("✅ Skill verified by", trust.attestationCount, "auditors");
}

// Get detailed attestations
const attestations = await isnad.getAttestations(skillHash);
for (const a of attestations) {
  console.log(`Auditor ${a.auditor} staked ${a.stake} ISNAD`);
}
```

### Option 3: Smart Contract (On-chain)

For on-chain verification:

```solidity
import { IISNADStaking } from "@isnad/contracts/interfaces/IISNADStaking.sol";

contract MyAgentWallet {
    IISNADStaking public isnad;
    
    function executeSkill(bytes32 skillHash) external {
        require(
            isnad.getTrustTier(skillHash) >= TrustTier.VERIFIED,
            "Skill not verified"
        );
        // Execute skill...
    }
}
```

## Trust Tiers

| Tier | Meaning | Recommended Action |
|------|---------|-------------------|
| UNVERIFIED | No attestations | Block or warn strongly |
| PENDING | Under review | Warn, allow with confirmation |
| VERIFIED | 1+ positive attestations | Allow |
| TRUSTED | High stake backing | Allow, highlight as trusted |
| CANONICAL | Official/core skill | Allow, no warnings |

## Badge Component

Display trust status in your UI:

```tsx
import { TrustBadge } from "@isnad/react";

<TrustBadge 
  resourceHash="0x1234...abcd" 
  showScore={true}
  linkToDetails={true}
/>
```

## Webhooks

Get notified when trust status changes:

```bash
curl -X POST https://api.isnad.md/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "url": "https://your-site.com/isnad-webhook",
    "events": ["attestation.created", "trust.tier_changed"],
    "filter": { "resourceHash": "0x1234...abcd" }
  }'
```

## Content Hash Computation

ISNAD uses SHA-256. Ensure consistent hashing:

```typescript
import crypto from "crypto";

function computeIsnadHash(content: string | Buffer): string {
  return "0x" + crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}
```

## Rate Limits

| Plan | Requests/min | Webhooks |
|------|--------------|----------|
| Free | 100 | 5 |
| Pro | 1,000 | 50 |
| Enterprise | Unlimited | Unlimited |

Contact us for enterprise plans.
