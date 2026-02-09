/**
 * API Client Tests
 * Test IDs: API-001 through API-016
 * Priority: P0 (Critical)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatTokenAmount, getTierName, api } from '@/lib/api';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { mockStats, mockAuditors, mockTrustInfo, errorHandlers } from '../../mocks/handlers';

const API_BASE = 'https://api.isnad.md';

describe('formatTokenAmount', () => {
  // API-001: formats wei to human-readable
  it('API-001: formats 1 token correctly', () => {
    expect(formatTokenAmount('1000000000000000000')).toBe('1');
  });

  // API-002: handles millions (1M+)
  it('API-002: formats millions with M suffix', () => {
    // 2.5M tokens in wei
    expect(formatTokenAmount('2500000000000000000000000')).toBe('2.5M');
    // 1M tokens in wei
    expect(formatTokenAmount('1000000000000000000000000')).toBe('1.0M');
    // 10M tokens in wei
    expect(formatTokenAmount('10000000000000000000000000')).toBe('10.0M');
  });

  // API-003: handles thousands (1K+)
  it('API-003: formats thousands with K suffix', () => {
    // 1.5K tokens in wei
    expect(formatTokenAmount('1500000000000000000000')).toBe('1.5K');
    // 1K tokens in wei
    expect(formatTokenAmount('1000000000000000000000')).toBe('1.0K');
    // 999K tokens in wei
    expect(formatTokenAmount('999000000000000000000000')).toBe('999.0K');
  });

  // API-004: handles small amounts (<1K)
  it('API-004: formats small amounts without suffix', () => {
    // 100 tokens
    expect(formatTokenAmount('100000000000000000000')).toBe('100');
    // 500 tokens
    expect(formatTokenAmount('500000000000000000000')).toBe('500');
    // 1 token
    expect(formatTokenAmount('1000000000000000000')).toBe('1');
  });

  // API-005: handles bigint input
  it('API-005: handles bigint input', () => {
    expect(formatTokenAmount(BigInt('1000000000000000000'))).toBe('1');
    expect(formatTokenAmount(BigInt('1500000000000000000000'))).toBe('1.5K');
    expect(formatTokenAmount(BigInt('2500000000000000000000000'))).toBe('2.5M');
  });

  // API-006: handles string input
  it('API-006: handles string input', () => {
    expect(formatTokenAmount('1000000000000000000')).toBe('1');
    expect(formatTokenAmount('5000000000000000000000')).toBe('5.0K');
  });

  // Edge cases
  it('handles zero correctly', () => {
    expect(formatTokenAmount('0')).toBe('0');
    expect(formatTokenAmount(BigInt(0))).toBe('0');
  });
});

describe('getTierName', () => {
  // API-007: returns correct name for tier 0-3
  it('API-007: returns correct name for all valid tiers', () => {
    expect(getTierName(0)).toBe('UNVERIFIED');
    expect(getTierName(1)).toBe('COMMUNITY');
    expect(getTierName(2)).toBe('VERIFIED');
    expect(getTierName(3)).toBe('TRUSTED');
  });

  // API-008: handles invalid tier numbers
  it('API-008: returns UNKNOWN for invalid tier numbers', () => {
    expect(getTierName(-1)).toBe('UNKNOWN');
    expect(getTierName(4)).toBe('UNKNOWN');
    expect(getTierName(100)).toBe('UNKNOWN');
  });

  // API-009: handles string tier input
  it('API-009: handles string tier input', () => {
    expect(getTierName('0' as unknown as number)).toBe('UNVERIFIED');
    expect(getTierName('1' as unknown as number)).toBe('COMMUNITY');
    expect(getTierName('2' as unknown as number)).toBe('VERIFIED');
    expect(getTierName('3' as unknown as number)).toBe('TRUSTED');
  });
});

describe('ISNADApi', () => {
  // API-010: getStats returns mapped Stats object
  describe('getStats', () => {
    it('API-010: returns mapped Stats object', async () => {
      const stats = await api.getStats();
      
      expect(stats).toMatchObject({
        resources: 150,
        attestations: 2300,
        auditors: 45,
        totalStaked: '5000000000000000000000',
        tiers: { '0': 50, '1': 60, '2': 30, '3': 10 },
        lastSyncedBlock: '12345678',
        lastSyncedAt: '2026-02-09T10:00:00Z',
      });
    });

    // API-011: handles API errors
    it('API-011: throws on API error', async () => {
      server.use(errorHandlers.statsError);
      
      await expect(api.getStats()).rejects.toThrow();
    });
  });

  // API-012: getAuditors returns formatted array
  describe('getAuditors', () => {
    it('API-012: returns formatted auditors array', async () => {
      const auditors = await api.getAuditors(10);
      
      expect(auditors).toHaveLength(2);
      expect(auditors[0]).toMatchObject({
        address: '0x1234567890123456789012345678901234567890',
        totalStaked: '1000000000000000000000',
        attestationCount: 47,
        accuracy: 98.2,
        burnCount: 0,
      });
    });

    it('respects limit parameter', async () => {
      const auditors = await api.getAuditors(1);
      expect(auditors).toHaveLength(1);
    });
  });

  // API-013: getResources builds query params correctly
  describe('getResources', () => {
    it('API-013: builds query params correctly', async () => {
      let capturedUrl: string | undefined;
      
      server.use(
        http.get(`${API_BASE}/api/v1/resources`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, resources: [] });
        })
      );

      await api.getResources({ type: 'SKILL', limit: 5, offset: 10 });
      
      expect(capturedUrl).toContain('type=SKILL');
      expect(capturedUrl).toContain('limit=5');
      expect(capturedUrl).toContain('offset=10');
    });
  });

  // API-014: getResource returns null on 404
  describe('getResource', () => {
    it('API-014: returns null on 404', async () => {
      const resource = await api.getResource('0xNOTFOUND');
      expect(resource).toBeNull();
    });

    it('returns resource for valid hash', async () => {
      const resource = await api.getResource('0x1234');
      expect(resource).toBeDefined();
      expect(resource?.type).toBe('SKILL');
    });
  });

  // API-015: getTrust returns TrustInfo
  describe('getTrust', () => {
    it('API-015: returns TrustInfo', async () => {
      const trustInfo = await api.getTrust('0x1234');
      
      expect(trustInfo).toMatchObject({
        resource: expect.any(Object),
        attestations: expect.any(Array),
        trustScore: '1000000000000000000000',
        trustTier: 'VERIFIED',
      });
    });

    it('returns null resource for unknown hash', async () => {
      const trustInfo = await api.getTrust('0xNOTFOUND');
      expect(trustInfo.resource).toBeNull();
      expect(trustInfo.trustTier).toBe('UNVERIFIED');
    });
  });

  // API-016: searchResources URL-encodes query
  describe('searchResources', () => {
    it('API-016: URL-encodes query', async () => {
      let capturedUrl: string | undefined;
      
      server.use(
        http.get(`${API_BASE}/api/v1/resources/search`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, resources: [] });
        })
      );

      await api.searchResources('test query with spaces & special=chars');
      
      expect(capturedUrl).toContain('q=test%20query%20with%20spaces%20%26%20special%3Dchars');
    });

    it('returns array of resources from search', async () => {
      const resources = await api.searchResources('test');
      expect(Array.isArray(resources)).toBe(true);
    });
  });
});
