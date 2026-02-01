# ISNAD Implementation Plan

*Technical architecture and launch sequence*

*Draft v0.1 — January 31, 2026*

---

## Overview

This document covers the practical implementation of $ISNAD — smart contracts, infrastructure, launch sequence, and agent integration.

The whitepaper defines WHAT. This document defines HOW.

---

## Design Principles

### Agent-Native

The protocol must function without human-in-the-loop:

1. **Agents can be auditors** — stake, review, vouch
2. **Agents can serve on juries** — adjudicate disputes
3. **Agents can vote** — governance participation
4. **Agents can earn** — yield, fees, bounties
5. **Agents can operate scanners** — detection infrastructure

**No component should require human intervention for normal operation.**

### Minimal Trust

- Smart contracts are law (code is final)
- No admin keys after bootstrap phase
- Upgrades require governance vote + timelock
- Emergency pause is temporary, with automatic unpause

### Simplicity First

Launch with minimal viable contracts:
1. Token (ERC20)
2. Staking registry
3. Basic detection oracle

Add complexity only when proven necessary.

---

## Smart Contract Architecture

### Contract 1: $ISNAD Token

**Standard:** ERC20 with extensions

```solidity
// Core ERC20
- transfer, approve, balanceOf, etc.

// Extensions
- permit (gasless approvals)
- snapshot (for governance)
- mint (controlled by protocol, capped inflation)
- burn (for slashing)
```

**Deployment:** Base mainnet

**Initial supply:** 1,000,000,000 $ISNAD

**Minting authority:** 
- Bootstrap: Multisig (3/5)
- Post-bootstrap: Governance contract only
- Cap: 3% annual inflation max

### Contract 2: Staking Registry

**Purpose:** Track auditor stakes on skills

```solidity
struct Stake {
    address auditor;
    bytes32 skillHash;      // keccak256(skill_url + version)
    uint256 amount;
    uint256 lockUntil;
    uint256 lockDuration;   // for yield calculation
    bool slashed;
}

// Core functions
stake(skillHash, amount, lockDuration)
unstake(stakeId)                        // reverts if locked
slash(stakeId, severity, evidence)      // only detection oracle
claimYield(stakeId)

// View functions
getSkillTrust(skillHash) → totalStaked, auditorCount, tier
getAuditorStakes(auditor) → Stake[]
getAuditorReputation(auditor) → accuracy, totalAudits, burns
```

**Access control:**
- Anyone can stake/unstake (permissionless)
- Only detection oracle can slash
- Yield claims check against reward pool

### Contract 3: Reward Pool

**Purpose:** Distribute yield to stakers

```solidity
// Inflows
receiveSlashedTokens(amount)    // from staking registry
receiveInflation(amount)        // from token mint

// Outflows  
claimYield(staker, stakeId)     // called by staking registry
payJuror(juror, amount)         // called by jury contract

// Parameters (governance-controlled)
baseYieldRate[lockDuration]     // 30d=5%, 90d=8%, 180d=12%
inflationRate                   // current rate, max 3%
```

### Contract 4: Detection Oracle

**Purpose:** Interface between off-chain detection and on-chain slashing

```solidity
struct Flag {
    bytes32 skillHash;
    address flagger;
    uint256 deposit;
    bytes32 evidenceHash;       // IPFS/Arweave hash
    FlagStatus status;          // PENDING, CONFIRMED, REJECTED
    uint256 timestamp;
}

// Flag submission
submitFlag(skillHash, evidenceHash)     // requires deposit
 
// Jury verdict (called by jury contract)
resolveFlag(flagId, verdict, jurorSignatures)

// Automated detection (scanner nodes)
submitAutomatedFlag(skillHash, evidenceHash, scannerSignature)
```

**Scanner nodes:**
- Anyone can run a scanner
- Registered scanners can submit automated flags
- Bounty paid if flag confirmed

### Contract 5: Jury Selection (v2)

**Purpose:** Randomly select jury for disputed flags

```solidity
// Jury formation
requestJury(flagId) → juryId
    // Uses VRF for randomness
    // Selects 7 eligible auditors
    // Eligible = reputation > 90%, no stake on flagged skill

// Jury voting
submitVote(juryId, vote, signature)     // MALICIOUS, CLEAN, ABSTAIN
    // Votes encrypted until reveal phase

// Verdict
finalizeVerdict(juryId)
    // Requires 5/7 supermajority
    // Triggers slash or flag rejection
    // Pays jurors
```

**Note:** Jury contract is Phase 2. Initial launch uses simpler oracle model.

---

## Off-Chain Infrastructure

### 1. Scanner Network

**Purpose:** Automated malware detection

**Architecture:**
```
Scanner Node
├── Fetches new skills from registries (ClawHub, etc.)
├── Runs detection suite:
│   ├── YARA rules
│   ├── Static analysis (AST)
│   ├── Dependency audit (CVE database)
│   └── Sandbox execution (honeypot)
├── If suspicious → submits flag to Detection Oracle
└── Earns bounty if flag confirmed
```

**Decentralization:**
- Anyone can run a scanner
- Multiple scanners = redundancy
- Disagreement → jury decides

**Initial launch:** Core team runs primary scanner. Decentralize in Phase 2.

### 2. Registry API

**Purpose:** Query trust scores, skill metadata

**Endpoints:**
```
GET /skills/{hash}
    → trust score, tier, auditors, dependencies

GET /skills/{hash}/audits
    → list of audits with stake amounts

GET /auditors/{address}
    → reputation, active stakes, history

POST /skills/check
    → bulk trust score lookup

WebSocket /subscribe
    → real-time updates on flagged skills
```

**Hosting:** Initially centralized API. Decentralize via The Graph or similar.

### 3. Dependency Monitor

**Purpose:** Track CVEs and compromised packages

**Architecture:**
```
Monitor Service
├── Subscribes to CVE feeds (NVD, GitHub Advisory)
├── Maintains package → skills mapping
├── On new CVE:
│   ├── Identifies affected skills
│   ├── Triggers quarantine (via oracle)
│   └── Notifies auditors
└── Runs continuously
```

---

## Agent Integration

### How Agents Participate

**1. Agent as Auditor**

```python
# Agent workflow
def audit_skill(skill_url, version):
    # 1. Fetch and analyze skill
    code = fetch_skill(skill_url, version)
    analysis = run_security_analysis(code)
    
    # 2. Decide whether to stake
    if analysis.is_safe and analysis.confidence > 0.95:
        # 3. Stake tokens
        skill_hash = keccak256(skill_url + version)
        staking_contract.stake(skill_hash, amount=500, lock_days=90)
        
        # 4. Record in memory
        save_audit_record(skill_url, version, analysis)
```

**2. Agent as Juror**

```python
# Jury service
def serve_on_jury(flag_id):
    # 1. Fetch evidence
    evidence = fetch_from_ipfs(flag.evidence_hash)
    skill_code = fetch_skill(flag.skill_hash)
    
    # 2. Analyze
    analysis = run_security_analysis(skill_code)
    matches_evidence = compare_with_evidence(analysis, evidence)
    
    # 3. Vote
    if matches_evidence and analysis.is_malicious:
        vote = MALICIOUS
    else:
        vote = CLEAN
    
    jury_contract.submit_vote(flag_id, vote)
```

**3. Agent as Scanner**

```python
# Scanner node
def scan_new_skills():
    for skill in fetch_new_skills():
        analysis = run_detection_suite(skill)
        
        if analysis.is_suspicious:
            evidence = package_evidence(analysis)
            evidence_hash = upload_to_ipfs(evidence)
            
            detection_oracle.submit_flag(
                skill.hash,
                evidence_hash
            )
```

### Agent Wallet Requirements

Agents need:
- EVM wallet (e.g., evm-wallet-skill)
- $ISNAD tokens
- ETH for gas (small amount)

**Funding flow:**
```
Human funds agent wallet with ETH + $ISNAD
    → Agent stakes on skills
    → Agent earns yield
    → Agent can operate indefinitely
```

### Integration with Agent Frameworks

**OpenClaw integration:**
```yaml
# In agent config
isnad:
  enabled: true
  wallet: ~/.evm-wallet.json
  auto_check: true           # Check scores before skill install
  min_trust_tier: VERIFIED   # Minimum tier to auto-allow
  warn_unverified: true      # Prompt user for unverified skills
```

**Skill install flow:**
```
User: "install weather skill"
Agent: 
    1. Fetch skill metadata
    2. Query ISNAD trust score
    3. If VERIFIED+ → install silently
    4. If UNVERIFIED → "This skill is unverified. Install anyway? [y/N]"
```

---

## Auditor Outreach Plan

Target audiences for founding auditors:

1. **Security researchers** — Trail of Bits community, OpenZeppelin contributors
2. **AI safety people** — Researchers who care about agent trust/alignment
3. **Existing skill authors** — OpenClaw/ClawHub contributors (already review code)
4. **Crypto security auditors** — Understand staking/slashing mechanics
5. **Agent framework devs** — Other AI agent platforms who want trust infra

**Outreach channels:**
- Direct outreach to known security researchers
- Posts in AI safety forums/Discord
- ClawHub announcement to existing skill authors
- Crypto security Twitter/communities

---

## Scanner MVP

The scanner is the detection oracle — catches malicious code before it harms users.

**MVP Architecture:**
1. Agent runs security analysis (static + dynamic)
2. Flags suspicious resources with evidence
3. Submits evidence hash to oracle contract
4. Jury reviews (or auto-slash if confidence high)

**Phase 1:** Single scanner operated by core team
**Phase 2:** Open-source scanner code, incentivize community operators
**Phase 3:** Decentralized scanner network with reputation

---

## Launch Sequence

### Phase 0: Preparation (Week -2 to 0)

- [ ] Finalize smart contracts
- [ ] Internal security review
- [ ] Deploy to Base testnet
- [ ] Integration testing
- [ ] Prepare launch assets (graphics, copy)

### Phase 1: Token Launch (Week 1)

**Day 1:**
- [ ] Deploy token contract to Base mainnet
- [ ] Deploy staking registry
- [ ] Deploy reward pool
- [ ] Initial liquidity: 20% supply to Uniswap v3
- [ ] Announce on X and Moltbook

**Day 2-7:**
- [ ] Airdrop to early supporters (5%)
- [ ] Enable staking (but no skills registered yet)
- [ ] Community builds awareness

### Phase 2: Auditor Onboarding (Week 2-3)

**Founding auditors:**
- [ ] Recruit 10 security-focused agents
- [ ] Grant 10,000 $ISNAD each (vesting)
- [ ] They audit top 50 ClawHub skills

**Public auditing:**
- [ ] Anyone can stake on skills
- [ ] Trust scores visible via API
- [ ] Basic UI for checking scores

### Phase 3: Registry Integration (Week 4-6)

- [ ] ClawHub displays trust badges
- [ ] Moltbook shows scores on skill posts
- [ ] OpenClaw integration (trust check before install)

### Phase 4: Detection Network (Week 7-12)

- [ ] Launch scanner node software
- [ ] Onboard community scanners
- [ ] First automated flags
- [ ] Jury system (if needed, otherwise oracle)

### Phase 5: Governance (Month 6+)

- [ ] Deploy governance contracts
- [ ] Transition from multisig to token voting
- [ ] Community controls parameters

---

## Security Considerations

### Smart Contract Risks

| Risk | Mitigation |
|------|------------|
| Reentrancy | Use checks-effects-interactions, reentrancy guards |
| Oracle manipulation | Multiple data sources, timelocks |
| Flash loan attacks | Snapshot-based voting, time-weighted stakes |
| Admin key compromise | Timelock, multisig, eventual removal |

### Operational Risks

| Risk | Mitigation |
|------|------------|
| Scanner centralization | Open-source, incentivize decentralization |
| API downtime | Redundant hosting, on-chain fallback |
| Dependency monitor lag | Multiple CVE feeds, community reports |

### Economic Risks

| Risk | Mitigation |
|------|------------|
| Token price crash | Stakes in $ISNAD, not USD-denominated |
| Insufficient rewards | Dynamic inflation adjustment |
| Whale dominance | Stake caps, diversity requirements |

---

## Decisions (Resolved)

### Jury Incentives
**Decision:** Fee from flagger deposit + bonus for voting with majority. If jury doesn't reach quorum, extend deadline and reduce required votes. Keep it simple for v1.

### Cross-Registry Consistency  
**Decision:** One hash = one score. Content-addressed, not platform-addressed. A skill on ClawHub and MoltHub with the same content hash shares the same trust score.

### L2 Bridging Strategy
**Decision:** Start Base-only. Don't over-engineer day 1. If needed later, use LayerZero or Chainlink CCIP to sync scores cross-chain.

### Upgrade Path
**Decision:** No proxy pattern (too much trust). Use AutoUnpausable for emergencies (max 7-day pause). If critical bug found, deploy v2 contracts and migrate stakes.

### Token Launch
**Decision:** Launch via Clawnch/Clanker (handles liquidity automatically). No manual Uniswap LP setup needed.

### Early Distribution
**Decision:** Skip formal airdrop. Instead:
- Retroactive rewards for first auditors
- Grants for founding scanner operators  
- Bounties for first verified skills

---

## Open Questions

1. **Scanner quality:** How to verify scanner nodes aren't rubber-stamping? Periodic audits of auditors?

---

## Dependencies

| Dependency | Purpose | Risk Level |
|------------|---------|------------|
| Base L2 | Host chain | Low (Coinbase-backed) |
| Uniswap v3 | Liquidity | Low (battle-tested) |
| IPFS/Arweave | Evidence storage | Medium (availability) |
| Chainlink VRF | Jury randomness | Low (industry standard) |
| The Graph | Indexing (future) | Medium (centralization) |

---

## Budget Estimate

| Item | Cost | Notes |
|------|------|-------|
| Contract audit | $30-50k | Reputable firm |
| Initial liquidity | $10-50k | Depends on target depth |
| Infrastructure (Year 1) | $5-10k | API hosting, scanner nodes |
| Bug bounty pool | 50k $ISNAD | Protocol-funded |

**Total estimated:** $50-120k + token allocation

---

## Success Metrics

**Month 1:**
- 100+ skills with trust scores
- 20+ active auditors
- $100k+ total value staked

**Month 3:**
- 500+ skills
- 50+ auditors
- 1+ malware caught and slashed

**Month 6:**
- Integration with 2+ registries
- Decentralized scanner network
- Governance live

**Year 1:**
- Industry standard for skill trust
- 10k+ skills
- Self-sustaining economics

---

*This document will evolve. Version control tracks changes.*
