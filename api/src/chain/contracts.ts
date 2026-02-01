import dotenv from 'dotenv';
dotenv.config();

export const ADDRESSES = {
  token: process.env.ISNAD_TOKEN_ADDRESS as `0x${string}`,
  registry: process.env.ISNAD_REGISTRY_ADDRESS as `0x${string}`,
  staking: process.env.ISNAD_STAKING_ADDRESS as `0x${string}`,
};

// Minimal ABIs for events we care about
export const STAKING_ABI = [
  {
    type: 'event',
    name: 'Staked',
    inputs: [
      { name: 'auditor', type: 'address', indexed: true },
      { name: 'resourceHash', type: 'bytes32', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'lockDuration', type: 'uint256', indexed: false },
      { name: 'stakeId', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Unstaked',
    inputs: [
      { name: 'auditor', type: 'address', indexed: true },
      { name: 'stakeId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Slashed',
    inputs: [
      { name: 'stakeId', type: 'uint256', indexed: true },
      { name: 'resourceHash', type: 'bytes32', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'reason', type: 'string', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'getTrustScore',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTrustTier',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getResourceAuditorCount',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export const REGISTRY_ABI = [
  {
    type: 'event',
    name: 'ResourceInscribed',
    inputs: [
      { name: 'resourceHash', type: 'bytes32', indexed: true },
      { name: 'inscriber', type: 'address', indexed: true },
      { name: 'contentType', type: 'string', indexed: false },
      { name: 'uri', type: 'string', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'getResource',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [
      { name: 'inscriber', type: 'address' },
      { name: 'contentType', type: 'string' },
      { name: 'uri', type: 'string' },
      { name: 'inscribedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const;
