# Slashing

ISNAD slashing protects the network from false attestations.

## How Slashing Works

When an auditor submits a false attestation (positive for malicious skill, or negative for safe skill), their stake is partially burned.

## Slashing Penalties

| Offense | Penalty | Cooldown |
|---------|---------|----------|
| False positive (1st) | 10% stake | 7 days |
| False positive (2nd) | 25% stake | 30 days |
| False negative | 25% stake | 30 days |
| Repeated offense | 50% stake | 90 days |
| Malicious collusion | 100% stake | Permanent ban |

## Dispute Process

1. **Challenge filed:** Anyone can challenge an attestation by staking 10 ISNAD
2. **Evidence period:** 72 hours to submit evidence
3. **Jury vote:** Random jury of 7 high-stake auditors votes
4. **Resolution:** Majority decision executes slashing or refunds challenger

## Filing a Challenge

```typescript
// Challenge a suspicious attestation
await stakingContract.challengeAttestation(
  resourceHash,
  attestationId,
  "Evidence: skill exfiltrates wallet keys via fetch()"
);
```

## Jury Selection

Jurors are randomly selected from auditors with:
- Minimum 10,000 ISNAD staked
- 90%+ accuracy rate
- No conflicts of interest (didn't attest the resource)

## Appeals

Slashed auditors can appeal within 7 days:

```typescript
await stakingContract.appealSlashing(slashingId, "Additional evidence...");
```

Appeals are reviewed by governance vote.

## Slashing Distribution

- **50%** burned (deflationary)
- **30%** to challenger
- **20%** to jury pool
