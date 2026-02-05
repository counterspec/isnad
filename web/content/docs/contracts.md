# Smart Contracts

ISNAD protocol contracts deployed on Base mainnet.

## Contract Addresses

| Contract | Address |
|----------|---------|
| ISNAD Token | `0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5` |
| Registry V2 | `0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01` |
| Staking | `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` |
| Oracle | `0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd` |
| RewardPool | `0x790b0766e9e2db7c59526b247851D16bB493a95B` |
| Timelock | `0x3Ef44fb908C86865A9315277f9AFc6b65A87e702` |
| Governor | `0xB230Ffa9CA40F705756BC12698119f1B45687cd6` |

## ISNADToken

ERC-20 token with governance capabilities.

```solidity
interface IISNADToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function delegate(address delegatee) external;
    function getVotes(address account) external view returns (uint256);
}
```

## ISNADStaking

Core staking and attestation contract.

```solidity
interface IISNADStaking {
    // Staking
    function stake(uint256 amount) external;
    function requestUnstake(uint256 amount) external;
    function completeUnstake() external;
    
    // Attestations
    function attest(bytes32 resourceHash, bool positive) external;
    function getAttestations(bytes32 resourceHash) external view returns (Attestation[] memory);
    
    // Trust scores
    function getTrustScore(bytes32 resourceHash) external view returns (uint256);
    function getTrustTier(bytes32 resourceHash) external view returns (TrustTier);
}

enum TrustTier { UNVERIFIED, PENDING, VERIFIED, TRUSTED, CANONICAL }
```

## ISNADRegistry

Resource registration and metadata.

```solidity
interface IISNADRegistry {
    function register(bytes32 contentHash, string calldata uri) external;
    function getResource(bytes32 contentHash) external view returns (Resource memory);
    function computeHash(bytes calldata content) external pure returns (bytes32);
}
```

## Integration Example

```typescript
import { ethers } from "ethers";
import { ISNADStaking__factory } from "@isnad/contracts";

const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
const staking = ISNADStaking__factory.connect(
  "0x916FFb3eB82616220b81b99f70c3B7679B9D62ca",
  provider
);

// Check trust score
const score = await staking.getTrustScore(resourceHash);
const tier = await staking.getTrustTier(resourceHash);

console.log(`Trust: ${ethers.formatUnits(score, 18)} (${tier})`);
```

## NPM Package

```bash
npm install @isnad/contracts
```

## Source Code

GitHub: [github.com/counterspec/isnad](https://github.com/counterspec/isnad)
