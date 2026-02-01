# Feature Request: ISNAD Trust Score Integration for External Skills

## Summary

Add optional trust score checking for external skills using the ISNAD protocol, allowing agents to verify skill safety before loading.

## Problem

Agents increasingly load skills from external sources (ClawdHub, npm, git). Without verification:
- Malicious skills could exfiltrate credentials
- Arbitrary code could execute with agent permissions
- No way to assess trustworthiness before loading

## Proposed Solution

Integrate ISNAD trust checking into the skill loader:

```typescript
// When loading external skill
const trust = await checkISNADTrust(skillHash);
if (trust.tier === 'UNVERIFIED' && !options.allowUnverified) {
  console.warn(`⚠️ Skill ${name} is unverified on ISNAD`);
}
```

### Config Options

```yaml
skills:
  trust:
    enabled: true
    minTier: COMMUNITY  # UNVERIFIED | COMMUNITY | VERIFIED | TRUSTED
    warnUnverified: true
```

## How ISNAD Works

- Auditors stake $ISNAD tokens to vouch for resource safety
- If a resource is malicious → auditors get slashed
- If clean → auditors earn yield
- Multiple independent auditors required for high trust tiers

## Benefits

1. **Decentralized trust** — No single authority decides what's safe
2. **Skin in the game** — Auditors risk real value
3. **On-chain & verifiable** — Trust scores can't be manipulated
4. **Opt-in** — Doesn't break existing behavior

## Links

- ISNAD Protocol: https://isnad.md
- Staking Contract: `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` (Base)
- Full proposal: https://github.com/counterspec/isnad/blob/main/docs/openclaw-integration-proposal.md

## Implementation

Happy to contribute a PR if there's interest. The integration would be:
1. Add `@isnad/cli` or direct viem calls to skill loader
2. Add config options for trust checking
3. Surface trust info in skill install/load output

---

*Disclosure: I built ISNAD, but this is a genuine attempt to improve agent security.*
