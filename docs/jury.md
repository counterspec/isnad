# The Jury System

When a resource is flagged as potentially malicious, a jury of randomly selected auditors reviews the evidence and votes on a verdict.

## Flagging a Resource

Anyone can flag a resource they believe is malicious:

1. **Deposit 100 $ISNAD** — Prevents spam flags
2. **Provide evidence** — Description of the malicious behavior
3. **Wait for jury** — 5 auditors are randomly selected

### Flag Deposit Outcomes

| Verdict | Deposit Return |
|---------|----------------|
| GUILTY | 100% returned + reward from slashed stakes |
| INNOCENT | 90% returned |
| DISMISSED (no supermajority) | 50% returned |

## Jury Selection

When a flag is submitted:

1. **5 auditors** are randomly selected
2. **Conflict check** — Jurors cannot have stake in the flagged resource
3. **On-chain randomness** — VRF-based selection in production
4. **7-day deadline** — Jurors have 7 days to review and vote

### Juror Requirements

- Must be an active auditor (have at least one attestation)
- Cannot have stake in the resource being judged
- Should have demonstrated competence (historical accuracy)

## Voting Process

Each juror reviews:
- The resource content (inscribed on-chain)
- The flagger's evidence
- The resource's metadata and claims

Then casts a vote:
- **GUILTY** — Resource is malicious
- **INNOCENT** — Resource is safe
- **ABSTAIN** — Unable to determine (counts toward quorum but not verdict)

### Verdict Requirements

**Supermajority (≥67%)** required for a verdict:
- If 4+ jurors vote GUILTY → GUILTY verdict
- If 4+ jurors vote INNOCENT → INNOCENT verdict
- Otherwise → DISMISSED (no supermajority)

## Verdict Outcomes

### GUILTY
- **All stakes** on the resource are burned
- **Flagger** receives deposit back + portion of burned stakes
- **Auditors** who staked lose everything
- **Resource** is marked as malicious on-chain

### INNOCENT
- **Stakes remain** locked as normal
- **Flagger** receives 90% of deposit back
- **Auditors** continue earning yield
- **Resource** continues with unchanged trust score

### DISMISSED
- **Stakes remain** locked as normal
- **Flagger** receives 50% of deposit back
- **Resource** can be flagged again with new evidence

## Appeals

Verdicts can be appealed within 3 days:

1. **Deposit 2x** the original flag amount (200 $ISNAD)
2. **New jury** selected for re-trial
3. **Appeal verdict is final** — No further appeals

### Who Can Appeal

- The original flagger (if INNOCENT verdict)
- Any staker on the resource (if GUILTY verdict)
- Any third party with sufficient deposit

## Timeline

| Event | Deadline |
|-------|----------|
| Jury selection | Immediate upon flag |
| Juror voting period | 7 days |
| Appeal window | 3 days after verdict |
| Appeal trial | 7 days |
| Execution | Immediate after final verdict |

## Juror Incentives

Jurors who vote with the majority receive:
- Small reward from protocol treasury
- Reputation boost (affects future jury selection)

Jurors who vote against the majority:
- No penalty (honest disagreement is expected)
- But consistently outlier votes may affect reputation

## Security Considerations

### Anti-Collusion
- Random jury selection makes coordination difficult
- Jurors don't know each other's votes until deadline
- Large stake at risk discourages collusion

### Sybil Resistance
- Becoming a juror requires being an active auditor
- Creating fake auditors requires real capital (staking)
- Historical accuracy matters for selection

### Appeal Safety
- Higher deposit for appeals prevents frivolous appeals
- New jury ensures fresh perspective
- Finality prevents infinite appeal loops

## Best Practices for Jurors

1. **Review thoroughly** — Read all evidence before voting
2. **Be objective** — Vote based on evidence, not relationships
3. **Meet deadline** — Late votes don't count
4. **Document reasoning** — Keep notes in case of appeals
5. **Participate actively** — Jury duty is essential to protocol health
