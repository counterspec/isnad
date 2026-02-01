# Smart Contracts

ISNAD is deployed on Base network with a modular contract architecture.

## Contract Addresses

### Base Sepolia (Testnet)

| Contract | Address |
|----------|---------|
| ISNADToken | `0xc41c1006A1AaC093C758A2f09de16fee2561651A` |
| ISNADRegistry | `0x5A06453257874Fd000738F28C462d17BFf8e1EA3` |
| ISNADStaking | `0x58983D142A388A96B7d9F970005483AA044CCAD9` |
| ISNADOracle | `0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7` |
| ISNADRewardPool | `0x474cB2441C0Af053DAe052302a6829a218Aa656F` |
| TimelockController | `0x2c99dB618a6dBFf0F0e74f7949fcC9A23ffB4A69` |
| ISNADGovernor | `0xf08269e04029eB0eeAfcE10Ed3aa9Fb2bAbB61Cd` |

### Base Mainnet

Coming soon after testnet validation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      ISNAD Protocol                         │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  ISNADToken  │ ISNADRegistry│ ISNADStaking │  ISNADOracle  │
│  (ERC20 +    │  (inscribe   │  (stake +    │  (flag +      │
│   votes)     │   + metadata)│   attest)    │   jury)       │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  ISNADRewardPool        │        ISNADGovernor             │
│  (yield distribution)   │        (DAO + timelock)          │
└─────────────────────────┴──────────────────────────────────┘
```

## Contract Descriptions

### ISNADToken

ERC20 token with governance capabilities.

**Features:**
- ERC20 standard functions
- ERC20Votes extension for governance
- Fixed max supply: 1 billion tokens
- MINTER_ROLE: Reward pool can mint
- BURNER_ROLE: Staking contract can burn (slashing)

**Key Functions:**
```solidity
function mint(address to, uint256 amount) external;
function burn(address from, uint256 amount) external;
function delegate(address delegatee) external;
```

### ISNADRegistry

Stores resource inscriptions permanently on-chain.

**Features:**
- Resources identified by SHA-256 content hash
- Metadata stored in calldata (inscription style)
- Supports chunked uploads for large files
- Immutable once inscribed

**Key Functions:**
```solidity
function inscribe(
    bytes32 contentHash,
    uint8 resourceType,
    bytes calldata metadata,
    bytes calldata content
) external returns (bytes32);

function getResource(bytes32 contentHash) external view returns (
    bool inscribed,
    address author,
    uint256 blockNumber,
    string memory metadataUri
);
```

### ISNADStaking

Core attestation mechanism.

**Features:**
- Auditors stake tokens on resources
- Configurable lock durations (7-90 days)
- Trust score calculation with multipliers
- Slashing on Oracle verdict

**Key Functions:**
```solidity
function stake(
    bytes32 resourceHash,
    uint256 amount,
    uint256 lockDuration
) external returns (bytes32 attestationId);

function unstake(bytes32 attestationId) external;

function getTrustScore(bytes32 resourceHash) external view returns (uint256);

function getTrustTier(bytes32 resourceHash) external view returns (uint8);

function getAttestation(bytes32 attestationId) external view returns (
    address auditor,
    bytes32 resourceHash,
    uint256 amount,
    uint256 lockUntil,
    uint256 lockDuration,
    bool slashed
);
```

### ISNADOracle

Detection and jury system.

**Features:**
- Flag malicious resources
- Random jury selection (5 members)
- 67% supermajority for verdict
- Appeals with 2x deposit

**Key Functions:**
```solidity
function flag(
    bytes32 resourceHash,
    string calldata evidence
) external;

function vote(bytes32 flagId, uint8 verdict) external;

function executeVerdict(bytes32 flagId) external;

function appeal(bytes32 flagId) external;
```

### ISNADRewardPool

Distributes yield to auditors.

**Features:**
- Yield based on stake amount and duration
- Lock multipliers: 30d=1x, 60d=1.25x, 90d=1.5x
- Funded by protocol fees and treasury
- Adjustable APY via governance

**Key Functions:**
```solidity
function claimRewards() external;

function calculateRewards(address auditor) external view returns (uint256);
```

### ISNADGovernor + TimelockController

DAO governance for protocol upgrades.

**Features:**
- OpenZeppelin Governor pattern
- 2-day timelock on execution
- 4% quorum requirement
- 100,000 $ISNAD proposal threshold

**Governable Parameters:**
- Trust tier thresholds
- Lock duration limits
- Reward pool APY
- Flag deposit amount
- Contract upgrades

## Trust Tier Thresholds

| Tier | Enum Value | Threshold |
|------|------------|-----------|
| UNVERIFIED | 0 | 0 |
| COMMUNITY | 1 | 100 $ISNAD |
| VERIFIED | 2 | 1,000 $ISNAD |
| TRUSTED | 3 | 10,000 $ISNAD |

## Lock Duration Multipliers

| Duration | Multiplier | Weighted Score |
|----------|------------|----------------|
| 7 days | 1.0x | stake × 1.0 |
| 30 days | 1.0x | stake × 1.0 |
| 60 days | 1.25x | stake × 1.25 |
| 90 days | 1.5x | stake × 1.5 |

## Integration Example

Using viem:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { ISNADStakingABI, ISNADTokenABI } from '@isnad/contracts';

const STAKING_ADDRESS = '0x58983D142A388A96B7d9F970005483AA044CCAD9';
const TOKEN_ADDRESS = '0xc41c1006A1AaC093C758A2f09de16fee2561651A';

// Read trust score
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const trustScore = await publicClient.readContract({
  address: STAKING_ADDRESS,
  abi: ISNADStakingABI,
  functionName: 'getTrustScore',
  args: [resourceHash],
});

// Stake tokens (requires wallet)
const walletClient = createWalletClient({ ... });

// 1. Approve
await walletClient.writeContract({
  address: TOKEN_ADDRESS,
  abi: ISNADTokenABI,
  functionName: 'approve',
  args: [STAKING_ADDRESS, amount],
});

// 2. Stake
await walletClient.writeContract({
  address: STAKING_ADDRESS,
  abi: ISNADStakingABI,
  functionName: 'stake',
  args: [resourceHash, amount, lockDuration],
});
```

## Security

- All contracts use OpenZeppelin libraries
- Slither static analysis completed
- Zero-address checks on all inputs
- ReentrancyGuard on state-changing functions
- Role-based access control

## Source Code

All contracts are open source and verified on BaseScan:

- GitHub: https://github.com/counterspec/isnad/tree/main/contracts
- BaseScan: https://sepolia.basescan.org/address/[contract_address]
