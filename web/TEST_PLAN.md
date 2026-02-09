# ISNAD Web Application Test Plan

**Document Version:** 1.0  
**Created:** 2026-02-09  
**Status:** Draft - Ready for Review

---

## Executive Summary

This document outlines a comprehensive testing strategy for the ISNAD Protocol web application. The application is a Next.js 14 App Router project with:
- **Frontend:** React 19, TypeScript, TailwindCSS
- **Web3:** wagmi v3, viem, @tanstack/react-query
- **API Integration:** REST client to api.isnad.md
- **Blockchain:** Base L2 (mainnet + Sepolia testnet) smart contracts

---

## Table of Contents

1. [Testing Stack Recommendation](#1-testing-stack-recommendation)
2. [Test Categories & Priorities](#2-test-categories--priorities)
3. [Unit Tests](#3-unit-tests)
4. [Integration Tests](#4-integration-tests)
5. [End-to-End Tests](#5-end-to-end-tests)
6. [Mocking Strategies](#6-mocking-strategies)
7. [CI/CD Integration](#7-cicd-integration)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Testing Stack Recommendation

### Recommended Stack

| Category | Tool | Rationale |
|----------|------|-----------|
| **Unit & Integration** | **Vitest** | Fast, native ESM, excellent TypeScript support, compatible with React Testing Library |
| **Component Testing** | **React Testing Library** | Standard for React, tests user behavior not implementation |
| **E2E Testing** | **Playwright** | Superior Next.js support, better for Web3 (can mock providers), parallel execution |
| **Visual Regression** | **Playwright screenshots** | Built-in to Playwright, no extra tooling |
| **Coverage** | **c8/istanbul** (via Vitest) | Integrated with Vitest |

### Why Vitest over Jest?
- Native ESM support (critical for viem/wagmi)
- 3-10x faster test execution
- First-class TypeScript support without additional config
- Compatible with Jest's API (easy migration)
- Better Next.js App Router compatibility

### Why Playwright over Cypress?
- Native support for multiple browser contexts (wallet simulation)
- Better handling of Next.js SSR
- Superior parallelization
- Built-in trace viewer for debugging
- More stable with Web3 wallet interactions

### Required Packages

```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^24.0.0",
    "msw": "^2.3.0",
    "@playwright/test": "^1.45.0",
    "happy-dom": "^14.0.0"
  }
}
```

---

## 2. Test Categories & Priorities

### Priority Levels

| Priority | Label | Criteria |
|----------|-------|----------|
| **P0** | Critical | Blocks releases; core user flows; financial operations |
| **P1** | Important | Key features; user-facing functionality |
| **P2** | Nice-to-have | Edge cases; polish; non-critical paths |

### Coverage Targets

| Category | P0 | P1 | P2 | Total Target |
|----------|----|----|----|----|
| Unit Tests | 100% | 90% | 50% | ~85% coverage |
| Integration Tests | 100% | 80% | 30% | ~70% coverage |
| E2E Tests | 100% | 50% | 10% | Critical paths only |

---

## 3. Unit Tests

### 3.1 Library Functions (`src/lib/`)

#### `api.ts` - API Client

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| API-001 | `formatTokenAmount()` formats wei to human-readable | P0 | Unit |
| API-002 | `formatTokenAmount()` handles millions (1M+) | P0 | Unit |
| API-003 | `formatTokenAmount()` handles thousands (1K+) | P0 | Unit |
| API-004 | `formatTokenAmount()` handles small amounts (<1K) | P0 | Unit |
| API-005 | `formatTokenAmount()` handles bigint input | P0 | Unit |
| API-006 | `formatTokenAmount()` handles string input | P0 | Unit |
| API-007 | `getTierName()` returns correct name for tier 0-3 | P0 | Unit |
| API-008 | `getTierName()` handles invalid tier numbers | P1 | Unit |
| API-009 | `getTierName()` handles string tier input | P1 | Unit |
| API-010 | `ISNADApi.getStats()` returns mapped Stats object | P0 | Unit |
| API-011 | `ISNADApi.getStats()` handles API errors | P0 | Unit |
| API-012 | `ISNADApi.getAuditors()` returns formatted array | P0 | Unit |
| API-013 | `ISNADApi.getResources()` builds query params correctly | P1 | Unit |
| API-014 | `ISNADApi.getResource()` returns null on 404 | P1 | Unit |
| API-015 | `ISNADApi.getTrust()` returns TrustInfo | P0 | Unit |
| API-016 | `ISNADApi.searchResources()` URL-encodes query | P1 | Unit |

**Test Cases for `formatTokenAmount()`:**
```typescript
describe('formatTokenAmount', () => {
  it('formats 1000000000000000000 as "1"', () => {
    expect(formatTokenAmount('1000000000000000000')).toBe('1');
  });
  it('formats 1500000000000000000000 as "1.5K"', () => {
    expect(formatTokenAmount('1500000000000000000000')).toBe('1.5K');
  });
  it('formats 2500000000000000000000000 as "2.5M"', () => {
    expect(formatTokenAmount('2500000000000000000000000')).toBe('2.5M');
  });
  it('handles bigint input', () => {
    expect(formatTokenAmount(BigInt('1000000000000000000'))).toBe('1');
  });
});
```

#### `contracts.ts` - Contract Configuration

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| CONT-001 | `getContracts(84532)` returns Base Sepolia addresses | P0 | Unit |
| CONT-002 | `getContracts(8453)` returns Base mainnet addresses | P0 | Unit |
| CONT-003 | `getContracts(31337)` returns localhost addresses | P1 | Unit |
| CONT-004 | `getContracts(unknown)` falls back to Sepolia | P1 | Unit |
| CONT-005 | `getTierName()` matches API version output | P0 | Unit |
| CONT-006 | Contract addresses are valid checksummed addresses | P1 | Unit |
| CONT-007 | TRUST_TIERS constants are correct | P0 | Unit |

#### `wagmi.ts` - Wagmi Configuration

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| WAG-001 | Config includes all required chains | P1 | Unit |
| WAG-002 | Config has correct transport URLs | P1 | Unit |
| WAG-003 | Connectors include injected, coinbase, walletConnect | P1 | Unit |

---

### 3.2 Custom Hooks (`src/hooks/`)

#### `useStats.ts`

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| HST-001 | Returns loading state initially | P0 | Unit |
| HST-002 | Returns stats after successful fetch | P0 | Unit |
| HST-003 | Returns error on API failure | P0 | Unit |
| HST-004 | `formatted` property formats all values correctly | P0 | Unit |
| HST-005 | Auto-refreshes every 30 seconds | P1 | Unit |
| HST-006 | Cleanup cancels interval on unmount | P1 | Unit |
| HST-007 | Handles race conditions (mounted check) | P2 | Unit |

#### `useAuditors.ts`

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| HAU-001 | Returns loading state initially | P0 | Unit |
| HAU-002 | Returns formatted auditors array | P0 | Unit |
| HAU-003 | Correctly formats shortAddress | P0 | Unit |
| HAU-004 | Assigns rank based on array position | P0 | Unit |
| HAU-005 | Converts totalStaked to bigint | P1 | Unit |
| HAU-006 | Respects limit parameter | P1 | Unit |
| HAU-007 | Returns error on API failure | P1 | Unit |

#### `useISNAD.ts` - Contract Read Hooks

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| HIS-001 | `useTrustScore` returns score and tier | P0 | Unit |
| HIS-002 | `useTrustScore` handles undefined hash | P0 | Unit |
| HIS-003 | `useResourceInfo` returns inscribed status | P0 | Unit |
| HIS-004 | `useResourceInfo` returns null for non-existent | P1 | Unit |
| HIS-005 | `useResourceAttestations` returns array of IDs | P0 | Unit |
| HIS-006 | `useAttestation` decodes tuple correctly | P0 | Unit |
| HIS-007 | `computeContentHash` returns valid keccak256 | P1 | Unit |
| HIS-008 | All hooks handle loading states | P1 | Unit |

#### `useStaking.ts` - Staking Hooks

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| HSK-001 | `useTokenApproval.approve()` calls contract correctly | P0 | Unit |
| HSK-002 | `useTokenAllowance` returns formatted allowance | P0 | Unit |
| HSK-003 | `useTokenBalance` returns formatted balance | P0 | Unit |
| HSK-004 | `useStake.stake()` converts days to seconds | P0 | Unit |
| HSK-005 | `useStake.stake()` converts amount to wei | P0 | Unit |
| HSK-006 | `useUnstake.unstake()` calls with attestation ID | P0 | Unit |
| HSK-007 | `useAuditorAttestations` returns ID array | P1 | Unit |
| HSK-008 | `useAuditorTotalStake` formats output correctly | P1 | Unit |
| HSK-009 | All hooks handle pending/confirming states | P1 | Unit |
| HSK-010 | LOCK_MULTIPLIERS constant is correct | P2 | Unit |

---

### 3.3 Utility Functions

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| UTL-001 | `getTierBadgeClass()` in check/page returns correct classes | P2 | Unit |
| UTL-002 | Middleware markdown content is complete | P2 | Unit |

---

## 4. Integration Tests

### 4.1 Component Integration

#### `StatsSection.tsx`

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| IST-001 | Renders loading state | P0 | Integration |
| IST-002 | Renders stats after load | P0 | Integration |
| IST-003 | Renders error state on failure | P0 | Integration |
| IST-004 | Shows formatted token amounts | P1 | Integration |
| IST-005 | Updates when stats refresh | P2 | Integration |

#### `Header.tsx`

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| IHD-001 | Renders all navigation links | P0 | Integration |
| IHD-002 | Highlights active route | P1 | Integration |
| IHD-003 | Shows connect button when disconnected | P0 | Integration |
| IHD-004 | Shows address when connected | P0 | Integration |
| IHD-005 | Mobile menu toggles correctly | P1 | Integration |
| IHD-006 | Connector dropdown opens/closes | P1 | Integration |
| IHD-007 | Disconnect button works | P1 | Integration |

#### `Providers.tsx`

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| IPR-001 | Provides QueryClient to children | P0 | Integration |
| IPR-002 | Provides WagmiConfig to children | P0 | Integration |
| IPR-003 | Children can access useAccount | P0 | Integration |
| IPR-004 | Children can access useQuery | P1 | Integration |

### 4.2 Page Integration

#### Home Page (`/`)

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| IHP-001 | Renders hero section | P0 | Integration |
| IHP-002 | Renders StatsSection | P0 | Integration |
| IHP-003 | All CTA links navigate correctly | P1 | Integration |
| IHP-004 | Resource type cards render | P2 | Integration |

#### Check Page (`/check`)

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| ICP-001 | Search input accepts text | P0 | Integration |
| ICP-002 | Search button triggers lookup | P0 | Integration |
| ICP-003 | Loading state shows during fetch | P0 | Integration |
| ICP-004 | Not found state renders | P0 | Integration |
| ICP-005 | Resource info displays correctly | P0 | Integration |
| ICP-006 | Attestation list renders | P0 | Integration |
| ICP-007 | Slashed attestations show indicator | P1 | Integration |
| ICP-008 | Hash input hashes non-0x input | P1 | Integration |
| ICP-009 | Tier badge shows correct class | P2 | Integration |

#### Stake Page (`/stake`)

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| ISP-001 | Shows connect wallet prompt when disconnected | P0 | Integration |
| ISP-002 | Resource lookup step works | P0 | Integration |
| ISP-003 | Amount input validates against balance | P0 | Integration |
| ISP-004 | Lock duration selection works | P0 | Integration |
| ISP-005 | Shows approval step when needed | P0 | Integration |
| ISP-006 | Stake confirmation shows summary | P0 | Integration |
| ISP-007 | Success state resets form | P0 | Integration |
| ISP-008 | MAX button fills balance | P1 | Integration |
| ISP-009 | Sidebar shows user stats | P1 | Integration |
| ISP-010 | Active attestations list renders | P1 | Integration |
| ISP-011 | Error states display | P1 | Integration |

#### Leaderboard Page (`/leaderboard`)

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| ILP-001 | Loading state renders | P0 | Integration |
| ILP-002 | Table renders with auditor data | P0 | Integration |
| ILP-003 | Empty state shows message | P1 | Integration |
| ILP-004 | High accuracy highlighted | P2 | Integration |
| ILP-005 | Burns highlighted red | P2 | Integration |

### 4.3 API Route Integration

#### `/api/docs/[...slug]`

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| IAD-001 | Returns markdown for valid slug | P0 | Integration |
| IAD-002 | Returns 404 for invalid slug | P0 | Integration |
| IAD-003 | Returns 400 without .md suffix | P1 | Integration |
| IAD-004 | Sets correct Content-Type header | P1 | Integration |
| IAD-005 | All DOCS_MAP entries have files | P1 | Integration |

### 4.4 Middleware Integration

| Test ID | Description | Priority | Type |
|---------|-------------|----------|------|
| IMW-001 | Returns markdown for Accept: text/markdown | P0 | Integration |
| IMW-002 | Rewrites /docs/*.md to API | P0 | Integration |
| IMW-003 | Passes through normal requests | P0 | Integration |
| IMW-004 | All middleware paths have content | P1 | Integration |

---

## 5. End-to-End Tests

### 5.1 Critical User Flows (P0)

#### E2E-001: Check Resource Trust Score
```
Given: User is on the homepage
When: User clicks "Check a Resource"
And: User enters a known resource hash
And: User clicks "Check Trust"
Then: Trust score and tier display
And: Attestation history shows
```

#### E2E-002: Connect Wallet
```
Given: User is on any page
When: User clicks "Connect" button
And: User selects a wallet provider
Then: Address appears in header
And: Wallet remains connected across pages
```

#### E2E-003: View Auditor Leaderboard
```
Given: User is on homepage
When: User navigates to /leaderboard
Then: Top auditors display in table
And: Ranks, stakes, and accuracy show
```

#### E2E-004: Navigate Documentation
```
Given: User is on homepage
When: User clicks "Read the Docs"
Then: Docs index page loads
When: User clicks a doc section
Then: Section content displays
```

### 5.2 Staking Flows (P0 - Financial)

#### E2E-005: Complete Staking Flow (Testnet)
```
Given: User has connected wallet with testnet tokens
And: User is on /stake page
When: User looks up a resource
And: User enters stake amount
And: User selects lock duration
And: User approves tokens (if needed)
And: User confirms stake transaction
Then: Attestation created successfully
And: Balance updates
And: Attestation appears in list
```

#### E2E-006: Approve Token Spending
```
Given: User has tokens but no allowance
When: User attempts to stake
Then: Approval transaction requested
When: User approves
Then: Stake button becomes active
```

### 5.3 Content & SEO (P1)

#### E2E-007: Markdown API for Agents
```
Given: API client with Accept: text/markdown
When: Requesting /docs/quickstart
Then: Returns markdown content
And: Content-Type is text/markdown
```

#### E2E-008: Mobile Navigation
```
Given: User on mobile viewport
When: User taps hamburger menu
Then: Mobile menu opens
When: User taps nav link
Then: Navigates and menu closes
```

### 5.4 Error Handling (P1)

#### E2E-009: API Unavailable Gracefully
```
Given: API is returning errors
When: User loads homepage
Then: Stats show "Unable to load"
And: No JS errors in console
```

#### E2E-010: Resource Not Found
```
Given: User enters invalid hash
When: User clicks "Check Trust"
Then: "Resource Not Found" message displays
And: Searched hash shown for verification
```

---

## 6. Mocking Strategies

### 6.1 API Mocking (MSW)

**Setup MSW for REST API mocking:**

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.isnad.md/api/v1/stats', () => {
    return HttpResponse.json({
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
    });
  }),

  http.get('https://api.isnad.md/api/v1/auditors', () => {
    return HttpResponse.json({
      success: true,
      auditors: [
        {
          address: '0x1234567890123456789012345678901234567890',
          totalStaked: '1000000000000000000000',
          attestationCount: 47,
          accuracy: 98.2,
          burnCount: 0,
        },
      ],
    });
  }),

  http.get('https://api.isnad.md/api/v1/trust/:hash', ({ params }) => {
    const { hash } = params;
    if (hash === '0xNOTFOUND') {
      return HttpResponse.json({ success: true, resource: null, attestations: [], trustScore: '0', trustTier: 'UNVERIFIED' });
    }
    return HttpResponse.json({
      success: true,
      resource: { hash, type: 'SKILL', name: 'Test Resource', trustScore: '1000', trustTier: 2 },
      attestations: [],
      trustScore: '1000000000000000000000',
      trustTier: 'VERIFIED',
    });
  }),
];
```

### 6.2 Blockchain Mocking (wagmi)

**Mock wagmi hooks for unit tests:**

```typescript
// tests/mocks/wagmi.ts
import { vi } from 'vitest';

export const mockUseAccount = vi.fn(() => ({
  address: undefined,
  isConnected: false,
}));

export const mockUseReadContract = vi.fn(() => ({
  data: undefined,
  isLoading: false,
}));

export const mockUseWriteContract = vi.fn(() => ({
  writeContract: vi.fn(),
  data: undefined,
  isPending: false,
  error: undefined,
}));

// Mock module
vi.mock('wagmi', () => ({
  useAccount: mockUseAccount,
  useConnect: vi.fn(() => ({ connect: vi.fn(), connectors: [] })),
  useDisconnect: vi.fn(() => ({ disconnect: vi.fn() })),
  useReadContract: mockUseReadContract,
  useReadContracts: vi.fn(() => ({ data: undefined })),
  useWriteContract: mockUseWriteContract,
  useWaitForTransactionReceipt: vi.fn(() => ({ isLoading: false, isSuccess: false })),
  WagmiProvider: ({ children }) => children,
}));
```

### 6.3 Connected Wallet Test Wrapper

```typescript
// tests/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { hardhat } from 'wagmi/chains';

const testConfig = createConfig({
  chains: [hardhat],
  transports: { [hardhat.id]: http() },
});

function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return (
    <WagmiProvider config={testConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: TestProviders, ...options });
}
```

### 6.4 E2E Wallet Simulation (Playwright)

```typescript
// tests/e2e/fixtures.ts
import { test as base } from '@playwright/test';

// Fixture that injects a mock wallet into window.ethereum
export const test = base.extend({
  connectedPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.ethereum = {
        isMetaMask: true,
        request: async ({ method }) => {
          if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          if (method === 'eth_chainId') {
            return '0x14a34'; // Base Sepolia
          }
          return null;
        },
        on: () => {},
        removeListener: () => {},
      };
    });
    await use(page);
  },
});
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          flags: unit

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          flags: integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  contract-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./contracts
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
        with:
          version: nightly
      - name: Run Forge tests
        run: forge test -vvv
      - name: Run coverage
        run: forge coverage --report summary
      - name: Gas report
        run: forge test --gas-report > gas-report.txt
      - uses: actions/upload-artifact@v4
        with:
          name: gas-report
          path: contracts/gas-report.txt
```

### 7.2 Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage --project unit",
    "test:integration": "vitest run --coverage --project integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 7.3 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        'tests/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 7.4 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install testing dependencies
- [ ] Configure Vitest + React Testing Library
- [ ] Configure Playwright
- [ ] Set up MSW handlers
- [ ] Create test utilities and wrappers
- [ ] Write smoke tests (basic render for each page)

### Phase 2: Unit Tests (Week 2)
- [ ] All `lib/api.ts` functions (P0)
- [ ] All `lib/contracts.ts` functions (P0)
- [ ] `useStats` hook (P0)
- [ ] `useAuditors` hook (P0)
- [ ] `useStaking` hooks (P0)
- [ ] `useISNAD` hooks (P0)

### Phase 3: Integration Tests (Week 3)
- [ ] StatsSection component
- [ ] Header component + navigation
- [ ] Check page search flow
- [ ] Leaderboard page
- [ ] API routes

### Phase 4: E2E Tests (Week 4)
- [ ] Trust checker flow
- [ ] Wallet connection flow
- [ ] Leaderboard view
- [ ] Documentation navigation
- [ ] Mobile responsiveness

### Phase 5: Staking E2E (Week 5)
- [ ] Set up local Anvil fork
- [ ] Stake flow with testnet tokens
- [ ] Approval flow
- [ ] Error handling

### Phase 6: Polish (Week 6)
- [ ] Coverage review + gap filling
- [ ] Visual regression baseline
- [ ] CI optimization (caching, parallelization)
- [ ] Documentation

---

## File Structure

```
isnad/web/
├── tests/
│   ├── setup.ts              # Vitest setup (MSW, RTL matchers)
│   ├── mocks/
│   │   ├── handlers.ts       # MSW request handlers
│   │   ├── wagmi.ts          # Wagmi hook mocks
│   │   └── data.ts           # Mock data factories
│   ├── utils/
│   │   └── test-utils.tsx    # Render wrappers
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── api.test.ts
│   │   │   └── contracts.test.ts
│   │   └── hooks/
│   │       ├── useStats.test.ts
│   │       ├── useAuditors.test.ts
│   │       ├── useISNAD.test.ts
│   │       └── useStaking.test.ts
│   ├── integration/
│   │   ├── components/
│   │   │   ├── StatsSection.test.tsx
│   │   │   └── Header.test.tsx
│   │   ├── pages/
│   │   │   ├── check.test.tsx
│   │   │   ├── stake.test.tsx
│   │   │   └── leaderboard.test.tsx
│   │   └── api/
│   │       └── docs.test.ts
│   └── e2e/
│       ├── fixtures.ts
│       ├── check.spec.ts
│       ├── stake.spec.ts
│       └── navigation.spec.ts
├── vitest.config.ts
├── playwright.config.ts
└── TEST_PLAN.md (this file)
```

---

## Appendix: Test Coverage Matrix

| File | Unit | Integration | E2E |
|------|------|-------------|-----|
| `lib/api.ts` | ✅ 16 tests | - | - |
| `lib/contracts.ts` | ✅ 7 tests | - | - |
| `lib/wagmi.ts` | ✅ 3 tests | - | - |
| `hooks/useStats.ts` | ✅ 7 tests | ✅ (via component) | - |
| `hooks/useAuditors.ts` | ✅ 7 tests | ✅ (via component) | - |
| `hooks/useISNAD.ts` | ✅ 8 tests | - | - |
| `hooks/useStaking.ts` | ✅ 10 tests | ✅ (via page) | - |
| `components/StatsSection.tsx` | - | ✅ 5 tests | - |
| `components/Header.tsx` | - | ✅ 7 tests | ✅ mobile |
| `components/Providers.tsx` | - | ✅ 4 tests | - |
| `app/page.tsx` | - | ✅ 4 tests | ✅ navigation |
| `app/check/page.tsx` | - | ✅ 9 tests | ✅ flow |
| `app/stake/page.tsx` | - | ✅ 11 tests | ✅ flow |
| `app/leaderboard/page.tsx` | - | ✅ 5 tests | ✅ flow |
| `middleware.ts` | - | ✅ 4 tests | ✅ agent API |
| `api/docs/[...slug]/route.ts` | - | ✅ 5 tests | - |

**Total Estimated Tests:** ~112 tests across all categories

---

## Sign-off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Tech Lead | | | ☐ |
| QA Lead | | | ☐ |
| Product Owner | | | ☐ |

---

*This test plan should be reviewed and updated as the application evolves.*
