import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a test query client with sensible defaults
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Provider wrapper for tests
function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Custom render function
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Utility to wait for async operations
export async function waitForLoadingToFinish() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Mock address generator for tests
export function generateMockAddress(seed: number = 0): `0x${string}` {
  return `0x${seed.toString(16).padStart(40, '0')}` as `0x${string}`;
}

// Mock hash generator for tests
export function generateMockHash(seed: number = 0): `0x${string}` {
  return `0x${seed.toString(16).padStart(64, '0')}` as `0x${string}`;
}
