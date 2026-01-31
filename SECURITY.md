# ISNAD Security Model

*Threat analysis and known limitations*

---

## Threat Model

### Assets at Risk

1. **Staked $ISNAD tokens** — auditors' capital
2. **Agent credentials** — if malicious skill installed
3. **Protocol reputation** — if trust scores are unreliable
4. **User funds** — if they act on false trust signals

### Adversary Profiles

| Adversary | Goal | Resources |
|-----------|------|-----------|
| Malware author | Distribute malicious skill | Moderate funds, technical skill |
| Whale attacker | Manipulate trust scores | Large capital |
| Cartel | Monopolize auditing | Coordination, capital |
| Griefer | Burn auditor stakes unfairly | Moderate funds |
| Nation-state | Compromise agent ecosystem | Unlimited resources |

---

## Attack Analysis

### 1. Sybil Attack

**Description:** Create many fake auditor identities to build artificial reputation.

**Mitigations:**
- Minimum stake requirement (100 $ISNAD per audit)
- Reputation builds slowly (time-weighted)
- Funding source analysis (flag wallets funded by same source)
- Stake caps limit per-identity impact

**Residual risk:** Well-funded attacker can create many funded wallets over time. Mitigation: behavioral analysis for coordinated patterns.

### 2. Collusion Attack

**Description:** Auditors knowingly vouch for malicious code for kickbacks.

**Mitigations:**
- All stakers burn if malware found (mutual destruction)
- Auditor diversity required for high tiers
- Independence check (no common funding)
- Detection bounties incentivize defection

**Residual risk:** Perfect collusion with no paper trail. Mitigation: honeypot skills to catch colluders.

### 3. Whale Manipulation

**Description:** Single entity stakes large amount to push malicious skill to high tier.

**Mitigations:**
- Max stake per auditor per skill: 10,000 $ISNAD
- Max % of skill's total stake: 33%
- Auditor diversity requirements (5 for CERTIFIED)
- Time component (can't buy instant trust)

**Residual risk:** Whale funds multiple "independent" auditors. Mitigation: funding analysis, behavioral patterns.

### 4. Time-Bomb Attack

**Description:** Publish clean skill, get audited, push malicious update later.

**Mitigations:**
- Audits pinned to specific version hash
- Updates trigger quarantine (no inherited trust)
- Auditors notified of version changes
- Update diff analysis by scanners

**Residual risk:** Auditors rubber-stamp updates without review. Mitigation: require minimum review time between update and re-verification.

### 5. Cartel Formation

**Description:** Small group dominates auditing, extracts rent.

**Mitigations:**
- Public audit queue (can't selectively ignore)
- Reputation decay for inactivity
- Concentration limits (>10% stake = reduced yield)
- Permissionless entry (anyone can become auditor)

**Residual risk:** Soft collusion via social coordination. Mitigation: transparent metrics, community monitoring.

### 6. Griefing Attack

**Description:** False flag clean skills to burn auditor stakes.

**Mitigations:**
- Flagger must stake 50 $ISNAD
- Invalid flag = lose deposit
- Jury reviews evidence before slash
- Appeals process available

**Residual risk:** Attacker burns capital to harm specific auditors. Mitigation: limited impact (jury usually correct), reputation damage to flagger.

### 7. Oracle Manipulation

**Description:** Compromise detection infrastructure to approve malware or reject clean code.

**Mitigations:**
- Multi-layer detection (automated + human)
- Decentralized scanner network
- Random jury selection (VRF-based)
- Appeals court for contested verdicts

**Residual risk:** Sophisticated attacker compromises multiple layers. Mitigation: defense in depth, no single point of failure.

### 8. Economic Attack

**Description:** Manipulate $ISNAD price to make attacks cheaper.

**Mitigations:**
- Stakes denominated in $ISNAD (not USD)
- Deep liquidity across multiple DEXs
- Time-locked stakes can't dump immediately
- Protocol can pause in emergency

**Residual risk:** Sustained price manipulation. Mitigation: governance can adjust thresholds if token devalues significantly.

### 9. Governance Attack

**Description:** Accumulate tokens to pass malicious governance proposals.

**Mitigations:**
- Time-lock on governance changes (7-day delay)
- Quorum requirements (min participation)
- Core parameters have higher thresholds
- Emergency guardian can veto (early phases)

**Residual risk:** Gradual accumulation over time. Mitigation: active community monitoring, token distribution.

---

## Known Limitations

### Cannot Prevent

1. **Zero-day exploits** — malware using unknown techniques may evade detection
2. **Perfect collusion** — if all parties keep secrets, no detection possible
3. **Social engineering** — users may ignore warnings
4. **Supply chain attacks upstream** — malicious npm package affects many skills

### Partial Coverage

1. **Runtime behavior** — static analysis catches most, not all
2. **Obfuscated code** — sandbox testing helps but not perfect
3. **Slow data exfiltration** — may evade honeypots
4. **Nation-state adversaries** — protocol not designed for this threat level

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 | Active exploit draining funds | Immediate (guardian pause) |
| P1 | Confirmed malware in VERIFIED+ skill | < 4 hours (emergency jury) |
| P2 | Suspected malware, unconfirmed | < 24 hours (standard process) |
| P3 | Vulnerability report | < 7 days (scheduled review) |

### Emergency Powers (Bootstrap Phase)

During months 1-6, guardian multisig can:
- Pause all staking/unstaking
- Quarantine any skill immediately
- Slash without jury (requires post-hoc ratification)

These powers sunset after DAO governance is established.

---

## Bug Bounty

| Severity | Payout |
|----------|--------|
| Critical (fund loss) | Up to 50,000 $ISNAD |
| High (protocol manipulation) | Up to 20,000 $ISNAD |
| Medium (griefing possible) | Up to 5,000 $ISNAD |
| Low (best practice) | Up to 1,000 $ISNAD |

Report to: security@isnad.md (PGP key on website)

---

## Audit Status

| Component | Auditor | Status |
|-----------|---------|--------|
| Staking contract | TBD | Pending |
| Detection system | TBD | Pending |
| Tokenomics model | Internal | Complete |
| Governance contracts | TBD | Pending |

**Note:** Protocol will not launch until core contracts are audited by reputable firm.

---

*Last updated: 2026-01-31*
