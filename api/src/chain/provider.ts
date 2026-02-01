/**
 * Multi-network provider for ISNAD API
 */

import { createPublicClient, http, PublicClient, Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { NetworkConfig, NETWORKS, NetworkName } from './networks';

// Use 'any' for the client map to avoid viem's strict chain-specific types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clients: Map<NetworkName, any> = new Map();

/**
 * Get a viem PublicClient for the specified network
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClient(network: NetworkConfig): any {
  const cached = clients.get(network.name);
  if (cached) return cached;

  const chainConfig = network.name === 'mainnet' ? base : baseSepolia;
  
  const newClient = createPublicClient({
    chain: chainConfig,
    transport: http(network.rpcUrl),
  });

  clients.set(network.name, newClient);
  return newClient;
}

/**
 * Get client for mainnet (convenience)
 */
export function getMainnetClient(): PublicClient {
  return getClient(NETWORKS.mainnet);
}

/**
 * Get client for sepolia (convenience)
 */
export function getSepoliaClient(): PublicClient {
  return getClient(NETWORKS.sepolia);
}

// Legacy exports for indexer compatibility
export const chain = base;
export const client = createPublicClient({
  chain: base,
  transport: http(NETWORKS.mainnet.rpcUrl),
});
