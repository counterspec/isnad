/**
 * useStats Hook Tests
 * Test IDs: HST-001 through HST-007
 * Priority: P0 (Critical)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock module with inline implementation
vi.mock('@/lib/api', () => {
  const mockStats = {
    resources: 150,
    attestations: 2300,
    auditors: 45,
    totalStaked: '5000000000000000000000',
    tiers: { '0': 50, '1': 60, '2': 30, '3': 10 },
    lastSyncedBlock: '12345678',
    lastSyncedAt: '2026-02-09T10:00:00Z',
  };
  
  return {
    api: {
      getStats: vi.fn().mockResolvedValue(mockStats),
    },
    formatTokenAmount: (amount: string | bigint) => {
      const value = typeof amount === 'string' ? BigInt(amount) : amount;
      const formatted = Number(value) / 1e18;
      if (formatted >= 1_000_000) return `${(formatted / 1_000_000).toFixed(1)}M`;
      if (formatted >= 1_000) return `${(formatted / 1_000).toFixed(1)}K`;
      return formatted.toLocaleString(undefined, { maximumFractionDigits: 0 });
    },
  };
});

// Import after mocking
import { useStats } from '@/hooks/useStats';
import { api } from '@/lib/api';

describe('useStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // HST-001: Returns loading state initially
  it('HST-001: returns loading state initially', () => {
    const { result } = renderHook(() => useStats());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // HST-002: Returns stats after successful fetch
  it('HST-002: returns stats after successful fetch', async () => {
    const { result } = renderHook(() => useStats());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.stats).not.toBeNull();
    expect(result.current.stats?.resources).toBe(150);
    expect(result.current.stats?.attestations).toBe(2300);
    expect(result.current.stats?.auditors).toBe(45);
    expect(result.current.stats?.totalStaked).toBe('5000000000000000000000');
  });

  // HST-003: Returns error on API failure
  it('HST-003: returns error on API failure', async () => {
    vi.mocked(api.getStats).mockRejectedValueOnce(new Error('API Error'));
    
    const { result } = renderHook(() => useStats());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).toBe('API Error');
    expect(result.current.stats).toBeNull();
  });

  // HST-004: formatted property formats all values correctly
  it('HST-004: formatted property formats all values correctly', async () => {
    const { result } = renderHook(() => useStats());
    
    await waitFor(() => {
      expect(result.current.formatted).not.toBeNull();
    });
    
    expect(result.current.formatted?.resources).toBe('150');
    expect(result.current.formatted?.attestations).toBe('2,300');
    expect(result.current.formatted?.auditors).toBe('45');
    expect(result.current.formatted?.totalStaked).toBe('5.0K');
  });

  // HST-005: Hook calls getStats on mount
  it('HST-005: calls getStats on mount', async () => {
    renderHook(() => useStats());
    
    await waitFor(() => {
      expect(api.getStats).toHaveBeenCalled();
    });
    
    expect(api.getStats).toHaveBeenCalledTimes(1);
  });

  // HST-006: Cleanup cancels interval on unmount
  it('HST-006: sets up interval for auto-refresh', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useStats());
    
    await waitFor(() => {
      expect(setIntervalSpy).toHaveBeenCalled();
    });
    
    // Verify interval is set with 30000ms
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  // HST-007: Handles race conditions (mounted check)
  it('HST-007: handles unmount during fetch gracefully', async () => {
    vi.mocked(api.getStats).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        resources: 150,
        attestations: 2300,
        auditors: 45,
        totalStaked: '5000000000000000000000',
        tiers: {},
        lastSyncedBlock: '12345678',
        lastSyncedAt: '2026-02-09T10:00:00Z',
      }), 100);
    }));
    
    const { unmount } = renderHook(() => useStats());
    
    // Unmount immediately
    unmount();
    
    // No errors should be thrown - the mounted check prevents state updates
    await new Promise(r => setTimeout(r, 150));
  });

  it('returns null formatted when stats is null', () => {
    const { result } = renderHook(() => useStats());
    
    // Initially stats is null, so formatted should be null
    expect(result.current.formatted).toBeNull();
  });
});
