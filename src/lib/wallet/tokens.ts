// QFS Wallet — Token Configurations
// All official contracts are on Ethereum mainnet (chainId 1).
// On other chains, placeholders are used and can be overridden via env vars.

import type { Token } from '@/types/wallet';

// ─── Native tokens per chain ──────────────────────────────────────
export const NATIVE_TOKENS: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>> = {
  1: { symbol: 'ETH', name: 'Ethereum', address: '0x0', decimals: 18, chainId: 1, color: '#627EEA' },
  56: { symbol: 'BNB', name: 'BNB', address: '0x0', decimals: 18, chainId: 56, color: '#F3BA2F' },
  137: { symbol: 'POL', name: 'Polygon', address: '0x0', decimals: 18, chainId: 137, color: '#8247E5' },
  101: { symbol: 'SOL', name: 'Solana', address: '0x0', decimals: 9, chainId: 101, color: '#9945FF' },
  42161: { symbol: 'ETH', name: 'Arbitrum ETH', address: '0x0', decimals: 18, chainId: 42161, color: '#28A0F0' },
  8453: { symbol: 'ETH', name: 'Base ETH', address: '0x0', decimals: 18, chainId: 8453, color: '#0052FF' },
};

// ─── QFS Token (QFSpay) — Primary token ────────────────────────────
// Ethereum mainnet: 0xb5787DA56A4eaF11864696d8B5C6671aDF3449E7
export const QFS_TOKEN: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>> = {
  1: {
    symbol: 'QFS',
    name: 'QFS Token',
    address: process.env.NEXT_PUBLIC_QFS_ADDRESS_ETH || '0xb5787DA56A4eaF11864696d8B5C6671aDF3449E7',
    decimals: 18,
    chainId: 1,
    color: '#06B6D4',
  },
  56: {
    symbol: 'QFS',
    name: 'QFS Token',
    address: process.env.NEXT_PUBLIC_QFS_ADDRESS_BSC || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 56,
    color: '#06B6D4',
  },
  137: {
    symbol: 'QFS',
    name: 'QFS Token',
    address: process.env.NEXT_PUBLIC_QFS_ADDRESS_POLYGON || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 137,
    color: '#06B6D4',
  },
  101: {
    symbol: 'QFS',
    name: 'QFS Token',
    address: process.env.NEXT_PUBLIC_QFS_ADDRESS_SOLANA || 'QFSToken111111111111111111111111111111',
    decimals: 9,
    chainId: 101,
    color: '#06B6D4',
  },
  42161: {
    symbol: 'QFS',
    name: 'QFS Token',
    address: process.env.NEXT_PUBLIC_QFS_ADDRESS_ARB || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 42161,
    color: '#06B6D4',
  },
  8453: {
    symbol: 'QFS',
    name: 'QFS Token',
    address: process.env.NEXT_PUBLIC_QFS_ADDRESS_BASE || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 8453,
    color: '#06B6D4',
  },
};

// ─── GCRM Token (Global Currency Restart Master) ───────────────────
// Ethereum mainnet: 0x11175910c6F02913782777840ac008F30720046f
export const GCRM_TOKEN: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>> = {
  1: {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: process.env.NEXT_PUBLIC_GCRM_ADDRESS_ETH || '0x11175910c6F02913782777840ac008F30720046f',
    decimals: 18,
    chainId: 1,
    color: '#F59E0B',
  },
  56: {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: process.env.NEXT_PUBLIC_GCRM_ADDRESS_BSC || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 56,
    color: '#F59E0B',
  },
  137: {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: process.env.NEXT_PUBLIC_GCRM_ADDRESS_POLYGON || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 137,
    color: '#F59E0B',
  },
  101: {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: process.env.NEXT_PUBLIC_GCRM_ADDRESS_SOLANA || '11111111111111111111111111111111',
    decimals: 9,
    chainId: 101,
    color: '#F59E0B',
  },
  42161: {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: process.env.NEXT_PUBLIC_GCRM_ADDRESS_ARB || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 42161,
    color: '#F59E0B',
  },
  8453: {
    symbol: 'GCRM',
    name: 'Global Currency Restart Master',
    address: process.env.NEXT_PUBLIC_GCRM_ADDRESS_BASE || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 8453,
    color: '#F59E0B',
  },
};

// ─── AlArab Token (AlA) ────────────────────────────────────────────
// Ethereum mainnet: 0xF5c068f28eBF91b22e52C2ecD230621879e914B8
export const ALA_TOKEN: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>> = {
  1: {
    symbol: 'AlA',
    name: 'AlArab',
    address: process.env.NEXT_PUBLIC_ALA_ADDRESS_ETH || '0xF5c068f28eBF91b22e52C2ecD230621879e914B8',
    decimals: 18,
    chainId: 1,
    color: '#8B5CF6',
  },
  56: {
    symbol: 'AlA',
    name: 'AlArab',
    address: process.env.NEXT_PUBLIC_ALA_ADDRESS_BSC || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 56,
    color: '#8B5CF6',
  },
  137: {
    symbol: 'AlA',
    name: 'AlArab',
    address: process.env.NEXT_PUBLIC_ALA_ADDRESS_POLYGON || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 137,
    color: '#8B5CF6',
  },
  101: {
    symbol: 'AlA',
    name: 'AlArab',
    address: process.env.NEXT_PUBLIC_ALA_ADDRESS_SOLANA || 'AlaToken1111111111111111111111111111111',
    decimals: 9,
    chainId: 101,
    color: '#8B5CF6',
  },
  42161: {
    symbol: 'AlA',
    name: 'AlArab',
    address: process.env.NEXT_PUBLIC_ALA_ADDRESS_ARB || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 42161,
    color: '#8B5CF6',
  },
  8453: {
    symbol: 'AlA',
    name: 'AlArab',
    address: process.env.NEXT_PUBLIC_ALA_ADDRESS_BASE || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 8453,
    color: '#8B5CF6',
  },
};

// ─── TRAEX Token ───────────────────────────────────────────────────
// Ethereum mainnet: 0xf343cD6836FD14bE86aAE0a2a76c8b0e73E89dD0
export const TRAEX_TOKEN: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>> = {
  1: {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: process.env.NEXT_PUBLIC_TRAEX_ADDRESS_ETH || '0xf343cD6836FD14bE86aAE0a2a76c8b0e73E89dD0',
    decimals: 18,
    chainId: 1,
    color: '#EC4899',
  },
  56: {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: process.env.NEXT_PUBLIC_TRAEX_ADDRESS_BSC || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 56,
    color: '#EC4899',
  },
  137: {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: process.env.NEXT_PUBLIC_TRAEX_ADDRESS_POLYGON || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 137,
    color: '#EC4899',
  },
  101: {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: process.env.NEXT_PUBLIC_TRAEX_ADDRESS_SOLANA || 'TraexToken11111111111111111111111111111',
    decimals: 9,
    chainId: 101,
    color: '#EC4899',
  },
  42161: {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: process.env.NEXT_PUBLIC_TRAEX_ADDRESS_ARB || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 42161,
    color: '#EC4899',
  },
  8453: {
    symbol: 'TRAEX',
    name: 'TRAEX Token',
    address: process.env.NEXT_PUBLIC_TRAEX_ADDRESS_BASE || '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 8453,
    color: '#EC4899',
  },
};

// ─── Popular stablecoins per chain ─────────────────────────────────
export const POPULAR_TOKENS: Record<number, Omit<Token, 'balance' | 'valueUsd' | 'change24h'>[]> = {
  1: [
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, chainId: 1, color: '#26A17B' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, chainId: 1, color: '#2775CA' },
  ],
  56: [
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, chainId: 56, color: '#26A17B' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, chainId: 56, color: '#2775CA' },
  ],
  137: [
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, chainId: 137, color: '#26A17B' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, chainId: 137, color: '#2775CA' },
  ],
  101: [],
  42161: [
    { symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, chainId: 42161, color: '#26A17B' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, chainId: 42161, color: '#2775CA' },
  ],
  8453: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, chainId: 8453, color: '#2775CA' },
  ],
};

// ─── Helper: get all tokens available on a chain ───────────────────
export function getAvailableTokens(chainId: number): Omit<Token, 'balance' | 'valueUsd' | 'change24h'>[] {
  const tokens: Omit<Token, 'balance' | 'valueUsd' | 'change24h'>[] = [];
  const native = NATIVE_TOKENS[chainId];
  if (native) tokens.push(native);
  const qfs = QFS_TOKEN[chainId];
  if (qfs && qfs.address !== '0x0000000000000000000000000000000000000000') tokens.push(qfs);
  const gcrm = GCRM_TOKEN[chainId];
  if (gcrm && gcrm.address !== '0x0000000000000000000000000000000000000000') tokens.push(gcrm);
  const ala = ALA_TOKEN[chainId];
  if (ala && ala.address !== '0x0000000000000000000000000000000000000000') tokens.push(ala);
  const traex = TRAEX_TOKEN[chainId];
  if (traex && traex.address !== '0x0000000000000000000000000000000000000000') tokens.push(traex);
  const popular = POPULAR_TOKENS[chainId] || [];
  tokens.push(...popular);
  return tokens;
}

// ─── Helper: find a token by symbol on a specific chain ────────────
export function findTokenBySymbol(
  symbol: string,
  chainId: number = 1
): Omit<Token, 'balance' | 'valueUsd' | 'change24h'> | undefined {
  const tokens = getAvailableTokens(chainId);
  return tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
}

// Generates a small synthetic sparkline (30 points) from a base value
export function generateSparkline(base: number, change: number): number[] {
  const points: number[] = [];
  let v = base * (1 - change / 100);
  for (let i = 0; i < 30; i++) {
    const drift = (Math.sin(i / 3) + Math.cos(i / 5) + (Math.random() - 0.5) * 0.4) * base * 0.012;
    v += drift;
    points.push(Number(v.toFixed(4)));
  }
  // Force end at base * (1 + change/100)
  points[points.length - 1] = Number((base * (1 + change / 100)).toFixed(4));
  return points;
}

// ─── Official contract addresses (for quick reference) ─────────────
export const TOKEN_CONTRACTS = {
  QFS: {
    ethereum: '0xb5787DA56A4eaF11864696d8B5C6671aDF3449E7',
    bsc: '0x0000000000000000000000000000000000000000',
    polygon: '0x0000000000000000000000000000000000000000',
    solana: '',
    arbitrum: '0x0000000000000000000000000000000000000000',
    base: '0x0000000000000000000000000000000000000000',
  },
  GCRM: {
    ethereum: '0x11175910c6F02913782777840ac008F30720046f',
    bsc: '0x0000000000000000000000000000000000000000',
    polygon: '0x0000000000000000000000000000000000000000',
    solana: '',
    arbitrum: '0x0000000000000000000000000000000000000000',
    base: '0x0000000000000000000000000000000000000000',
  },
  ALARAB: {
    ethereum: '0xF5c068f28eBF91b22e52C2ecD230621879e914B8',
    bsc: '0x0000000000000000000000000000000000000000',
    polygon: '0x0000000000000000000000000000000000000000',
    solana: '',
    arbitrum: '0x0000000000000000000000000000000000000000',
    base: '0x0000000000000000000000000000000000000000',
  },
  TRAEX: {
    ethereum: '0xf343cD6836FD14bE86aAE0a2a76c8b0e73E89dD0',
    bsc: '0x0000000000000000000000000000000000000000',
    polygon: '0x0000000000000000000000000000000000000000',
    solana: '',
    arbitrum: '0x0000000000000000000000000000000000000000',
    base: '0x0000000000000000000000000000000000000000',
  },
} as const;
