/**
 * useAuditors Hook Tests
 * Test IDs: HAU-001 through HAU-007
 * Priority: P0 (Critical)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuditors } from '@/hooks/useAuditors';
import { server } from '../../mocks/server';
import { errorHandlers } from '../../mocks/handlers';

describe('useAuditors', () => {
  // HAU-001: Returns loading state initially
  it('HAU-001: returns loading state initially', () => {
    const { result } = renderHook(() => useAuditors());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.auditors).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // HAU-002: Returns formatted auditors array
  it('HAU-002: returns formatted auditors array', async () => {
    const { result } = renderHook(() => useAuditors());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.auditors).toHaveLength(2);
    expect(result.current.auditors[0]).toMatchObject({
      rank: 1,
      address: '0x1234567890123456789012345678901234567890',
      attestationCount: 47,
      accuracy: 98.2,
      burnCount: 0,
    });
  });

  // HAU-003: Correctly formats shortAddress
  it('HAU-003: correctly formats shortAddress', async () => {
    const { result } = renderHook(() => useAuditors());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // First auditor: 0x1234567890123456789012345678901234567890
    expect(result.current.auditors[0].shortAddress).toBe('0x1234...7890');
    
    // Second auditor: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
    expect(result.current.auditors[1].shortAddress).toBe('0xabcd...abcd');
  });

  // HAU-004: Assigns rank based on array position
  it('HAU-004: assigns rank based on array position', async () => {
    const { result } = renderHook(() => useAuditors());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.auditors[0].rank).toBe(1);
    expect(result.current.auditors[1].rank).toBe(2);
  });

  // HAU-005: Converts totalStaked to bigint
  it('HAU-005: converts totalStaked to bigint', async () => {
    const { result } = renderHook(() => useAuditors());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check that totalStakedRaw is a BigInt
    expect(typeof result.current.auditors[0].totalStakedRaw).toBe('bigint');
    expect(result.current.auditors[0].totalStakedRaw).toBe(BigInt('1000000000000000000000'));
    
    // Also check formatted string
    expect(result.current.auditors[0].totalStaked).toBe('1.0K');
  });

  // HAU-006: Respects limit parameter
  it('HAU-006: respects limit parameter', async () => {
    const { result } = renderHook(() => useAuditors(1));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.auditors).toHaveLength(1);
  });

  // HAU-007: Returns error on API failure
  it('HAU-007: returns error on API failure', async () => {
    server.use(errorHandlers.auditorsError);
    
    const { result } = renderHook(() => useAuditors());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).not.toBeNull();
    expect(result.current.auditors).toEqual([]);
  });

  it('re-fetches when limit changes', async () => {
    const { result, rerender } = renderHook(
      ({ limit }) => useAuditors(limit),
      { initialProps: { limit: 10 } }
    );
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    const initialCount = result.current.auditors.length;
    
    // Change limit
    rerender({ limit: 1 });
    
    await waitFor(() => {
      expect(result.current.auditors.length).toBeLessThanOrEqual(1);
    });
  });

  it('handles empty auditors list', async () => {
    server.use(
      require('msw').http.get('https://api.isnad.md/api/v1/auditors', () => {
        return require('msw').HttpResponse.json({
          success: true,
          auditors: [],
        });
      })
    );
    
    const { result } = renderHook(() => useAuditors());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.auditors).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
