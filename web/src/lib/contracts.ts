import ISNADTokenABI from './abis/ISNADToken.json';
import ISNADRegistryABI from './abis/ISNADRegistry.json';
import ISNADStakingABI from './abis/ISNADStaking.json';

// Contract addresses per chain
export const CONTRACTS = {
  // Base Sepolia testnet (v2 with AutoUnpausable)
  84532: {
    token: '0xc41c1006A1AaC093C758A2f09de16fee2561651A',
    registry: '0x5A06453257874Fd000738F28C462d17BFf8e1EA3',
    staking: '0x58983D142A388A96B7d9F970005483AA044CCAD9',
    oracle: '0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7',
    rewardPool: '0x474cB2441C0Af053DAe052302a6829a218Aa656F',
    timelock: '0x2c99dB618a6dBFf0F0e74f7949fcC9A23ffB4A69',
    governor: '0xf08269e04029eB0eeAfcE10Ed3aa9Fb2bAbB61Cd',
  },
  // Base mainnet (LIVE)
  8453: {
    token: '0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5',
    registry: '0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01',      // V2 (active)
    registryV1: '0xb8264f3117b498ddF912EBF641B2301103D80f06',   // V1 (legacy)
    staking: '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca',
    oracle: '0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd',
    rewardPool: '0x790b0766e9e2db7c59526b247851D16bB493a95B',
    timelock: '0x3Ef44fb908C86865A9315277f9AFc6b65A87e702',
    governor: '0xB230Ffa9CA40F705756BC12698119f1B45687cd6',
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

// Default chain - Base mainnet
export const DEFAULT_CHAIN_ID = 8453;

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
