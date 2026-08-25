// QFS Wallet - Chain Configurations
import type { ChainConfig } from '@/types/wallet';

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    icon: '⟠',
    color: '#627EEA',
    isTestnet: false,
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    icon: '◆',
    color: '#F3BA2F',
    isTestnet: false,
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'POL',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    icon: '⬡',
    color: '#8247E5',
    isTestnet: false,
  },
  {
    id: 101,
    name: 'Solana',
    symbol: 'SOL',
    rpc: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io',
    icon: '◎',
    color: '#9945FF',
    isTestnet: false,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    icon: '◈',
    color: '#28A0F0',
    isTestnet: false,
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    icon: '▲',
    color: '#0052FF',
    isTestnet: false,
  },
];

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

export function getChainRpc(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.rpc || SUPPORTED_CHAINS[0].rpc;
}

export function getExplorerUrl(chainId: number, addressOrHash: string, type: 'address' | 'tx' = 'address'): string {
  const chain = getChainById(chainId);
  if (!chain) return '#';
  return `${chain.explorer}/${type}/${addressOrHash}`;
}
