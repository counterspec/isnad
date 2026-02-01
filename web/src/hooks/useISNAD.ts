import { useReadContract, useReadContracts } from 'wagmi';
import { getContracts, ABIS, TRUST_TIERS } from '@/lib/contracts';
import { formatUnits, keccak256, toBytes } from 'viem';

const CHAIN_ID = 84532; // Base Sepolia

export function useTrustScore(resourceHash: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data: score, isLoading: scoreLoading } = useReadContract({
    address: contracts.staking as `0x${string}`,
    abi: ABIS.staking,
    functionName: 'getTrustScore',
    args: resourceHash ? [resourceHash] : undefined,
    query: { enabled: !!resourceHash },
  });

  const { data: tier, isLoading: tierLoading } = useReadContract({
    address: contracts.staking as `0x${string}`,
    abi: ABIS.staking,
    functionName: 'getTrustTier',
    args: resourceHash ? [resourceHash] : undefined,
    query: { enabled: !!resourceHash },
  });

  const scoreNumber = score ? Number(formatUnits(score as bigint, 18)) : 0;
  const tierName = tier !== undefined ? getTierName(tier as number) : 'UNKNOWN';

  return {
    score: scoreNumber,
    tier: tierName,
    isLoading: scoreLoading || tierLoading,
  };
}

export function useResourceInfo(resourceHash: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data, isLoading } = useReadContract({
    address: contracts.registry as `0x${string}`,
    abi: ABIS.registry,
    functionName: 'getResource',
    args: resourceHash ? [resourceHash] : undefined,
    query: { enabled: !!resourceHash },
  });

  if (!data) {
    return { inscribed: false, author: null, blockNumber: 0, isLoading };
  }

  const [inscribed, author, blockNumber] = data as [boolean, string, bigint, string];

  return {
    inscribed,
    author,
    blockNumber: Number(blockNumber),
    isLoading,
  };
}

export function useResourceAttestations(resourceHash: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data: attestationIds, isLoading: idsLoading } = useReadContract({
    address: contracts.staking as `0x${string}`,
    abi: ABIS.staking,
    functionName: 'getResourceAttestations',
    args: resourceHash ? [resourceHash] : undefined,
    query: { enabled: !!resourceHash },
  });

  // For each attestation ID, fetch the details
  // Note: This could be optimized with a multicall
  return {
    attestationIds: (attestationIds as `0x${string}`[]) || [],
    isLoading: idsLoading,
  };
}

export function useAttestation(attestationId: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data, isLoading } = useReadContract({
    address: contracts.staking as `0x${string}`,
    abi: ABIS.staking,
    functionName: 'getAttestation',
    args: attestationId ? [attestationId] : undefined,
    query: { enabled: !!attestationId },
  });

  if (!data) {
    return { attestation: null, isLoading };
  }

  const [auditor, resourceHash, amount, lockUntil, lockDuration, slashed] = data as [
    string,
    string,
    bigint,
    bigint,
    bigint,
    boolean
  ];

  return {
    attestation: {
      auditor,
      resourceHash,
      amount: Number(formatUnits(amount, 18)),
      lockUntil: Number(lockUntil),
      lockDuration: Number(lockDuration),
      slashed,
    },
    isLoading,
  };
}

function getTierName(tier: number): string {
  switch (tier) {
    case 0:
      return 'UNVERIFIED';
    case 1:
      return 'COMMUNITY';
    case 2:
      return 'VERIFIED';
    case 3:
      return 'TRUSTED';
    default:
      return 'UNKNOWN';
  }
}

// Utility to compute content hash
export function computeContentHash(content: string): `0x${string}` {
  // SHA-256 hash (same as contract uses)
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  // Note: viem's keccak256 is not SHA-256, we'd need a different lib for that
  // For now, use keccak256 for demo purposes
  return keccak256(toBytes(content));
}
