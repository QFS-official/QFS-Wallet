// QFS Wallet — On-chain balance service using ethers.js
// Reads native (ETH/POL/BNB) and ERC-20 token balances from public RPCs.
// Runs entirely client-side. Falls back gracefully when RPC fails.

import { JsonRpcProvider, Contract, formatUnits } from 'ethers';
import type { Token } from '@/types/wallet';
import { getChainById, getChainRpcList } from './chains';
import {
  NATIVE_TOKENS,
  QFS_TOKEN,
  GCRM_TOKEN,
  ALA_TOKEN,
  TRAEX_TOKEN,
  POPULAR_TOKENS,
} from './tokens';

// ERC-20 minimal ABI for balance reading
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const FETCH_TIMEOUT_MS = 8000; // 8s per RPC

export interface OnChainBalance {
  symbol: string;
  name: string;
  chainId: number;
  contractAddress: string; // '0x0' for native
  balance: string;          // formatted human-readable
  balanceRaw: number;       // numeric (for math)
  decimals: number;
  isNative: boolean;
  status: 'success' | 'failed' | 'zero' | 'unsupported';
  error?: string;
}

// Provider cache: reuse providers across reads
const providerCache = new Map<string, JsonRpcProvider>();

async function getProvider(chainId: number): Promise<JsonRpcProvider | null> {
  const rpcList = getChainRpcList(chainId);
  if (rpcList.length === 0) return null;

  // Try the cached one first
  const cacheKey = `${chainId}:${rpcList[0]}`;
  if (providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey)!;
  }

  // Don't use staticNetwork — let ethers detect the network automatically
  const provider = new JsonRpcProvider(rpcList[0]);
  providerCache.set(cacheKey, provider);
  return provider;
}

// Create a fresh provider from a specific RPC URL (used when primary fails)
function createProvider(chainId: number, rpcUrl: string): JsonRpcProvider {
  // Don't use staticNetwork — let ethers detect the network automatically.
  // Passing staticNetwork: true with the wrong chainId can cause "failed to detect network" errors.
  return new JsonRpcProvider(rpcUrl);
}

// Fetch with timeout + RPC fallback
async function fetchWithFallback<T>(
  chainId: number,
  fn: (provider: JsonRpcProvider) => Promise<T>
): Promise<{ result: T; provider: JsonRpcProvider } | null> {
  const rpcList = getChainRpcList(chainId);
  for (const rpc of rpcList) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const provider = createProvider(chainId, rpc);
      const result = await fn(provider);
      clearTimeout(timeout);
      return { result, provider };
    } catch (err) {
      // Try next RPC
      continue;
    }
  }
  return null;
}

// ─── Native balance (ETH / BNB / POL) ────────────────────────────
export async function fetchNativeBalance(
  walletAddress: string,
  chainId: number
): Promise<OnChainBalance> {
  const chain = getChainById(chainId);
  const native = NATIVE_TOKENS[chainId];
  if (!chain || !native) {
    return {
      symbol: '?',
      name: 'Unknown',
      chainId,
      contractAddress: '0x0',
      balance: '0.0000',
      balanceRaw: 0,
      decimals: 18,
      isNative: true,
      status: 'unsupported',
      error: 'Chain not supported',
    };
  }

  const res = await fetchWithFallback(chainId, (p) => p.getBalance(walletAddress));
  if (!res) {
    return {
      symbol: native.symbol,
      name: native.name,
      chainId,
      contractAddress: '0x0',
      balance: '0.0000',
      balanceRaw: 0,
      decimals: native.decimals,
      isNative: true,
      status: 'failed',
      error: 'All RPCs failed',
    };
  }

  const balanceWei = res.result;
  const balanceStr = formatUnits(balanceWei, native.decimals);
  const balanceNum = parseFloat(balanceStr);

  return {
    symbol: native.symbol,
    name: native.name,
    chainId,
    contractAddress: '0x0',
    balance: balanceNum.toFixed(4),
    balanceRaw: balanceNum,
    decimals: native.decimals,
    isNative: true,
    status: balanceNum === 0 ? 'zero' : 'success',
  };
}

// ─── ERC-20 balance ──────────────────────────────────────────────
export async function fetchERC20Balance(
  walletAddress: string,
  chainId: number,
  token: { symbol: string; name: string; address: string; decimals: number }
): Promise<OnChainBalance> {
  if (!token.address || token.address === ZERO_ADDRESS) {
    return {
      symbol: token.symbol,
      name: token.name,
      chainId,
      contractAddress: token.address,
      balance: '0.0000',
      balanceRaw: 0,
      decimals: token.decimals,
      isNative: false,
      status: 'unsupported',
      error: 'No contract on this chain',
    };
  }

  const res = await fetchWithFallback(chainId, async (provider) => {
    const contract = new Contract(token.address, ERC20_ABI, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals().catch(() => token.decimals),
    ]);
    return { balance, decimals: Number(decimals) };
  });

  if (!res) {
    return {
      symbol: token.symbol,
      name: token.name,
      chainId,
      contractAddress: token.address,
      balance: '0.0000',
      balanceRaw: 0,
      decimals: token.decimals,
      isNative: false,
      status: 'failed',
      error: 'All RPCs failed',
    };
  }

  const balanceStr = formatUnits(res.result.balance, res.result.decimals);
  const balanceNum = parseFloat(balanceStr);

  return {
    symbol: token.symbol,
    name: token.name,
    chainId,
    contractAddress: token.address,
    balance: balanceNum.toFixed(4),
    balanceRaw: balanceNum,
    decimals: res.result.decimals,
    isNative: false,
    status: balanceNum === 0 ? 'zero' : 'success',
  };
}

// ─── Fetch all balances for a wallet across supported chains ─────
// Returns balances for: native (ETH/POL/BNB) + QFS + GCRM + AlA + TRAEX + popular tokens
export async function fetchAllBalances(
  walletAddress: string
): Promise<OnChainBalance[]> {
  if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
    return [];
  }

  const chains = [1, 137, 56]; // ETH, Polygon, BNB
  const balances: OnChainBalance[] = [];

  // Build the list of (chain, token) combos to fetch
  const tasks: Array<Promise<OnChainBalance>> = [];

  for (const chainId of chains) {
    // Native
    tasks.push(fetchNativeBalance(walletAddress, chainId));

    // QFS
    const qfs = QFS_TOKEN[chainId];
    if (qfs) tasks.push(fetchERC20Balance(walletAddress, chainId, qfs));

    // GCRM
    const gcrm = GCRM_TOKEN[chainId];
    if (gcrm) tasks.push(fetchERC20Balance(walletAddress, chainId, gcrm));

    // AlA
    const ala = ALA_TOKEN[chainId];
    if (ala) tasks.push(fetchERC20Balance(walletAddress, chainId, ala));

    // TRAEX
    const traex = TRAEX_TOKEN[chainId];
    if (traex) tasks.push(fetchERC20Balance(walletAddress, chainId, traex));

    // Popular (USDT/USDC) on mainnet only to keep it light
    if (chainId === 1) {
      const popular = POPULAR_TOKENS[chainId] || [];
      for (const p of popular) {
        tasks.push(fetchERC20Balance(walletAddress, chainId, p));
      }
    }
  }

  // Run all reads in parallel
  const results = await Promise.all(tasks);
  balances.push(...results);

  return balances;
}

// ─── Helper: detect if a wallet has any non-zero balance ──────
export function hasAnyBalance(balances: OnChainBalance[]): boolean {
  return balances.some((b) => b.balanceRaw > 0);
}

// ─── Helper: count successful reads vs failed ─────────────────
export function summarizeBalances(balances: OnChainBalance[]) {
  const success = balances.filter((b) => b.status === 'success').length;
  const zero = balances.filter((b) => b.status === 'zero').length;
  const failed = balances.filter((b) => b.status === 'failed').length;
  const unsupported = balances.filter((b) => b.status === 'unsupported').length;
  return { success, zero, failed, unsupported, total: balances.length };
}
