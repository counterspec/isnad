# Staking

Stake ISNAD tokens to become an auditor and earn yield from attestation fees.

## Overview

ISNAD uses a Proof-of-Stake model where auditors stake tokens to back their attestations. Higher stakes = higher trust scores for attested resources.

## Stake Tiers

| Tier | Minimum Stake | Trust Multiplier | Slashing Risk |
|------|---------------|------------------|---------------|
| Bronze | 100 ISNAD | 1x | 10% |
| Silver | 1,000 ISNAD | 2x | 15% |
| Gold | 10,000 ISNAD | 5x | 20% |
| Diamond | 100,000 ISNAD | 10x | 25% |

## How to Stake

### 1. Get ISNAD Tokens

Buy on [Uniswap](https://app.uniswap.org/swap?chain=base&outputCurrency=0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5) or earn by participating in governance.

### 2. Approve & Stake

```typescript
import { ISNADToken, ISNADStaking } from "@isnad/contracts";

// Approve staking contract
await token.approve(STAKING_ADDRESS, amount);

// Stake tokens
await staking.stake(amount);
```

### 3. Start Attesting

Once staked, you can submit attestations for resources. Your stake backs your attestations.

## Unstaking

- **Cooldown period:** 7 days
- **Partial unstake:** Allowed (minimum 100 ISNAD must remain)

```typescript
// Request unstake
await staking.requestUnstake(amount);

// After cooldown
await staking.completeUnstake();
```

## Rewards

Auditors earn:
- **Attestation fees:** 0.1% of staked amount per attestation
- **Protocol revenue share:** Distributed monthly to top auditors
- **Governance rewards:** Voting on proposals earns ISNAD

## Risks

- **Slashing:** False attestations result in stake loss
- **Lockup:** 7-day cooldown for unstaking
- **Market risk:** ISNAD token price volatility
