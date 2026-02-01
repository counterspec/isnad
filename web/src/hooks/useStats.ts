'use client';

import { useEffect, useState } from 'react';
import { api, Stats, formatTokenAmount } from '@/lib/api';

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const data = await api.getStats();
        if (mounted) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    formatted: stats ? {
      resources: stats.resources.toLocaleString(),
      attestations: stats.attestations.toLocaleString(),
      auditors: stats.auditors.toLocaleString(),
      totalStaked: formatTokenAmount(stats.totalStaked),
    } : null,
  };
}
