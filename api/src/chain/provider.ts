/**
 * Multi-network provider for ISNAD API
 */

import { createPublicClient, http, PublicClient } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { NetworkConfig, NETWORKS, NetworkName } from './networks';

// Cache clients per network
const clients: Map<NetworkName, PublicClient> = new Map();

/**
 * Get a viem PublicClient for the specified network
 */
export function getClient(network: NetworkConfig): PublicClient {
  const cached = clients.get(network.name);
  if (cached) return cached;

  const chain = network.name === 'mainnet' ? base : baseSepolia;
  
  const client = createPublicClient({
    chain,
    transport: http(network.rpcUrl),
  });

  clients.set(network.name, client);
  return client;
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
