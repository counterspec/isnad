import { http, HttpResponse } from 'msw';

const API_BASE = 'https://api.isnad.md';

// Mock data
export const mockStats = {
  success: true,
  data: {
    totalResources: 150,
    totalAttestations: 2300,
    totalAuditors: 45,
    totalStaked: '5000000000000000000000', // 5000 ISNAD
    resourcesByTier: { '0': 50, '1': 60, '2': 30, '3': 10 },
    lastSyncedBlock: '12345678',
    lastSyncedAt: '2026-02-09T10:00:00Z',
  },
};

export const mockAuditors = {
  success: true,
  auditors: [
    {
      address: '0x1234567890123456789012345678901234567890',
      totalStaked: '1000000000000000000000', // 1000 ISNAD
      attestationCount: 47,
      accuracy: 98.2,
      burnCount: 0,
    },
    {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      totalStaked: '500000000000000000000', // 500 ISNAD
      attestationCount: 23,
      accuracy: 95.5,
      burnCount: 1,
    },
  ],
};

export const mockResource = {
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  type: 'SKILL',
  name: 'Test Skill',
  author: '0xauthor',
  version: '1.0.0',
  inscribedAt: '2026-01-01T00:00:00Z',
  blockNumber: 12345678,
  trustScore: '1000000000000000000000', // 1000 ISNAD
  trustTier: 2,
};

export const mockAttestations = [
  {
    id: '0xattest1',
    auditor: '0x1234567890123456789012345678901234567890',
    resourceHash: mockResource.hash,
    amount: '500000000000000000000',
    lockUntil: Math.floor(Date.now() / 1000) + 86400 * 30,
    lockDuration: 86400 * 30,
    slashed: false,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: '0xattest2',
    auditor: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    resourceHash: mockResource.hash,
    amount: '500000000000000000000',
    lockUntil: Math.floor(Date.now() / 1000) + 86400 * 60,
    lockDuration: 86400 * 60,
    slashed: false,
    createdAt: '2026-01-20T00:00:00Z',
  },
];

export const mockTrustInfo = {
  success: true,
  resource: mockResource,
  attestations: mockAttestations,
  trustScore: '1000000000000000000000',
  trustTier: 'VERIFIED',
};

export const handlers = [
  // Stats endpoint
  http.get(`${API_BASE}/api/v1/stats`, () => {
    return HttpResponse.json(mockStats);
  }),

  // Auditors endpoint
  http.get(`${API_BASE}/api/v1/auditors`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    return HttpResponse.json({
      ...mockAuditors,
      auditors: mockAuditors.auditors.slice(0, limit),
    });
  }),

  // Search endpoint - MUST come before resources/:hash to avoid conflicts
  http.get(`${API_BASE}/api/v1/resources/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    return HttpResponse.json({
      success: true,
      resources: query.toLowerCase().includes('test') ? [mockResource] : [],
    });
  }),

  // Resources list endpoint (no params)
  http.get(`${API_BASE}/api/v1/resources`, ({ request }) => {
    // Check if this is a list request (has query params but not a specific hash)
    const url = new URL(request.url);
    // If pathname ends with /resources (no hash), return list
    if (url.pathname === '/api/v1/resources') {
      return HttpResponse.json({
        success: true,
        resources: [mockResource],
      });
    }
  }),

  // Single resource endpoint
  http.get(`${API_BASE}/api/v1/resources/:hash`, ({ params }) => {
    const { hash } = params;
    // Skip if this is the search endpoint
    if (hash === 'search') {
      return;
    }
    if (hash === '0xNOTFOUND' || hash === 'notfound') {
      return HttpResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }
    return HttpResponse.json({
      success: true,
      resource: { ...mockResource, hash },
    });
  }),

  // Trust info endpoint
  http.get(`${API_BASE}/api/v1/trust/:hash`, ({ params }) => {
    const { hash } = params;
    if (hash === '0xNOTFOUND') {
      return HttpResponse.json({
        success: true,
        resource: null,
        attestations: [],
        trustScore: '0',
        trustTier: 'UNVERIFIED',
      });
    }
    return HttpResponse.json({
      ...mockTrustInfo,
      resource: { ...mockResource, hash },
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
  statsError: http.get(`${API_BASE}/api/v1/stats`, () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),
  auditorsError: http.get(`${API_BASE}/api/v1/auditors`, () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),
  networkError: http.get(`${API_BASE}/api/v1/stats`, () => {
    return HttpResponse.error();
  }),
};
