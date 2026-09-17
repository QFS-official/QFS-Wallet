// QFS Wallet — On-chain balance service using direct JSON-RPC calls
// Reads native (ETH/POL/BNB) and ERC-20 token balances from public RPCs.
// Falls back gracefully when RPC fails.

import { formatUnits } from 'ethers';
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

// ─── Direct JSON-RPC call (avoids ethers JsonRpcProvider network detection issues) ──
async function rpcCall(rpcUrl: string, method: string, params: any[]): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'RPC error');
    return data.result;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ─── Helper: encode ERC-20 balanceOf(address) call ─────────────
// function selector: 0x70a08231 + padded address (32 bytes)
function encodeBalanceOf(address: string): string {
  const cleanAddr = address.replace('0x', '').toLowerCase().padStart(64, '0');
  return '0x70a08231' + cleanAddr;
}

// ─── Helper: decode hex to bigint ──────────────────────────────
function hexToBigInt(hex: string): bigint {
  if (!hex || hex === '0x') return 0n;
  try {
    return BigInt(hex);
  } catch {
    return 0n;
  }
}

// ─── Fetch native balance (ETH / BNB / POL) via direct RPC ─────
async function fetchNativeBalance(
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

  const rpcList = getChainRpcList(chainId);
  for (const rpc of rpcList) {
    try {
      const balanceHex = await rpcCall(rpc, 'eth_getBalance', [walletAddress, 'latest']);
      const balanceWei = hexToBigInt(balanceHex);
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
    } catch (err) {
      // Try next RPC
      continue;
    }
  }

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

// ─── Fetch ERC-20 balance via direct RPC ────────────────────────
async function fetchERC20Balance(
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

  const rpcList = getChainRpcList(chainId);
  const data = encodeBalanceOf(walletAddress);
  for (const rpc of rpcList) {
    try {
      const balanceHex = await rpcCall(rpc, 'eth_call', [{ to: token.address, data }, 'latest']);
      const balanceWei = hexToBigInt(balanceHex);
      const balanceStr = formatUnits(balanceWei, token.decimals);
      const balanceNum = parseFloat(balanceStr);

      return {
        symbol: token.symbol,
        name: token.name,
        chainId,
        contractAddress: token.address,
        balance: balanceNum.toFixed(4),
        balanceRaw: balanceNum,
        decimals: token.decimals,
        isNative: false,
        status: balanceNum === 0 ? 'zero' : 'success',
      };
    } catch (err) {
      // Try next RPC
      continue;
    }
  }

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
