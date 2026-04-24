import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
} from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'KinkoX - Save to Earn Platform',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

// Supported chains for our platform
export const supportedChains = [sepolia]; // Using Sepolia for testnet

// Chain configuration
export const chainConfig = {
  [sepolia.id]: {
    name: 'Sepolia',
    currency: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
  },
};
