# Quick Start

Check your first resource's trust score in under 2 minutes.

## 1. Via Web Interface

The fastest way to check trust is through the web app:

1. Go to [Trust Checker](/check)
2. Paste a skill URL, package name, or content hash
3. View the trust score, tier, and auditor chain

## 2. Via API

Query trust scores programmatically:

```bash
# Get trust info for a resource
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# Response
{
  "trustScore": "2500000000000000000000",
  "trustTier": "VERIFIED",
  "attestations": [...]
}
```

## 3. Via Smart Contract

Read trust scores directly from the chain:

```typescript
import { ISNADStaking } from "@isnad/contracts";

const staking = ISNADStaking.attach(STAKING_ADDRESS);
const score = await staking.getTrustScore(resourceHash);
const tier = await staking.getTrustTier(resourceHash);
```

## Computing Content Hashes

ISNAD uses SHA-256 for content hashing. To compute a hash locally:

```bash
# Using OpenSSL
cat skill.md | sha256sum

# Using Node.js
const crypto = require("crypto");
const hash = crypto.createHash("sha256")
  .update(content)
  .digest("hex");
```

---

**Next:** Ready to stake and earn yield? See the [Auditor Guide](/docs/auditors).
