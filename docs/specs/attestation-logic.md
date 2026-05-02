
# Attestation Logic in ISNAD Protocol

## Overview
The ISNAD protocol implements attestations through a staking mechanism where auditors stake tokens to attest to the legitimacy of resources. This process is managed by the `ISNADStaking` contract.

## Attestation Process

### `stake` Function
The primary function for creating attestations is the `stake` function in the `ISNADStaking` contract. This function allows auditors to stake tokens on a resource, effectively attesting to its legitimacy.

#### Parameters
- **`resourceHash`**: A unique hash of the resource being attested to.
- **`amount`**: The amount of tokens to stake.
- **`lockDuration`**: How long the tokens will be locked (in seconds).

#### Process
1. The auditor calls the `stake` function with the resource hash, amount, and lock duration.
2. The contract generates a unique attestation ID.
3. The tokens are transferred to the contract and locked for the specified duration.
4. The attestation is recorded in the system's attestation registry.

### Technical Implementation Details
- **Resource Identification**: Resources are identified by their hash (`resourceHash`).
- **Staking Mechanism**: Auditors stake tokens to attest to the legitimacy of a resource.
- **Lock Duration**: Tokens are locked for a specified period, which can range from 7 days to 90 days.
- **Whale Caps**: Prevents any single auditor from controlling too much stake on a resource.
- **Concentration Cap**: Ensures no single auditor can have more than 33% of the stake on a resource.

## Verification and Rewards
- **Verification**: The `ISNADOracle` contract is responsible for verifying the legitimacy of resources and can slash attestations if they are found to be malicious.
- **Rewards**: The `ISNADRewardPool` contract distributes rewards to auditors based on their staked amount and lock duration.

## Example Usage
```solidity
// Example of how an auditor can stake tokens on a resource
function stakeOnResource(
    bytes32 resourceHash,
    uint256 amount,
    uint256 lockDuration
) public {
    ISNADStaking stakingContract = ISNADStaking(stakingAddress);
    bytes32 attestationId = stakingContract.stake(resourceHash, amount, lockDuration);
}
```

## Summary
The ISNAD protocol uses a staking mechanism to implement attestations. Auditors stake tokens on resources to attest to their legitimacy. The `ISNADStaking` contract manages the attestation process, while the `ISNADOracle` contract verifies the legitimacy of resources and can slash attestations if necessary. The `ISNADRewardPool` contract distributes rewards to auditors based on their staked amount and lock duration.

Completed attestation documentation for [counterspec/isnad].
