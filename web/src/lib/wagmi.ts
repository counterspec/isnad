import { createConfig, http } from 'wagmi';
import { baseSepolia, base, hardhat } from 'wagmi/chains';

export const config = createConfig({
  chains: [baseSepolia, base, hardhat],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});

// For SSR
export const chains = [baseSepolia, base, hardhat] as const;
