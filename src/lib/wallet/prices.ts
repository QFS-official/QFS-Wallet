// QFS Wallet — CoinGecko price feed
// Fetches USD prices + 24h change for native tokens and ERC-20 tokens
// Uses the free public API (no auth required, ~50 calls/min rate limit)

import { getChainById } from './chains';

// CoinGecko platform IDs by chain
const PLATFORM_BY_CHAIN: Record<number, string> = {
  1: 'ethereum',
  56: 'binance-smart-chain',
  137: 'polygon-pos',
};

// CoinGecko coin IDs for native + popular tokens
const COIN_ID_BY_SYMBOL: Record<string, string> = {
  ETH: 'ethereum',
  BNB: 'binancecoin',
  POL: 'matic-network',
  MATIC: 'matic-network',
  USDT: 'tether',
  USDC: 'usd-coin',
  BTC: 'bitcoin',
};

export interface TokenPrice {
  symbol: string;
  usd: number;
  change24h: number;
  source: 'coingecko' | 'fallback';
}

export interface PriceResult {
  prices: Record<string, TokenPrice>; // keyed by symbol or contract address
  fetchedAt: number;
  errors: string[];
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FETCH_TIMEOUT_MS = 10000;

// ─── Fetch native + popular token prices ────────────────────────
// symbols: ['ETH', 'BNB', 'POL', 'USDT', 'USDC', 'BTC']
async function fetchNativeAndPopularPrices(symbols: string[]): Promise<Record<string, TokenPrice>> {
  const ids = symbols
    .map((s) => COIN_ID_BY_SYMBOL[s])
    .filter(Boolean);
  if (ids.length === 0) return {};

  const url = `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const out: Record<string, TokenPrice> = {};
    for (const s of symbols) {
      const id = COIN_ID_BY_SYMBOL[s];
      if (id && data[id]) {
        out[s] = {
          symbol: s,
          usd: data[id].usd ?? 0,
          change24h: data[id].usd_24h_change ?? 0,
          source: 'coingecko',
        };
      }
    }
    return out;
  } catch (err) {
    clearTimeout(timeout);
    return {};
  }
}

// ─── Fetch ERC-20 token prices by contract address ──────────────
// Fetches prices for tokens on a specific chain (ETH/BSC/Polygon)
async function fetchERC20Prices(
  chainId: number,
  contractAddresses: string[]
): Promise<Record<string, TokenPrice>> {
  if (contractAddresses.length === 0) return {};
  const platform = PLATFORM_BY_CHAIN[chainId];
  if (!platform) return {};

  const addresses = contractAddresses.join(',');
  const url = `${COINGECKO_BASE}/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd&include_24hr_change=true`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const out: Record<string, TokenPrice> = {};
    for (const addr of contractAddresses) {
      const lower = addr.toLowerCase();
      const entry = data[lower];
      if (entry && entry.usd) {
        out[addr] = {
          symbol: '', // caller fills this in
          usd: entry.usd,
          change24h: entry.usd_24h_change ?? 0,
          source: 'coingecko',
        };
      }
    }
    return out;
  } catch (err) {
    clearTimeout(timeout);
    return {};
  }
}

// ─── Main entry: fetch all prices for the displayed balances ─────
// Balances is an array of OnChainBalance objects
// Returns a map keyed by symbol (for native/popular) and by contract address (for ERC-20)
export async function fetchAllPrices(
  balances: Array<{ symbol: string; chainId: number; contractAddress: string; isNative: boolean }>
): Promise<PriceResult> {
  const prices: Record<string, TokenPrice> = {};
  const errors: string[] = [];

  // 1. Collect unique native + popular symbols
  const nativeSymbols = new Set<string>();
  for (const b of balances) {
    if (b.isNative) nativeSymbols.add(b.symbol);
    if (COIN_ID_BY_SYMBOL[b.symbol] && !b.isNative) nativeSymbols.add(b.symbol);
  }
  if (nativeSymbols.size > 0) {
    const nativePrices = await fetchNativeAndPopularPrices(Array.from(nativeSymbols));
    Object.assign(prices, nativePrices);
  }

  // 2. Collect ERC-20 contract addresses grouped by chain
  const erc20ByChain: Record<number, string[]> = {};
  for (const b of balances) {
    if (!b.isNative && b.contractAddress && b.contractAddress !== '0x0' && !COIN_ID_BY_SYMBOL[b.symbol]) {
      if (!erc20ByChain[b.chainId]) erc20ByChain[b.chainId] = [];
      const addr = b.contractAddress.toLowerCase();
      if (!erc20ByChain[b.chainId].includes(addr)) {
        erc20ByChain[b.chainId].push(addr);
      }
    }
  }

  // Fetch ERC-20 prices per chain in parallel
  for (const [chainIdStr, addresses] of Object.entries(erc20ByChain)) {
    const chainId = parseInt(chainIdStr);
    const erc20Prices = await fetchERC20Prices(chainId, addresses);
    Object.assign(prices, erc20Prices);
  }

  return {
    prices,
    fetchedAt: Date.now(),
    errors,
  };
}

// ─── Helper: get price key for a balance ────────────────────────
// Native tokens are keyed by symbol (ETH, BNB, POL, USDT, USDC)
// ERC-20 tokens are keyed by contract address (lowercased)
export function getPriceKey(balance: { symbol: string; contractAddress: string; isNative: boolean }): string {
  if (balance.isNative) return balance.symbol;
  if (COIN_ID_BY_SYMBOL[balance.symbol]) return balance.symbol;
  return balance.contractAddress.toLowerCase();
}

// ─── Helper: format USD value ──────────────────────────────────
export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value > 0) return `$${value.toFixed(4)}`;
  return '$0.00';
}
