// ISNAD API Client
// Connects to api.isnad.md

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.isnad.md';

export interface Stats {
  resources: number;
  attestations: number;
  auditors: number;
  totalStaked: string;
  tiers: Record<string, number>;
  lastSyncedBlock: string;
  lastSyncedAt: string;
}

export interface Auditor {
  address: string;
  totalStaked: string;
  attestationCount: number;
  accuracy: number;
  burnCount: number;
}

export interface Resource {
  hash: string;
  type: string;
  name?: string;
  author?: string;
  version?: string;
  inscribedAt: string;
  blockNumber: number;
  trustScore: string;
  trustTier: number;
}

export interface Attestation {
  id: string;
  auditor: string;
  resourceHash: string;
  amount: string;
  lockUntil: number;
  lockDuration: number;
  slashed: boolean;
  createdAt: string;
}

export interface TrustInfo {
  resource: Resource | null;
  attestations: Attestation[];
  trustScore: string;
  trustTier: string;
}

class ISNADApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  }

  async getStats(): Promise<Stats> {
    const response = await this.fetch<{ 
      success: boolean; 
      data: {
        totalResources: number;
        totalAttestations: number;
        totalAuditors: number;
        totalStaked: string;
        resourcesByTier: Record<string, number>;
        lastSyncedBlock: string;
        lastSyncedAt: string;
      };
    }>('/api/v1/stats');
    
    // Map API response to frontend Stats interface
    return {
      resources: response.data.totalResources,
      attestations: response.data.totalAttestations,
      auditors: response.data.totalAuditors,
      totalStaked: response.data.totalStaked,
      tiers: response.data.resourcesByTier,
      lastSyncedBlock: response.data.lastSyncedBlock,
      lastSyncedAt: response.data.lastSyncedAt,
    };
  }

  async getAuditors(limit: number = 10): Promise<Auditor[]> {
    const data = await this.fetch<{ success: boolean; auditors: Auditor[] }>(
      `/api/v1/auditors?limit=${limit}`
    );
    return data.auditors;
  }

  async getResources(params?: { type?: string; limit?: number; offset?: number }): Promise<Resource[]> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    
    const data = await this.fetch<{ success: boolean; resources: Resource[] }>(
      `/api/v1/resources?${query}`
    );
    return data.resources;
  }

  async getResource(hash: string): Promise<Resource | null> {
    try {
      const data = await this.fetch<{ success: boolean; resource: Resource }>(
        `/api/v1/resources/${hash}`
      );
      return data.resource;
    } catch {
      return null;
    }
  }

  async getTrust(hash: string): Promise<TrustInfo> {
    const data = await this.fetch<{ success: boolean } & TrustInfo>(
      `/api/v1/trust/${hash}`
    );
    return {
      resource: data.resource,
      attestations: data.attestations,
      trustScore: data.trustScore,
      trustTier: data.trustTier,
    };
  }

  async searchResources(query: string): Promise<Resource[]> {
    const data = await this.fetch<{ success: boolean; resources: Resource[] }>(
      `/api/v1/resources/search?q=${encodeURIComponent(query)}`
    );
    return data.resources;
  }
}

// Singleton instance
export const api = new ISNADApi();

// Helper to format token amounts (18 decimals)
export function formatTokenAmount(amount: string | bigint): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const formatted = Number(value) / 1e18;
  
  if (formatted >= 1_000_000) {
    return `${(formatted / 1_000_000).toFixed(1)}M`;
  }
  if (formatted >= 1_000) {
    return `${(formatted / 1_000).toFixed(1)}K`;
  }
  return formatted.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Tier name helper
export function getTierName(tier: number | string): string {
  const tierNum = typeof tier === 'string' ? parseInt(tier) : tier;
  switch (tierNum) {
    case 0: return 'UNVERIFIED';
    case 1: return 'COMMUNITY';
    case 2: return 'VERIFIED';
    case 3: return 'TRUSTED';
    default: return 'UNKNOWN';
  }
}
