import { createPublicClient, http, Chain } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const CHAIN_ID = parseInt(process.env.CHAIN_ID || '84532');

const chains: Record<number, Chain> = {
  84532: baseSepolia,
  8453: base,
};

export const chain = chains[CHAIN_ID] || baseSepolia;

export const client = createPublicClient({
  chain,
  transport: http(process.env.RPC_URL),
});

export const getBlockNumber = async (): Promise<bigint> => {
  return client.getBlockNumber();
};
