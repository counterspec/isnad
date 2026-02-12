import { vi } from 'vitest';

// Mock wagmi hooks
export const mockUseAccount = vi.fn((): any => ({
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  connector: undefined,
  chain: undefined,
  status: 'disconnected',
}));

export const mockUseConnect = vi.fn(() => ({
  connect: vi.fn(),
  connectors: [
    { id: 'injected', name: 'MetaMask' },
    { id: 'coinbaseWallet', name: 'Coinbase Wallet' },
    { id: 'walletConnect', name: 'WalletConnect' },
  ],
  isPending: false,
  isSuccess: false,
  error: null,
}));

export const mockUseDisconnect = vi.fn(() => ({
  disconnect: vi.fn(),
  isPending: false,
}));

export const mockUseReadContract = vi.fn((): any => ({
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
}));

export const mockUseWriteContract = vi.fn(() => ({
  writeContract: vi.fn(),
  data: undefined,
  isPending: false,
  isError: false,
  error: null,
  reset: vi.fn(),
}));

export const mockUseWaitForTransactionReceipt = vi.fn(() => ({
  data: undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
}));

export const mockUseChainId = vi.fn(() => 84532);

// Setup wagmi mocks
export function setupWagmiMocks() {
  vi.mock('wagmi', async (importOriginal) => {
    const original = await importOriginal() as object;
    return {
      ...original,
      useAccount: mockUseAccount,
      useConnect: mockUseConnect,
      useDisconnect: mockUseDisconnect,
      useReadContract: mockUseReadContract,
      useReadContracts: vi.fn(() => ({ data: undefined, isLoading: false })),
      useWriteContract: mockUseWriteContract,
      useWaitForTransactionReceipt: mockUseWaitForTransactionReceipt,
      useChainId: mockUseChainId,
      WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
    };
  });
}

// Helper to simulate connected wallet
export function mockConnectedWallet(address: `0x${string}` = '0x1234567890123456789012345678901234567890') {
  mockUseAccount.mockReturnValue({
    address,
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    connector: { id: 'injected', name: 'MetaMask' },
    chain: { id: 84532, name: 'Base Sepolia' },
    status: 'connected',
  });
}

// Helper to simulate disconnected wallet
export function mockDisconnectedWallet() {
  mockUseAccount.mockReturnValue({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    connector: undefined,
    chain: undefined,
    status: 'disconnected',
  });
}

// Helper to mock token balance
export function mockTokenBalance(balance: bigint) {
  mockUseReadContract.mockReturnValue({
    data: balance,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
}

// Helper to mock token allowance
export function mockTokenAllowance(allowance: bigint) {
  mockUseReadContract.mockReturnValue({
    data: allowance,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
}
