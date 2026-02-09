/**
 * Contract Configuration Tests
 * Test IDs: CONT-001 through CONT-007
 * Priority: P0 (Critical)
 */

import { describe, it, expect } from 'vitest';
import { getContracts, getTierName, TRUST_TIERS, CONTRACTS, ABIS } from '@/lib/contracts';
import { isAddress, getAddress } from 'viem';

describe('getContracts', () => {
  // CONT-001: returns Base Sepolia addresses for chainId 84532
  it('CONT-001: returns Base Sepolia addresses for chainId 84532', () => {
    const contracts = getContracts(84532);
    
    expect(contracts.token).toBe('0xc41c1006A1AaC093C758A2f09de16fee2561651A');
    expect(contracts.registry).toBe('0x5A06453257874Fd000738F28C462d17BFf8e1EA3');
    expect(contracts.staking).toBe('0x58983D142A388A96B7d9F970005483AA044CCAD9');
    expect(contracts.oracle).toBe('0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7');
    expect(contracts.rewardPool).toBe('0x474cB2441C0Af053DAe052302a6829a218Aa656F');
  });

  // CONT-002: returns Base mainnet addresses for chainId 8453
  it('CONT-002: returns Base mainnet addresses for chainId 8453', () => {
    const contracts = getContracts(8453);
    
    expect(contracts.token).toBe('0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5');
    expect(contracts.registry).toBe('0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01');
    expect(contracts.staking).toBe('0x916FFb3eB82616220b81b99f70c3B7679B9D62ca');
    expect(contracts.oracle).toBe('0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd');
    expect(contracts.rewardPool).toBe('0x790b0766e9e2db7c59526b247851D16bB493a95B');
  });

  // CONT-003: returns localhost addresses for chainId 31337
  it('CONT-003: returns localhost addresses for chainId 31337', () => {
    const contracts = getContracts(31337);
    
    expect(contracts.token).toBe('0x5FbDB2315678afecb367f032d93F642f64180aa3');
    expect(contracts.registry).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
    expect(contracts.staking).toBe('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
  });

  // CONT-004: falls back to Sepolia for unknown chainId
  it('CONT-004: falls back to Sepolia for unknown chainId', () => {
    const contracts = getContracts(999999);
    
    // Should return Base Sepolia addresses as fallback
    expect(contracts).toEqual(CONTRACTS[84532]);
  });
});

describe('getTierName', () => {
  // CONT-005: matches API version output
  it('CONT-005: returns same values as API getTierName', async () => {
    // Import from both files and compare
    const { getTierName: apiGetTierName } = await import('@/lib/api');
    
    expect(getTierName(0)).toBe(apiGetTierName(0));
    expect(getTierName(1)).toBe(apiGetTierName(1));
    expect(getTierName(2)).toBe(apiGetTierName(2));
    expect(getTierName(3)).toBe(apiGetTierName(3));
    expect(getTierName(-1)).toBe(apiGetTierName(-1));
    expect(getTierName(4)).toBe(apiGetTierName(4));
  });

  it('returns correct names for all tiers', () => {
    expect(getTierName(0)).toBe('UNVERIFIED');
    expect(getTierName(1)).toBe('COMMUNITY');
    expect(getTierName(2)).toBe('VERIFIED');
    expect(getTierName(3)).toBe('TRUSTED');
    expect(getTierName(4)).toBe('UNKNOWN');
  });
});

describe('Contract Addresses', () => {
  // CONT-006: Contract addresses are valid checksummed addresses
  it('CONT-006: all contract addresses are valid checksummed addresses', () => {
    const allChainIds = [84532, 8453, 31337] as const;
    
    for (const chainId of allChainIds) {
      const contracts = getContracts(chainId);
      
      for (const [name, address] of Object.entries(contracts)) {
        // Skip non-address fields if any
        if (typeof address !== 'string') continue;
        
        // Check it's a valid address
        expect(isAddress(address), `${name} on chain ${chainId} is valid address`).toBe(true);
        
        // Check it's checksummed (getAddress returns checksummed version)
        expect(address, `${name} on chain ${chainId} is checksummed`).toBe(getAddress(address));
      }
    }
  });
});

describe('TRUST_TIERS', () => {
  // CONT-007: TRUST_TIERS constants are correct
  it('CONT-007: TRUST_TIERS has correct threshold values', () => {
    expect(TRUST_TIERS.COMMUNITY).toBe(100);
    expect(TRUST_TIERS.VERIFIED).toBe(1000);
    expect(TRUST_TIERS.TRUSTED).toBe(10_000);
  });

  it('TRUST_TIERS thresholds are in ascending order', () => {
    expect(TRUST_TIERS.COMMUNITY).toBeLessThan(TRUST_TIERS.VERIFIED);
    expect(TRUST_TIERS.VERIFIED).toBeLessThan(TRUST_TIERS.TRUSTED);
  });
});

describe('ABIS', () => {
  it('exports all required ABIs', () => {
    expect(ABIS.token).toBeDefined();
    expect(ABIS.registry).toBeDefined();
    expect(ABIS.staking).toBeDefined();
  });

  it('ABIs are valid arrays', () => {
    expect(Array.isArray(ABIS.token)).toBe(true);
    expect(Array.isArray(ABIS.registry)).toBe(true);
    expect(Array.isArray(ABIS.staking)).toBe(true);
  });
});
