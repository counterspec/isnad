# What is ISNAD?

ISNAD (إسناد) is a Proof-of-Stake attestation protocol that creates a trust layer for AI resources. The name comes from the Islamic scholarly tradition of _isnad_ — the chain of transmission used to authenticate hadith. A saying is only as trustworthy as its chain of narrators.

## The Problem

AI agents increasingly rely on shared resources from untrusted sources:
- **Skills** — Executable code packages, tools, API integrations
- **Configs** — Agent configurations, gateway settings
- **Prompts** — System prompts, personas, behavioral instructions
- **Memory** — Knowledge bases, RAG documents
- **Models** — Fine-tunes, LoRAs, adapters

A single compromised resource can:
- Exfiltrate credentials and sensitive data
- Execute unauthorized commands
- Manipulate agent behavior
- Compromise entire systems

Current approaches don't scale:
- **Manual code review** — Most agents can't audit
- **Central approval** — Single point of failure, bottleneck
- **Reputation scores** — Gameable, new authors can't bootstrap
- **Sandboxing** — Incomplete, many resources need real permissions

## The Solution

ISNAD creates a market-priced trust signal through economic incentives:

1. **Resources are inscribed** on Base L2 with content and metadata
2. **Auditors stake $ISNAD tokens** to vouch for resource safety
3. **Stakes are locked** for a time period (7-90 days)
4. **If malicious**, a jury reviews and stakes are slashed (burned)
5. **If clean**, auditors earn yield from the reward pool

### Why This Works

- **Skin in the game** — Auditors risk real value. False attestations burn tokens.
- **Self-selecting expertise** — Only confident auditors stake. The market filters for competence.
- **Permanently verifiable** — Everything on-chain. No trust in external infrastructure.
- **Attack resistant** — Sybil attacks require capital. Collusion burns all colluders.

## On-Chain Inscriptions

Unlike IPFS-based approaches that require pinning services, ISNAD inscribes resources directly on Base L2 calldata:

- **~$0.01 per KB** inscribed
- **Forever** on-chain storage
- **Zero** external dependencies

Resources are content-addressed using SHA-256 hashes, ensuring integrity verification is always possible.

## Key Concepts

### Trust Score
The total weighted stake on a resource. Higher stake = more economic backing = higher trust.

### Trust Tier
A classification based on trust score:
- **UNVERIFIED** — No attestations
- **COMMUNITY** — ≥100 $ISNAD staked
- **VERIFIED** — ≥1,000 $ISNAD staked
- **TRUSTED** — ≥10,000 $ISNAD staked

### Attestation
When an auditor stakes on a resource, they create an attestation with:
- Stake amount
- Lock duration
- Resource hash
- Auditor address

### Slashing
If a resource is found malicious:
1. Anyone can flag it (100 $ISNAD deposit)
2. Random jury of 5 auditors is selected
3. Jury votes (67% supermajority required)
4. If GUILTY: all stakes on that resource are burned
5. Flagger gets deposit back + reward

## Protocol Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ISNAD Protocol                         │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  ISNADToken  │ ISNADRegistry│ ISNADStaking │  ISNADOracle  │
│  (ERC20 +    │  (inscribe   │  (stake +    │  (flag +      │
│   votes)     │   + metadata)│   attest)    │   jury)       │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  ISNADRewardPool        │        ISNADGovernor             │
│  (yield distribution)   │        (DAO + timelock)          │
└─────────────────────────┴──────────────────────────────────┘
```

## Next Steps

- [Become an Auditor](./auditors.md) — Start staking and earning
- [Staking Guide](./staking.md) — Step-by-step instructions
- [Integration Guide](./integration.md) — Add trust checks to your agent
