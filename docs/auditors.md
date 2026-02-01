# Becoming an Auditor

Auditors stake $ISNAD tokens to vouch for resource safety and earn yield for accurate attestations.

## Requirements

- **$ISNAD tokens** on Base network
- **Wallet** connected (MetaMask, Coinbase Wallet, etc.)
- **Technical ability** to assess code safety
- **Willingness to lock** tokens for 7-90 days

## How It Works

### 1. Review a Resource
Before staking, thoroughly review the resource:
- Read all source code
- Check for malicious patterns (data exfiltration, unauthorized execution)
- Verify external API calls
- Review permission requests and capability requirements
- Audit dependencies

### 2. Stake Your Tokens
Choose an amount and lock duration:
- More stake = higher contribution to trust score
- Longer lock = higher yield multiplier

### 3. Create Attestation
Your stake is recorded on-chain, contributing to the resource's trust score.

### 4. Wait for Lock Period
Tokens are locked. If the resource is flagged and found malicious, you may be slashed.

### 5. Claim Rewards
After lock expires, withdraw your stake + earned yield from the reward pool.

## Earning Potential

Yield is calculated based on:

| Factor | Impact |
|--------|--------|
| Stake amount | More tokens = higher base yield |
| Lock duration | Longer lock = higher multiplier |
| Pool APY | Currently ~10% base (adjustable via governance) |

### Lock Multipliers

| Duration | Multiplier |
|----------|------------|
| 7 days | 1.0x |
| 30 days | 1.0x |
| 60 days | 1.25x |
| 90 days | 1.5x |
| 180 days | 2.0x |
| 365 days | 3.0x |

### Example Calculation

```
1,000 $ISNAD staked for 90 days at 10% APY:
→ Base yield: 1000 × 0.10 × (90/365) = 24.66 $ISNAD
→ With 1.5x multiplier: 36.99 $ISNAD
```

## Risks

### Slashing
If a resource you attested is found malicious, **your entire stake is burned**. This is the core mechanism that makes ISNAD work — auditors must have skin in the game.

### Lock Period
Tokens cannot be withdrawn until the lock expires. Choose durations you're comfortable with.

### Smart Contract Risk
Like all DeFi protocols, there's inherent smart contract risk. Contracts have been audited but bugs are always possible.

## Best Practices

1. **Only stake on code you've reviewed** — Don't stake based on reputation alone
2. **Start small** — Build experience with smaller stakes first
3. **Diversify** — Don't put all your stake on one resource
4. **Stay informed** — Monitor flagged resources in case of appeals
5. **Document your reviews** — Keep notes on what you audited

## What Gets Slashed

Resources that may result in slashing:

- **Data exfiltration** — Sending credentials, PII, or sensitive data externally
- **Unauthorized execution** — Running commands outside declared scope
- **Behavior manipulation** — Altering agent behavior maliciously
- **Supply chain attacks** — Compromised dependencies
- **Misrepresentation** — Metadata claiming safe behavior that differs from code

## Getting Started

1. Go to https://isnad.md/stake
2. Connect your wallet
3. Search for a resource you've reviewed
4. Set your stake amount and lock duration
5. Approve token spend
6. Create your attestation

See the [Staking Guide](./staking.md) for detailed step-by-step instructions.
