/**
 * Network configuration for ISNAD API
 * Supports mainnet (Base) and sepolia (Base Sepolia) testnet
 */

export type NetworkName = 'mainnet' | 'sepolia';

export interface NetworkConfig {
  name: NetworkName;
  chainId: number;
  displayName: string;
  rpcUrl: string;
  explorer: string;
  contracts: {
    token: `0x${string}`;
    registry: `0x${string}`;
    staking: `0x${string}`;
    oracle: `0x${string}`;
    rewardPool: `0x${string}`;
  };
}

export const NETWORKS: Record<NetworkName, NetworkConfig> = {
  mainnet: {
    name: 'mainnet',
    chainId: 8453,
    displayName: 'Base',
    rpcUrl: process.env.BASE_RPC || 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    contracts: {
      token: '0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5',
      registry: '0xb8264f3117b498ddF912EBF641B2301103D80f06',
      staking: '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca',
      oracle: '0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd',
      rewardPool: '0x790b0766e9e2db7c59526b247851D16bB493a95B',
    },
  },
  sepolia: {
    name: 'sepolia',
    chainId: 84532,
    displayName: 'Base Sepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org',
    contracts: {
      token: '0x07d921D275aD82e71aE42f2B603CF2926329c1Ce',
      registry: '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca',
      staking: '0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd',
      oracle: '0x790b0766e9e2db7c59526b247851D16bB493a95B',
      rewardPool: '0x3Ef44fb908C86865A9315277f9AFc6b65A87e702',
    },
  },
};

export const DEFAULT_NETWORK: NetworkName = 'mainnet';

export function getNetwork(name?: string): NetworkConfig {
  if (!name || name === 'mainnet' || name === 'base') {
    return NETWORKS.mainnet;
  }
  if (name === 'sepolia' || name === 'testnet' || name === 'base-sepolia') {
    return NETWORKS.sepolia;
  }
  throw new Error(`Unknown network: ${name}. Valid options: mainnet, sepolia`);
}

export function isValidNetwork(name: string): name is NetworkName {
  return name === 'mainnet' || name === 'sepolia';
}
