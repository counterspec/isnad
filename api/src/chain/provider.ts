/**
 * Multi-network provider for ISNAD API
 * 
 * Note: Using @ts-ignore to suppress viem's strict chain-specific types.
 * base and baseSepolia have incompatible transaction types (deposit vs legacy).
 */

import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { NetworkConfig, NETWORKS, NetworkName } from './networks';

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

  // @ts-ignore - viem chain types are incompatible between base/baseSepolia
  const newClient = createPublicClient({
    chain: network.name === 'mainnet' ? base : baseSepolia,
    transport: http(network.rpcUrl),
  });

  // @ts-ignore - storing in untyped cache
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
// @ts-ignore - viem type inference
export const client = createPublicClient({
  chain: base,
  transport: http(NETWORKS.mainnet.rpcUrl),
});
