'use client';

import { useEffect, useState } from 'react';
import { api, Auditor, formatTokenAmount } from '@/lib/api';

export interface FormattedAuditor {
  rank: number;
  address: string;
  shortAddress: string;
  totalStaked: string;
  totalStakedRaw: bigint;
  attestationCount: number;
  accuracy: number;
  burnCount: number;
}

export function useAuditors(limit: number = 10) {
  const [auditors, setAuditors] = useState<FormattedAuditor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAuditors() {
      try {
        const data = await api.getAuditors(limit);
        if (mounted) {
          const formatted = data.map((a, i) => ({
            rank: i + 1,
            address: a.address,
            shortAddress: `${a.address.slice(0, 6)}...${a.address.slice(-4)}`,
            totalStaked: formatTokenAmount(a.totalStaked),
            totalStakedRaw: BigInt(a.totalStaked),
            attestationCount: a.attestationCount,
            accuracy: a.accuracy,
            burnCount: a.burnCount,
          }));
          setAuditors(formatted);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch auditors');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAuditors();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { auditors, isLoading, error };
}
