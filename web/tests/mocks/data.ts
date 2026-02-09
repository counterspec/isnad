// Mock data factories for tests

import type { Stats, Auditor, Resource, Attestation, TrustInfo } from '@/lib/api';

export function createMockStats(overrides: Partial<Stats> = {}): Stats {
  return {
    resources: 150,
    attestations: 2300,
    auditors: 45,
    totalStaked: '5000000000000000000000', // 5000 ISNAD
    tiers: { '0': 50, '1': 60, '2': 30, '3': 10 },
    lastSyncedBlock: '12345678',
    lastSyncedAt: '2026-02-09T10:00:00Z',
    ...overrides,
  };
}

export function createMockAuditor(overrides: Partial<Auditor> = {}): Auditor {
  return {
    address: '0x1234567890123456789012345678901234567890',
    totalStaked: '1000000000000000000000', // 1000 ISNAD
    attestationCount: 47,
    accuracy: 98.2,
    burnCount: 0,
    ...overrides,
  };
}

export function createMockResource(overrides: Partial<Resource> = {}): Resource {
  return {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'SKILL',
    name: 'Test Skill',
    author: '0xauthor',
    version: '1.0.0',
    inscribedAt: '2026-01-01T00:00:00Z',
    blockNumber: 12345678,
    trustScore: '1000000000000000000000', // 1000 ISNAD
    trustTier: 2,
    ...overrides,
  };
}

export function createMockAttestation(overrides: Partial<Attestation> = {}): Attestation {
  return {
    id: '0xattest1',
    auditor: '0x1234567890123456789012345678901234567890',
    resourceHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    amount: '500000000000000000000',
    lockUntil: Math.floor(Date.now() / 1000) + 86400 * 30,
    lockDuration: 86400 * 30,
    slashed: false,
    createdAt: '2026-01-15T00:00:00Z',
    ...overrides,
  };
}

export function createMockTrustInfo(overrides: Partial<TrustInfo> = {}): TrustInfo {
  return {
    resource: createMockResource(),
    attestations: [createMockAttestation()],
    trustScore: '1000000000000000000000',
    trustTier: 'VERIFIED',
    ...overrides,
  };
}

// Wei conversion helpers for tests
export const TOKENS = {
  ONE: BigInt('1000000000000000000'),           // 1 token
  HUNDRED: BigInt('100000000000000000000'),      // 100 tokens
  THOUSAND: BigInt('1000000000000000000000'),    // 1K tokens
  TEN_THOUSAND: BigInt('10000000000000000000000'), // 10K tokens
  MILLION: BigInt('1000000000000000000000000'),  // 1M tokens
};
