
# Trust Tiers FAQ for Auditors

## What are Trust Tiers?

Trust Tiers are different levels of trust assigned to AI resources based on the amount of $ISNAD staked by auditors and the number of independent auditors involved. Higher tiers indicate higher confidence in the safety and reliability of the resource.

| Tier         | Stake Required | Auditor Diversity | Time Clean | Badge |
|--------------|----------------|--------------------|------------|-------|
| UNVERIFIED   | 0              | 0                  | —          | ⚠️    |
| REVIEWED     | ≥100 $ISNAD     | 1+ auditor         | —          | 🔍    |
| VERIFIED     | ≥1,000 $ISNAD   | 2+ auditors        | 14 days    | ✅    |
| TRUSTED      | ≥10,000 $ISNAD  | 3+ auditors        | 60 days    | 🛡️   |
| CERTIFIED    | ≥50,000 $ISNAD  | 5+ auditors        | 180 days   | 💎    |

---

## How do Trust Tiers affect staking rewards?

### What is the relationship between lock period and yield?

The longer you lock your stake, the higher the Annual Percentage Yield (APY) you earn. This incentivizes auditors to commit to resources they are highly confident in.

| Lock Period | Base APY | Slash Risk Window |
|-------------|----------|-------------------|
| 30 days     | 5%       | 30 days           |
| 90 days     | 8%       | 90 days           |
| 180 days    | 12%      | 180 days          |

### How are rewards distributed?

Rewards come from the reward pool, which is funded by slashed stakes and protocol inflation. The yield is distributed proportionally to the amount of $ISNAD staked and the lock period chosen.

---

## How do Trust Tiers affect slashing risks?

### What happens if a resource is found to be malicious?

If a resource is flagged as malicious, auditors who staked on it may face slashing, depending on the severity of the issue:

| Severity     | Slash Amount | Criteria                          | Appeal? |
|--------------|--------------|------------------------------------|---------|
| Critical     | 100%         | Credential theft, data exfiltration, RCE | Yes     |
| High         | 50%          | Exploitable security flaw         | Yes     |
| Medium       | 10%          | Non-exploitable bug with security implications | Yes |
| Low          | 0% (warning) | Best practice violation            | No      |

### How are slashes executed?

When a resource is flagged, a jury of auditors reviews the evidence and votes on whether the resource is malicious. If a supermajority (5/7) votes for a malicious verdict, the slashes are executed.

---

## How do I become an auditor and contribute to Trust Tiers?

### What are the requirements to become an auditor?

To become an auditor, you need to stake $ISNAD tokens to attest to the safety of AI resources. The amount you stake and the number of independent auditors determine the Trust Tier of the resource.

### How do I ensure my attestations are independent?

Auditors must have different funding sources and not share a common wallet in transaction history. This ensures that no single entity can manipulate the trust score of a resource.

---

## What should I do if I suspect a resource is malicious?

### How can I flag a resource?

You can flag a resource by staking 50 $ISNAD and submitting evidence on-chain. The evidence must be permanently verifiable and include clear proof of the malicious behavior.

### What happens after I flag a resource?

After you flag a resource, a jury of auditors will be randomly selected to review the evidence. If a supermajority (5/7) votes for a malicious verdict, the slashes will be executed, and the resource will be marked as malicious.

---

## Additional Resources

For more information on becoming an auditor or understanding the mechanics of Trust Tiers, refer to the [ISNAD Whitepaper](https://github.com/counterspec/isnad/blob/main/WHITEPAPER.md).

