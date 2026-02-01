import ISNADTokenABI from './abis/ISNADToken.json';
import ISNADRegistryABI from './abis/ISNADRegistry.json';
import ISNADStakingABI from './abis/ISNADStaking.json';

// Contract addresses per chain
export const CONTRACTS = {
  // Base Sepolia testnet
  84532: {
    token: '0x56d202C2E1C5a3D7538Ed6CAD674d4E07D83cbb4',
    registry: '0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93',
    staking: '0x2B5aF6cd0AF41B534aA117eECE7650dDE8B044bE',
  },
  // Base mainnet (TODO: Deploy)
  8453: {
    token: '0x0000000000000000000000000000000000000000',
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

export function getContracts(chainId: number) {
  return CONTRACTS[chainId as keyof typeof CONTRACTS] || CONTRACTS[84532];
}

export function getTierName(tier: number): string {
  switch (tier) {
    case 0: return 'UNVERIFIED';
    case 1: return 'COMMUNITY';
    case 2: return 'VERIFIED';
    case 3: return 'TRUSTED';
    default: return 'UNKNOWN';
  }
}
