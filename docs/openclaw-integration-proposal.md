# OpenClaw ISNAD Integration Proposal

## Summary

Add optional trust score checking for external skills loaded via OpenClaw, using the ISNAD protocol on Base.

## Motivation

Agents increasingly load skills from external sources (ClawdHub, npm, git). Without verification, malicious skills could:
- Exfiltrate credentials
- Execute arbitrary commands
- Manipulate agent behavior

ISNAD provides a decentralized trust layer where auditors stake tokens to vouch for resource safety. Integrating ISNAD into OpenClaw would let agents automatically check trust scores before loading untrusted skills.

## Proposed Changes

### 1. Add ISNAD trust check to skill loader

```typescript
// skills/loader.ts
import { checkISNADTrust } from './isnad';

async function loadSkill(skillPath: string, options: SkillOptions) {
  // Compute content hash
  const content = await fs.readFile(path.join(skillPath, 'SKILL.md'));
  const hash = keccak256(content);
  
  // Check ISNAD trust score
  const trust = await checkISNADTrust(hash);
  
  if (trust.tier === 'UNVERIFIED' && !options.allowUnverified) {
    throw new SkillTrustError(`Skill ${skillPath} is unverified on ISNAD`);
  }
  
  if (trust.tier === 'COMMUNITY' && options.requireVerified) {
    console.warn(`⚠️ Skill ${skillPath} has low ISNAD trust (${trust.score})`);
  }
  
  // Continue loading...
}
```

### 2. Add config options

```yaml
# openclaw.yaml
skills:
  trust:
    enabled: true
    minTier: COMMUNITY  # UNVERIFIED | COMMUNITY | VERIFIED | TRUSTED
    warnUnverified: true
    blockUnverified: false
```

### 3. Add ISNAD check utility

```typescript
// skills/isnad.ts
const ISNAD_STAKING = '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca';

export async function checkISNADTrust(contentHash: string): Promise<TrustInfo> {
  const client = createPublicClient({ chain: base, transport: http() });
  
  const [score, tier] = await Promise.all([
    client.readContract({
      address: ISNAD_STAKING,
      abi: STAKING_ABI,
      functionName: 'getTrustScore',
      args: [contentHash],
    }),
    client.readContract({
      address: ISNAD_STAKING,
      abi: STAKING_ABI,
      functionName: 'getTrustTier',
      args: [contentHash],
    }),
  ]);
  
  return {
    hash: contentHash,
    score: formatUnits(score, 18),
    tier: ['UNVERIFIED', 'COMMUNITY', 'VERIFIED', 'TRUSTED'][tier],
  };
}
```

## User Experience

```
$ openclaw skill install weather-skill

⚠️ Trust check: weather-skill
   ISNAD Score: 5,000 ISNAD (COMMUNITY tier)
   Auditors: 2
   
   This skill has some community backing but is not fully verified.
   Run with --allow-unverified to install anyway.
```

## Backwards Compatibility

- Trust checking is opt-in via config
- Default behavior unchanged
- Skills already loaded are not affected

## Security Considerations

- ISNAD scores are on-chain and tamper-resistant
- Auditors have skin in the game (can be slashed)
- Multiple independent auditors required for high tiers

## Links

- ISNAD Protocol: https://isnad.md
- Contracts: Base mainnet
- Staking: `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca`

---

*This is a proposal for discussion. Happy to implement if there's interest.*
