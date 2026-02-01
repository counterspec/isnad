import ISNADTokenABI from './abis/ISNADToken.json';
import ISNADRegistryABI from './abis/ISNADRegistry.json';
import ISNADStakingABI from './abis/ISNADStaking.json';

// Contract addresses per chain
export const CONTRACTS = {
  // Base Sepolia testnet
  84532: {
    token: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    registry: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
  },
  // Base mainnet
  8453: {
    token: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    registry: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
  },
  // Localhost
  31337: {
    token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    registry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    staking: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
} as const;

export const ABIS = {
  token: ISNADTokenABI,
  registry: ISNADRegistryABI,
  staking: ISNADStakingABI,
} as const;

// Default chain for development
export const DEFAULT_CHAIN_ID = 84532;

// Trust tier thresholds (in ISNAD tokens, not wei)
export const TRUST_TIERS = {
  COMMUNITY: 100,
  VERIFIED: 1000,
  TRUSTED: 10_000,
} as const;

// Lock duration tiers (in days)
export const LOCK_TIERS = {
  SHORT: 7,
  MEDIUM: 30,
  LONG: 90,
} as const;

// Lock multipliers
export const LOCK_MULTIPLIERS = {
  7: 1.0,
  30: 1.5,
  90: 2.0,
} as const;

export type ChainId = keyof typeof CONTRACTS;

export function getContracts(chainId: number) {
  return CONTRACTS[chainId as ChainId] || CONTRACTS[DEFAULT_CHAIN_ID];
}
