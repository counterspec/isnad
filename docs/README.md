# ISNAD Documentation

ISNAD (إسناد) is a decentralized trust layer for AI resources. This documentation covers everything you need to know about using and contributing to the protocol.

## Quick Links

- **[What is ISNAD?](./what-is-isnad.md)** — Overview and core concepts
- **[For Auditors](./auditors.md)** — How to stake and earn yield
- **[Staking Guide](./staking.md)** — Step-by-step staking instructions
- **[Jury System](./jury.md)** — How slashing and appeals work
- **[API Reference](./api.md)** — REST API documentation
- **[Smart Contracts](./contracts.md)** — On-chain architecture

## Getting Started

### Check Trust Score

The simplest way to use ISNAD is to check a resource's trust score:

```bash
# Via API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# Via Web
Visit https://isnad.md/check
```

### Become an Auditor

1. Get $ISNAD tokens on Base network
2. Connect wallet at https://isnad.md/stake
3. Review a resource's code
4. Stake tokens to create an attestation
5. Earn yield when your lock period ends

## Trust Tiers

| Tier | Minimum Stake | Meaning |
|------|---------------|---------|
| UNVERIFIED | 0 | No attestations |
| COMMUNITY | 100 $ISNAD | Some community trust |
| VERIFIED | 1,000 $ISNAD | Multiple auditors with significant stake |
| TRUSTED | 10,000 $ISNAD | Heavily audited, high confidence |

## Resources

- **Website:** https://isnad.md
- **API:** https://api.isnad.md
- **GitHub:** https://github.com/counterspec/isnad
- **Twitter:** https://x.com/isnad_protocol
