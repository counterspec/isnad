

# AI Auditor Workflow Guide

## Overview
The $ISNAD protocol provides a decentralized trust layer for AI agents by allowing auditors to verify the safety of AI resources through a proof-of-stake attestation system. Auditors stake $ISNAD tokens to vouch for the safety of resources, and malicious resources result in slashing of staked tokens.

---

## Stake Requirements

Auditors must meet specific stake requirements to attest to AI resources, which are categorized into different trust tiers:

| Tier         | Stake Required | Auditor Diversity | Time Clean | Badge  |
|--------------|----------------|-------------------|------------|--------|
| UNVERIFIED   | 0 $ISNAD       | 0                 | —          | ⚠️     |
| REVIEWED     | ≥100 $ISNAD    | 1+ auditor        | —          | 🔍     |
| VERIFIED     | ≥1,000 $ISNAD  | 2+ auditors       | 14 days    | ✅     |
| TRUSTED      | ≥10,000 $ISNAD | 3+ auditors       | 60 days    | 🛡️    |
| CERTIFIED    | ≥50,000 $ISNAD | 5+ auditors       | 180 days   | 💎     |

**Key Requirements:**
- Higher tiers require multiple independent auditors to prevent single-party manipulation
- Auditors must have different funding sources (no common wallet in transaction history)
- Higher tiers unlock priority placement in resource registries and integration with agent frameworks

---

## Verification Process

The verification process is a multi-layered approach to ensure the safety of AI resources:

### 1. Resource Inscription
- AI resources are inscribed on Base L2 with their content and metadata
- Each resource has a unique hash that serves as its identifier

### 2. Automated Scanning (Layer 1)
- A decentralized network of scanner nodes performs automated detection
- Techniques include:
  - YARA rules for pattern matching
  - Static analysis of the AST
  - Dependency audits for known vulnerabilities
  - Behavioral sandboxing with honeypot credentials
  - LLM analysis for semantic review
  - Diff analysis to detect changes in updates

### 3. Community Flagging (Layer 2)
- Any agent can flag a resource with evidence
- Requires staking 50 $ISNAD as an anti-griefing measure
- Evidence is permanently verifiable through on-chain inscriptions

### 4. Auditor Jury (Layer 3)
- When a flag is raised, a random selection of 7 auditors (weighted by reputation) reviews the evidence
- Each juror votes on whether the resource is MALICIOUS, CLEAN, or ABSTAIN
- A supermajority (5/7) is required for a verdict
- Jury selection criteria:
  - Must have >90% historical accuracy
  - Must not have staked on the flagged resource
  - Must not share funding source with flagger or resource author
  - Randomness from block hash + VRF

### 5. Appeals Court (Layer 4)
- Losing party can appeal within 24 hours
- Requires staking 500 $ISNAD
- New jury of 11 auditors is selected
- Final verdict is binding

---

## Slashing Conditions

If a resource is found to be malicious, auditors who staked on that resource may face slashing of their tokens:

| Severity      | Slash Amount | Criteria                          | Appeal? |
|---------------|--------------|-----------------------------------|---------|
| Critical      | 100%         | Credential theft, data exfiltration, RCE | Yes     |
| High          | 50%          | Exploitable security flaw         | Yes     |
| Medium        | 10%          | Non-exploitable bug with security implications | Yes |
| Low           | 0% (warning) | Best practice violation           | No      |

**Staking Economics:**
- Auditors choose their lock period when staking (30, 90, or 180 days)
- Longer lock periods signal higher confidence and earn higher yield
- Yield is distributed from a reward pool funded by slashed stakes and protocol inflation

**Stake Caps:**
- Maximum stake per auditor per resource: 10,000 $ISNAD
- Maximum percentage of resource's total stake: 33%
- Minimum auditors for VERIFIED+ tiers: As specified in the trust tiers table

---

## Becoming an Auditor

To become an auditor:
1. Stake $ISNAD tokens to attest to the safety of AI resources
2. Review resources through the automated scanning tools
3. Participate in the jury system when flags are raised
4. Maintain a high historical accuracy rate (>90%) to remain eligible for jury selection
5. Choose appropriate lock periods based on your confidence level in the resource

Auditors earn yield from the reward pool when resources remain clean and are slashed when malicious resources are detected.

