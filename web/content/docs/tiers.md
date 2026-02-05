# Trust Tiers

ISNAD uses a tiered trust system based on attestation backing.

## Tier Overview

| Tier | Score Range | Meaning |
|------|-------------|---------|
| UNVERIFIED | 0 | No attestations |
| PENDING | 1 - 999 | Under review |
| VERIFIED | 1,000 - 9,999 | Basic verification |
| TRUSTED | 10,000 - 99,999 | Strong backing |
| CANONICAL | 100,000+ | Official/core |

## How Scores Work

Trust score = sum of (auditor stake × attestation weight)

```
Score = Σ (stake_i × weight_i)
```

Where:
- `stake_i` = auditor's staked ISNAD
- `weight_i` = 1.0 for positive, -1.0 for negative

## Tier Thresholds

### UNVERIFIED (Score: 0)
- No auditors have reviewed
- **Recommendation:** Do not install

### PENDING (Score: 1-999)
- Some review activity, insufficient backing
- **Recommendation:** Wait for more attestations

### VERIFIED (Score: 1,000-9,999)
- At least 1,000 ISNAD backing
- Example: 1 Gold auditor (10,000 stake × 0.1 weight)
- **Recommendation:** Safe for general use

### TRUSTED (Score: 10,000-99,999)
- Strong community backing
- Multiple high-stake auditors agree
- **Recommendation:** High confidence

### CANONICAL (Score: 100,000+)
- Official protocol skills
- Governance-approved
- **Recommendation:** Core infrastructure

## Checking Tiers

### API

```bash
curl https://api.isnad.md/api/v1/trust/0x1234...abcd
# Response: { "trustTier": "VERIFIED", "trustScore": "2500..." }
```

### Contract

```solidity
TrustTier tier = staking.getTrustTier(resourceHash);
require(tier >= TrustTier.VERIFIED, "Insufficient trust");
```

## Tier Decay

Trust scores decay 1% monthly if no new attestations. This ensures:
- Active review of long-lived skills
- Removal of stale attestations
- Continuous auditor engagement
