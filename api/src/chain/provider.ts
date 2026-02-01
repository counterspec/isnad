/**
 * Multi-network provider for ISNAD API
 */

import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { NetworkConfig, NETWORKS, NetworkName } from './networks';

// Use Record to avoid viem's strict chain-specific PublicClient types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clients: Record<string, any> = {};

/**
 * Get a viem PublicClient for the specified network
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClient(network: NetworkConfig): any {
  if (clients[network.name]) {
    return clients[network.name];
  }

  const chainConfig = network.name === 'mainnet' ? base : baseSepolia;
  
  // Cast to any to avoid viem's chain-specific type inference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newClient: any = createPublicClient({
    chain: chainConfig,
    transport: http(network.rpcUrl),
  });

  clients[network.name] = newClient;
  return newClient;
}

/**
 * Get client for mainnet (convenience)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMainnetClient(): any {
  return getClient(NETWORKS.mainnet);
}

/**
 * Get client for sepolia (convenience)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSepoliaClient(): any {
  return getClient(NETWORKS.sepolia);
}

// Legacy exports for indexer compatibility
export const chain = base;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const client: any = createPublicClient({
  chain: base,
  transport: http(NETWORKS.mainnet.rpcUrl),
});
