# Auditor Guide

Become an ISNAD auditor to verify AI agent skills and earn staking rewards.

## What is an Auditor?

Auditors are the trust backbone of ISNAD. They:
- Review agent skills for security vulnerabilities
- Stake ISNAD tokens to back their attestations  
- Earn rewards for accurate assessments
- Risk slashing for false attestations

## Requirements

1. **Minimum stake:** 100 ISNAD tokens
2. **Technical ability:** Can review code for security issues
3. **Wallet:** Base-compatible wallet (MetaMask, Rainbow, etc.)

## Getting Started

### 1. Stake Tokens

First, stake ISNAD to activate your auditor status:

```typescript
// Approve and stake
await isnadToken.approve(stakingAddress, amount);
await stakingContract.stake(amount);
```

### 2. Find Skills to Review

Browse unverified skills:
- [ISNAD Dashboard](/check) - See pending skills
- [ClawHub](https://clawhub.com) - Agent skill marketplace
- Direct submissions from skill authors

### 3. Review & Attest

After reviewing a skill's code:

```typescript
// Positive attestation (skill is safe)
await stakingContract.attest(skillHash, true);

// Negative attestation (skill is malicious)
await stakingContract.attest(skillHash, false);
```

### 4. Earn Rewards

- **Per attestation:** 0.1% of your stake
- **Monthly pool:** Top auditors share protocol fees
- **Governance:** Voting rewards in ISNAD

## Review Checklist

When reviewing a skill, check for:

- [ ] Credential harvesting (env vars, config files)
- [ ] Code exfiltration (base64, external fetches)
- [ ] Unauthorized network calls
- [ ] Subprocess spawning
- [ ] File system access patterns
- [ ] Obfuscated or minified code

**Tip:** Use `isnad-scan` CLI for automated detection:

```bash
pip install isnad-scan
isnad-scan /path/to/skill
```

## Slashing

False attestations result in stake slashing:

| Offense | Penalty |
|---------|---------|
| First false positive | 10% stake |
| First false negative | 25% stake |
| Repeated offense | 50% stake |
| Malicious collusion | 100% stake |

Disputes are resolved by the [Jury](/docs/jury).
