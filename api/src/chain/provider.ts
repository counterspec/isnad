/**
 * Chain provider for ISNAD API (mainnet only)
 */

import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';

export const chain = base;

export const client = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});
