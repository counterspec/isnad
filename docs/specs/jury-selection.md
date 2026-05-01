
# Auditor Jury Selection Logic

## Overview
The Auditor Jury selection process in the [counterspec/isnad] protocol is designed to randomly select auditors for verification tasks based on stake weight and historical accuracy. This ensures a fair and robust representation of stakeholders.

### Random Selection Based on Stake Weight and Accuracy
The protocol selects auditors using a weighted random selection mechanism:

- **Jury Size**: The jury size is determined by the trust tier of the resource being verified. For instance, a resource requiring a higher trust tier will have a larger jury.
- **Weighted Selection**: Auditors are selected based on their stake weight and historical accuracy. The selection process ensures that auditors with higher stake and better track records have a higher probability of being chosen.

### Number of Auditors
The number of auditors selected varies based on the trust tier:
- **3-Auditor Jury**: Typically used for lower trust tiers.
- **5-Auditor Jury**: Used for higher trust tiers, such as TRUSTED and CERTIFIED.

### Jury Selection Criteria
The selection criteria for the jury include:
- **Historical Accuracy**: Auditors must have a historical accuracy of greater than 90%.
- **No Conflicts of Interest**: Auditors must not have staked on the flagged resource.
- **Independent Funding Sources**: Auditors must not share funding sources with the flagger or resource author.
- **Randomness**: Randomness is derived from block hash and VRF (Verifiable Random Function).

## Detailed Selection Process

### Step-by-Step Process
1. **Trigger**: When a resource is flagged, the protocol initiates the jury selection process.
2. **Eligibility Check**: The protocol checks the eligibility of potential auditors based on the criteria mentioned above.
3. **Weight Calculation**: Each eligible auditor's weight is calculated based on their stake and historical accuracy.
4. **Random Selection**: Using a weighted random selection mechanism, the protocol selects the required number of auditors (3 or 5).
5. **Jury Formation**: The selected auditors form the jury to review the evidence and resource content.

### Thresholds and Trust Tiers
The trust tiers and the corresponding number of auditors are defined as follows:
- **VERIFIED**: Requires at least 2 auditors.
- **TRUSTED**: Requires at least 3 auditors.
- **CERTIFIED**: Requires at least 5 auditors.

## Implementation Details
The jury selection logic is detailed in the WHITEPAPER.md, specifically in the section on the Detection Architecture. The process is implemented in the smart contracts, particularly in the Detection Oracle contract, which handles jury selection, evidence review, and verdict execution.

## Whitepaper Reference
For detailed mathematical and technical specifications, refer to the [WHITEPAPER.md](WHITEPAPER.md) in the repository, particularly sections 373-390.

---
