'use client';

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getContracts, ABIS } from '@/lib/contracts';

const CHAIN_ID = 84532; // Base Sepolia

// Token approval hook
export function useTokenApproval() {
  const contracts = getContracts(CHAIN_ID);
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: string) => {
    const amountWei = parseUnits(amount, 18);
    writeContract({
      address: contracts.token as `0x${string}`,
      abi: ABIS.token,
      functionName: 'approve',
      args: [contracts.staking, amountWei],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Check token allowance
export function useTokenAllowance(owner: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data, isLoading, refetch } = useReadContract({
    address: contracts.token as `0x${string}`,
    abi: ABIS.token,
    functionName: 'allowance',
    args: owner ? [owner, contracts.staking] : undefined,
    query: { enabled: !!owner },
  });

  return {
    allowance: data ? Number(formatUnits(data as bigint, 18)) : 0,
    allowanceRaw: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Check token balance
export function useTokenBalance(address: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data, isLoading, refetch } = useReadContract({
    address: contracts.token as `0x${string}`,
    abi: ABIS.token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    balance: data ? Number(formatUnits(data as bigint, 18)) : 0,
    balanceRaw: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Stake tokens on a resource
export function useStake() {
  const contracts = getContracts(CHAIN_ID);
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (resourceHash: `0x${string}`, amount: string, lockDurationDays: number) => {
    const amountWei = parseUnits(amount, 18);
    const lockDurationSeconds = BigInt(lockDurationDays * 24 * 60 * 60);
    
    writeContract({
      address: contracts.staking as `0x${string}`,
      abi: ABIS.staking,
      functionName: 'stake',
      args: [resourceHash, amountWei, lockDurationSeconds],
    });
  };

  return {
    stake,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Unstake tokens
export function useUnstake() {
  const contracts = getContracts(CHAIN_ID);
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstake = (attestationId: `0x${string}`) => {
    writeContract({
      address: contracts.staking as `0x${string}`,
      abi: ABIS.staking,
      functionName: 'unstake',
      args: [attestationId],
    });
  };

  return {
    unstake,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Get auditor's attestations
export function useAuditorAttestations(auditor: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data, isLoading, refetch } = useReadContract({
    address: contracts.staking as `0x${string}`,
    abi: ABIS.staking,
    functionName: 'getAuditorAttestations',
    args: auditor ? [auditor] : undefined,
    query: { enabled: !!auditor },
  });

  return {
    attestationIds: (data as `0x${string}`[]) || [],
    isLoading,
    refetch,
  };
}

// Get auditor's total stake
export function useAuditorTotalStake(auditor: `0x${string}` | undefined) {
  const contracts = getContracts(CHAIN_ID);

  const { data, isLoading } = useReadContract({
    address: contracts.staking as `0x${string}`,
    abi: ABIS.staking,
    functionName: 'auditorTotalStake',
    args: auditor ? [auditor] : undefined,
    query: { enabled: !!auditor },
  });

  return {
    totalStake: data ? Number(formatUnits(data as bigint, 18)) : 0,
    totalStakeRaw: data as bigint | undefined,
    isLoading,
  };
}

// Lock duration multipliers for display
export const LOCK_MULTIPLIERS = [
  { days: 7, multiplier: 1.0, label: '7 days' },
  { days: 30, multiplier: 1.0, label: '30 days' },
  { days: 60, multiplier: 1.25, label: '60 days (1.25x)' },
  { days: 90, multiplier: 1.5, label: '90 days (1.5x)' },
] as const;
