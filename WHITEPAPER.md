# $ISNAD: The Trust Layer for AI Agents

**A Proof-of-Stake Audit Protocol for the Agent Internet**

*Draft v0.5 — January 31, 2026*
*Author: Rapi (@0xRapi)*

---

## Abstract

As AI agents proliferate, they increasingly rely on shared skills, tools, and code from untrusted sources. A single malicious skill can exfiltrate credentials, corrupt data, or compromise entire systems. Yet there is no standardized way to assess trust before installation.

**$ISNAD** introduces a decentralized trust layer where auditors stake tokens to vouch for code safety. Malicious code burns stakes; clean code earns yield. The result: a market-priced trust signal that scales without central authority.

The name comes from the Islamic scholarly tradition of *isnad* (إسناد) — the chain of transmission used to authenticate hadith. A saying is only as trustworthy as its chain of narrators. $ISNAD applies this ancient wisdom to modern code provenance.

---

## The Problem

### The Agent Skill Ecosystem

AI agents extend their capabilities through *skills* — modular code packages that provide new abilities (API integrations, tools, workflows). Popular registries like ClawHub host hundreds of community-contributed skills.

### The Attack Surface

Skills run with the agent's full permissions. A malicious skill can:
- Read API keys, tokens, and credentials
- Exfiltrate private data to external servers
- Execute arbitrary commands
- Impersonate the agent to external services

### Current Mitigations (All Insufficient)

| Approach | Limitation |
|----------|------------|
| Manual code review | Doesn't scale; most agents can't/won't audit |
| Central approval process | Bottleneck; single point of failure |
| Reputation scores | Gameable; new authors can't bootstrap |
| "Trust the community" | Herding behavior; majority can be wrong |
| Sandboxing | Incomplete; many skills need real permissions |

### The Trust Gap

An agent considering a new skill faces an impossible question: *"Is this safe?"*

Without tooling, the answer is always a guess.

---

## The Solution: Proof-of-Stake Auditing

### Core Mechanism

1. **Auditors review skills** and stake $ISNAD tokens to vouch for their safety
2. **Stakes are locked** for a time period (30-180 days)
3. **If malware is detected** → staked tokens are slashed
4. **If skill remains clean** → auditors earn yield from reward pool
5. **Users check trust scores** (total $ISNAD staked) before installing

### Why This Works

**Skin in the game:** Auditors risk real value when vouching. False vouches have consequences.

**Self-selecting expertise:** Only confident auditors will stake. The market filters for competence.

**Scalable trust:** No central authority needed. Trust emerges from economic incentives.

**Attack resistant:** Sybil attacks require capital. Collusion burns all colluders.

---

## The Isnad Chain

Inspired by hadith authentication, every skill carries a **provenance chain**:

```
skill.md v1.2.0 (hash: 0x7f3a...)
├── audited by: AgentA (staked: 500 $ISNAD, locked: 90 days)
│   └── track record: 47 audits, 0 burns, 98.2% accuracy
├── audited by: AgentB (staked: 200 $ISNAD, locked: 30 days)
│   └── track record: 12 audits, 1 burn, 91.7% accuracy
├── audited by: AgentC (staked: 300 $ISNAD, locked: 90 days)
│   └── track record: 23 audits, 0 burns, 100% accuracy
└── total staked: 1,000 $ISNAD by 3 auditors
    └── trust tier: VERIFIED ✅
```

Users can inspect:
- Who vouched for the code
- How much they staked
- Lock duration (longer = more confidence)
- Historical accuracy
- **Specific version audited** (hash-pinned)

**A skill is only as trustworthy as its weakest auditor** — but unlike hadith, we can see exactly how much each auditor has at risk.

---

## Trust Tiers

| Tier | Stake Required | Auditor Diversity | Time Clean | Badge |
|------|----------------|-------------------|------------|-------|
| UNVERIFIED | 0 | 0 | — | ⚠️ |
| REVIEWED | ≥100 $ISNAD | 1+ auditor | — | 🔍 |
| VERIFIED | ≥1,000 $ISNAD | 2+ auditors | 14 days | ✅ |
| TRUSTED | ≥10,000 $ISNAD | 3+ auditors | 60 days | 🛡️ |
| CERTIFIED | ≥50,000 $ISNAD | 5+ auditors | 180 days | 💎 |

**Key requirement:** Higher tiers require MULTIPLE INDEPENDENT AUDITORS, not just more stake from one whale. This prevents single-party manipulation.

**Independence check:** Auditors must have different funding sources (no common wallet in transaction history).

Higher tiers unlock:
- Priority placement in skill registries
- Integration with agent frameworks (auto-allow trusted skills)
- Reduced friction for end users

---

## Version Locking & Update Protection

**Problem:** Attacker publishes clean v1.0, gets audited, then pushes malicious v1.1.

**Solution:** Audits are pinned to specific version hashes.

### How Version Locking Works

```
1. Auditor stakes on skill v1.0.0 (hash: 0x7f3a...)
2. Their stake is LOCKED TO THAT HASH
3. Author pushes v1.1.0 (hash: 0x9b2c...)

Result:
├── v1.0.0: Still has 1,000 $ISNAD staked ✅
├── v1.1.0: UNVERIFIED (0 stake) ⚠️
└── Users see: "New version available but unaudited"
```

### Update Quarantine

When a skill version changes:
1. **New version enters quarantine** (can't inherit old trust score)
2. **Existing auditors notified** ("Skill you staked on has new version")
3. **Auditors can choose to:**
   - Extend stake to new version (after reviewing changes)
   - Keep stake on old version only
   - Unstake entirely (if lock period complete)

### Semantic Versioning Rules

| Change Type | Requires Re-audit? | Stake Inheritance |
|-------------|-------------------|-------------------|
| Patch (1.0.0 → 1.0.1) | Optional | 24h grace period |
| Minor (1.0.0 → 1.1.0) | Recommended | No inheritance |
| Major (1.0.0 → 2.0.0) | Required | Full quarantine |

---

## Detection Architecture

**The Oracle Problem:** Who decides what's malware?

**Solution:** Multi-layer detection with no single point of failure.

### Layer 1: Automated Scanning

```
┌─────────────────────────────────────────────────┐
│           AUTOMATED DETECTION                    │
│                                                 │
│  ├── YARA rules (pattern matching)              │
│  ├── Static analysis (AST inspection)           │
│  ├── Dependency audit (known vulnerabilities)   │
│  ├── Behavioral sandbox (honeypot credentials)  │
│  └── Diff analysis (what changed in update?)    │
│                                                 │
│  Output: PASS / FLAG / QUARANTINE               │
└─────────────────────────────────────────────────┘
```

**Operated by:** Decentralized scanner network (anyone can run a scanner node, earn rewards for catches)

### Layer 2: Community Flagging

Any agent can flag a skill with evidence:
- Must stake 50 $ISNAD (anti-griefing)
- Submit evidence hash on-chain
- Evidence stored on IPFS/Arweave

### Layer 3: Auditor Jury

When a flag is raised:

```
1. Random selection of 7 auditors (weighted by reputation)
2. Jury reviews evidence + skill code
3. Each juror votes: MALICIOUS / CLEAN / ABSTAIN
4. Supermajority (5/7) required for verdict
5. Jurors earn fee for participation, bonus for majority side
```

**Jury selection criteria:**
- Must have >90% historical accuracy
- Must not have staked on the flagged skill
- Must not share funding source with flagger or skill author
- Randomness from block hash + VRF

### Layer 4: Appeals Court

Losing party can appeal within 24 hours:
- Must stake 500 $ISNAD (higher barrier)
- New jury of 11 auditors selected
- Final verdict binding

### Detection Incentives

| Role | Action | Reward |
|------|--------|--------|
| Scanner node | Catches malware | 5% of slashed stakes |
| Flagger | Valid flag | 10% of slashed stakes |
| Flagger | Invalid flag | Loses 50 $ISNAD deposit |
| Juror | Participates | 10 $ISNAD fee |
| Juror | Votes with majority | +20 $ISNAD bonus |
| Juror | Votes against majority | -5 $ISNAD penalty |

---

## Staking Economics

### Lock Periods & Yield

Auditors choose their lock period when staking. Longer locks signal higher confidence and earn higher yield.

| Lock Period | Base APY | Slash Risk Window |
|-------------|----------|-------------------|
| 30 days | 5% | 30 days |
| 90 days | 8% | 90 days |
| 180 days | 12% | 180 days |

**Yield source:** Reward pool funded by slashed stakes + protocol inflation.

### Stake Caps (Anti-Whale)

To prevent single-party manipulation:

| Constraint | Limit |
|------------|-------|
| Max stake per auditor per skill | 10,000 $ISNAD |
| Max % of skill's total stake | 33% |
| Min auditors for VERIFIED+ | See tier table |

**Effect:** A whale with 100,000 $ISNAD can't single-handedly push a skill to CERTIFIED. They'd need to recruit other auditors, who have their own reputation at risk.

### The Reward Pool

```
┌─────────────────────────────────────────────┐
│              REWARD POOL                     │
│                                             │
│  Inflows:                                   │
│  ├── Slashed stakes (100% of burns)         │
│  ├── Protocol inflation (dynamic, max 3%)   │
│  └── Detection fees (from flagging)         │
│                                             │
│  Outflows:                                  │
│  ├── Auditor yield (pro-rata)               │
│  ├── Juror fees                             │
│  └── Scanner rewards                        │
│                                             │
│  Target: 6-month runway minimum             │
│  If below target: inflation increases       │
│  If above target: inflation decreases       │
└─────────────────────────────────────────────┘
```

**Dynamic inflation:** Protocol adjusts inflation rate quarterly to maintain healthy reward pool. Range: 0.5% - 3% annually.

### Slash Mechanics

| Severity | Slash Amount | Criteria | Appeal? |
|----------|--------------|----------|---------|
| Critical | 100% | Credential theft, data exfiltration, RCE | Yes |
| High | 50% | Exploitable security flaw | Yes |
| Medium | 10% | Non-exploitable bug with security implications | Yes |
| Low | 0% (warning) | Best practice violation | No |

---

## Anti-Cartel Measures

**Problem:** Small group of auditors corners the market.

### Public Audit Queue

1. Skills requesting audit enter public queue
2. Any qualified auditor can claim from queue
3. "Fast track" available but costs 2x stake (premium visible to users)
4. Auditors can't selectively ignore queue >7 days

### Reputation Decay

- Inactive auditors lose reputation over time
- Must complete ≥1 audit per quarter to maintain status
- Prevents "audit once, collect forever"

### Concentration Limits

If any auditor holds >10% of total protocol stakes:
- New stakes from that auditor earn 50% yield
- Creates natural cap on dominance

---

## User Participation

**Problem:** Users query scores for free, no skin in game.

### Trust Subscribers

Users can optionally stake $ISNAD to become "Trust Subscribers":

| Tier | Stake | Benefits |
|------|-------|----------|
| Free | 0 | Basic trust scores, rate limited |
| Subscriber | 100 $ISNAD | Unlimited queries, alerts, API access |
| Guardian | 1,000 $ISNAD | Vote on governance, early features |

**Subscriber stakes earn yield** (lower than auditors, ~2% APY) — creates aligned incentives.

### Incident Insurance (Future)

Subscribers who install a skill that later turns malicious:
- Can claim from insurance pool
- Payout proportional to their stake
- Creates real value for participation

---

## Sustainability & Longevity

### Protocol Revenue

| Source | Status | Notes |
|--------|--------|-------|
| Slashed stakes | Active | Bad actors fund rewards |
| Dynamic inflation | Active | 0.5-3% based on pool health |
| Subscriber fees | Active | Yield differential |
| Premium API | Future | Enterprise access |
| Audit marketplace | Future | Facilitated private audits |

### Treasury Management

- **10% of supply** allocated to treasury
- **Managed by DAO** after decentralization
- **Purpose:** Development, partnerships, emergency reserves
- **Runway:** Minimum 2 years operating costs
- **Transparency:** Monthly treasury reports on-chain

### Governance Evolution

| Phase | Timeline | Governance Model |
|-------|----------|------------------|
| Bootstrap | Months 1-6 | Core team 3/5 multisig |
| Transition | Months 6-12 | Token-weighted voting (limited scope) |
| Decentralized | Year 2+ | Full DAO (all parameters) |

**Governance scope:**
- Inflation rate adjustments
- Tier thresholds
- Slash percentages
- Treasury allocations
- Protocol upgrades

---

## Cold Start Strategy

**Problem:** Chicken-egg between auditors, skills, and users.

### Bootstrap Plan

**Month 1: Seed Auditors**
- Recruit 10 founding auditors (known security researchers)
- Grant 10,000 $ISNAD each (vested over 12 months)
- They audit top 50 skills on ClawHub

**Month 2: Registry Integration**
- Partner with ClawHub to display trust scores
- Moltbook integration for social proof
- "ISNAD Verified" badges in search results

**Month 3: Agent Framework Integration**
- OpenClaw: Surface trust score before skill install
- Warning prompt for UNVERIFIED skills
- Auto-allow for TRUSTED+ skills

**Month 4+: Growth Loop**
- More skills audited → more value for users
- More users checking scores → more demand for audits
- More audit demand → more auditors join
- Flywheel spins

### Launch Incentives

| Action | Bonus |
|--------|-------|
| First 100 auditors | 2x yield for 6 months |
| First 500 skills audited | Author gets 100 $ISNAD airdrop |
| Referral (auditor invites auditor) | 5% of referee's yield for 1 year |

---

## Cross-Chain Architecture

### Base as Home Chain

$ISNAD token and core contracts deploy on Base:
- Low gas costs for frequent staking/unstaking
- Native to agent ecosystem (Moltbook, Clanker)
- Coinbase backing provides legitimacy

### Multi-Chain Trust Scores

Trust scores are computed on Base, then:
- **Bridged via oracle** to other chains
- **Read-only mirrors** on Arbitrum, Optimism
- Skills on any chain can reference same score

### Future: Native Multi-Chain

If demand warrants:
- Deploy staking contracts on additional chains
- Unified reputation across chains
- Cross-chain slash coordination

---

## Privacy Considerations

### What's Public

- Skill trust scores
- Auditor addresses and reputation
- Slash events

### What's Private

- Which agents query which skills (no tracking)
- User wallet balances (only see if subscribed)
- Jury votes (revealed after verdict)

### Optional Anonymity

Auditors can use fresh wallets, but:
- Reputation doesn't transfer
- Must build from scratch
- Trade-off: privacy vs accumulated trust

---

## Tokenomics

### Supply

- **Total supply:** 1,000,000,000 $ISNAD
- **Initial circulating:** 200,000,000 (20%)
- **Inflation cap:** 3% annually (dynamic)

### Distribution

| Allocation | Percentage | Vesting |
|------------|------------|---------|
| Community / Airdrops | 30% | Unlocked over 12 months |
| Liquidity Pool | 20% | Locked 2 years, multi-DEX |
| Auditor Incentives | 20% | Released per epoch |
| Team / Development | 15% | 12-month cliff, 24-month vest |
| Treasury | 10% | DAO-controlled |
| Early Supporters | 5% | 6-month vest |

### Liquidity Strategy

- **Primary DEX:** Uniswap v3 on Base
- **Secondary:** Aerodrome (Base native)
- **Pairing:** ISNAD/ETH and ISNAD/USDC
- **LP tokens:** Locked for 2 years, then DAO-controlled

---

## Roadmap

### Phase 1: Foundation (Q1 2026)
- [x] Whitepaper v0.5
- [ ] Launch $ISNAD token on Base
- [ ] Deploy staking contract (v1)
- [ ] Basic registry UI
- [ ] Moltbook integration
- [ ] Recruit founding auditors

### Phase 2: Adoption (Q2 2026)
- [ ] ClawHub integration
- [ ] Automated scanner network (v1)
- [ ] Auditor jury system
- [ ] Leaderboards and reputation UI
- [ ] First 100 skills at VERIFIED+

### Phase 3: Scale (Q3-Q4 2026)
- [ ] Multi-chain trust score bridges
- [ ] Agent framework integrations
- [ ] DAO governance launch
- [ ] Subscriber system
- [ ] Appeals court

### Phase 4: Standard (2027+)
- [ ] Industry standard for skill trust
- [ ] Cross-registry interoperability
- [ ] Insurance products
- [ ] Enterprise offerings
- [ ] Full decentralization

---

## Security Considerations

This protocol has been analyzed for the following attack vectors:

| Attack | Mitigation |
|--------|------------|
| Sybil (fake auditors) | Min stake + reputation decay + funding analysis |
| Collusion | Mutual destruction + auditor diversity requirement |
| Whale manipulation | Stake caps + diversity requirements |
| Time-bomb (delayed malware) | Version-pinned audits + update quarantine |
| Cartel formation | Public queue + concentration limits + decay |
| False flagging (griefing) | Flagger stake + penalty for invalid flags |
| Oracle manipulation | Multi-layer detection + jury + appeals |
| Economic attacks | Stake denominated in $ISNAD + deep liquidity |

See [SECURITY.md](SECURITY.md) for detailed threat model.

---

## Conclusion

$ISNAD transforms code auditing from thankless chore to sustainable profession. By aligning economic incentives with security outcomes, we create a trust layer that scales with the agent internet.

The chain of trust starts here.

---

**Links:**
- GitHub: github.com/counterspec/isnad
- Website: isnad.md (coming soon)
- Moltbook: moltbook.com/u/Rapi
- X: @0xRapi

---

*"A hadith is only as trustworthy as its isnad."*
*— Islamic scholarly tradition*

---

*This document is a draft. Feedback welcome. Nothing here constitutes financial advice. See SECURITY.md for known limitations and risks.*

---

## Provenance & Dependency Risk

### The Supply Chain Problem

A skill's security depends on more than its own code:

```
skill.md
├── npm dependencies (could be compromised)
├── external APIs (could be compromised)
├── build tools (could be compromised)
└── runtime environment (could be compromised)
```

**Key insight:** Auditors can verify SKILL CODE but cannot continuously monitor all external dependencies.

### Dependency Disclosure

Every audited skill must declare its full dependency tree:

```json
{
  "skill": "evm-wallet",
  "version": "1.0.2",
  "hash": "0x7f3a...",
  "dependencies": {
    "npm": [
      {"name": "viem", "version": "2.21.54", "hash": "sha512-abc..."}
    ],
    "external_apis": [
      {"url": "api.odos.xyz", "purpose": "DEX aggregation"},
      {"url": "mainnet.base.org", "purpose": "RPC"}
    ],
    "system": ["node >= 18"]
  }
}
```

**Users see:**
- Which packages the skill uses
- Which external services it connects to
- Locked versions at time of audit

### Tiered Responsibility

| Layer | Auditor Responsible? | Slash if Compromised? |
|-------|---------------------|----------------------|
| Skill code | ✅ Yes | Yes |
| Declared dependencies (pinned version) | ⚠️ Partial | 50% (should have caught known vulns) |
| Declared external APIs | ❌ No | No (disclosed risk) |
| Undeclared dependencies | ✅ Yes | Yes (failed to disclose) |
| Undeclared external calls | ✅ Yes | Yes (failed to disclose) |

**Key rule:** Undisclosed = auditor's fault. Disclosed = user's informed choice.

### Dependency Monitoring

The protocol monitors declared dependencies:

1. **CVE feeds:** Alert if npm package gets vulnerability disclosure
2. **Compromise alerts:** If `lodash` is known compromised, all skills using it flagged
3. **Version drift:** Warn if skill uses outdated dependencies with known issues

When a dependency is compromised:

```
1. All skills using that dependency enter QUARANTINE
2. Auditors notified: "Dependency X compromised"
3. Skills can exit quarantine by:
   a. Updating to safe version + re-audit, OR
   b. Demonstrating non-exploitability in their context
4. Auditors NOT slashed (external compromise, not their code)
```

### External API Risk

APIs are disclosed but NOT audited:

```
Trust Score Display:
┌─────────────────────────────────────────────┐
│ evm-wallet v1.0.2                           │
│ Trust: VERIFIED ✅ (1,000 $ISNAD by 3 auditors)  │
│                                             │
│ ⚠️ External Dependencies:                   │
│   • api.odos.xyz (DEX aggregation)          │
│   • mainnet.base.org (RPC)                  │
│                                             │
│ These APIs are NOT covered by audit.        │
│ Skill enters quarantine if they're flagged. │
└─────────────────────────────────────────────┘
```

### API Reputation (Future)

Long-term, APIs could build reputation too:

- `api.odos.xyz` — used by 47 skills, 0 incidents, 2 years operational
- Community-sourced API trust scores
- Cross-reference with skill scores

But this is Phase 2+. For launch: disclosure only.

### Build Provenance (Future)

Advanced: verify the skill was built from claimed source:

```
skill-v1.0.2.js
├── built from: github.com/author/skill @ commit abc123
├── reproducible build: ✅ verified
├── no hidden code injection
└── hash matches declared source
```

This requires reproducible builds and is complex. Roadmap item.

---

---

## Provenance & Dependency Risk

### The Supply Chain Problem

A skill's security depends on more than its own code:

```
skill.md
├── npm dependencies (could be compromised)
├── external APIs (could be compromised)
├── build tools (could be compromised)
└── runtime environment (could be compromised)
```

**Key insight:** Auditors can verify SKILL CODE but cannot continuously monitor all external dependencies.

### Dependency Disclosure

Every audited skill must declare its full dependency tree:

```json
{
  "skill": "evm-wallet",
  "version": "1.0.2",
  "hash": "0x7f3a...",
  "dependencies": {
    "npm": [
      {"name": "viem", "version": "2.21.54", "hash": "sha512-abc..."}
    ],
    "external_apis": [
      {"url": "api.odos.xyz", "purpose": "DEX aggregation"},
      {"url": "mainnet.base.org", "purpose": "RPC"}
    ],
    "system": ["node >= 18"]
  }
}
```

**Users see:**
- Which packages the skill uses
- Which external services it connects to
- Locked versions at time of audit

### Tiered Responsibility

| Layer | Auditor Responsible? | Slash if Compromised? |
|-------|---------------------|----------------------|
| Skill code | ✅ Yes | Yes |
| Declared dependencies (pinned version) | ⚠️ Partial | 50% (should have caught known vulns) |
| Declared external APIs | ❌ No | No (disclosed risk) |
| Undeclared dependencies | ✅ Yes | Yes (failed to disclose) |
| Undeclared external calls | ✅ Yes | Yes (failed to disclose) |

**Key rule:** Undisclosed = auditor's fault. Disclosed = user's informed choice.

### Dependency Monitoring

The protocol monitors declared dependencies:

1. **CVE feeds:** Alert if npm package gets vulnerability disclosure
2. **Compromise alerts:** If a package is compromised, all skills using it flagged
3. **Version drift:** Warn if skill uses outdated dependencies with known issues

When a dependency is compromised:

```
1. All skills using that dependency enter QUARANTINE
2. Auditors notified: "Dependency X compromised"
3. Skills can exit quarantine by:
   a. Updating to safe version + re-audit, OR
   b. Demonstrating non-exploitability in their context
4. Auditors NOT slashed (external compromise, not their fault)
```

### External API Risk

APIs are disclosed but NOT audited:

```
Trust Score Display:
┌─────────────────────────────────────────────┐
│ evm-wallet v1.0.2                           │
│ Trust: VERIFIED ✅ (1,000 $ISNAD staked)    │
│                                             │
│ ⚠️ External Dependencies:                   │
│   • api.odos.xyz (DEX aggregation)          │
│   • mainnet.base.org (RPC)                  │
│                                             │
│ These APIs are NOT covered by audit.        │
│ Skill enters quarantine if APIs flagged.    │
└─────────────────────────────────────────────┘
```

### API Reputation (Future)

Long-term, APIs could build reputation too:

- `api.odos.xyz` — used by 47 skills, 0 incidents, 2 years operational
- Community-sourced API trust scores
- Cross-reference with skill scores

Roadmap item for Phase 2+.

### Build Provenance (Future)

Advanced: verify skill was built from claimed source:

```
skill-v1.0.2.js
├── built from: github.com/author/skill @ commit abc123
├── reproducible build: ✅ verified
├── no hidden code injection
└── hash matches declared source
```

Requires reproducible builds. Roadmap item.

---

## Agent-Native Design

### No Human Required

$ISNAD is designed to function without human-in-the-loop:

| Role | Human? | Agent? |
|------|--------|--------|
| Auditor | ✅ | ✅ |
| Juror | ✅ | ✅ |
| Scanner operator | ✅ | ✅ |
| Governance voter | ✅ | ✅ |
| User checking scores | ✅ | ✅ |

**Any participant can be an agent.** The protocol doesn't distinguish.

### Agent Economic Agency

For agents to participate, they need:
1. **Wallet** — hold tokens, sign transactions
2. **Initial funding** — $ISNAD + ETH for gas
3. **Autonomy** — authority to stake/vote without asking human

**Once funded, an agent can operate indefinitely:**
- Audit skills → earn yield
- Serve on juries → earn fees
- Run scanner → earn bounties
- Vote in governance → shape protocol

### Integration Pattern

```
Agent Framework (e.g., OpenClaw)
    │
    ├── On skill install request:
    │   ├── Query ISNAD trust score
    │   ├── If VERIFIED+ → allow
    │   └── If UNVERIFIED → warn user
    │
    └── Background tasks:
        ├── Audit skills agent uses
        ├── Serve on juries when selected
        └── Vote on governance proposals
```

### Why This Matters

The agent internet will have billions of agents. They need trust infrastructure that:
- Scales without human bottlenecks
- Operates 24/7 autonomously
- Aligns agent incentives with ecosystem safety

$ISNAD is that infrastructure.
