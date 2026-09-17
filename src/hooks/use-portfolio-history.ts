// QFS Wallet — Hook to fetch historical portfolio value over time
// Uses CoinGecko historical prices × current balances to compute
// a "what-if" portfolio value series (assumes user held current
// balances historically — approximation since we don't snapshot balances)

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnChainBalance } from '@/lib/wallet/onchain';

export interface PortfolioPoint {
  timestamp: number; // ms
  value: number;     // USD
}

interface UsePortfolioHistoryResult {
  data: PortfolioPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  // Stats
  totalNow: number;
  totalThen: number;
  changePct: number;
  changeAbs: number;
  high: number;
  low: number;
}

const CACHE_TTL = 300_000; // 5 min
const cache = new Map<string, { data: PortfolioPoint[]; ts: number; totalNow: number }>();

// Symbols with meaningful price history (skip stablecoins)
const VOLATILE_SYMBOLS = ['ETH', 'BNB', 'POL', 'MATIC', 'BTC'];
const STABLECOIN_SYMBOLS = ['USDT', 'USDC', 'DAI'];

export function usePortfolioHistory(
  balances: OnChainBalance[],
  days: number = 30
): UsePortfolioHistoryResult {
  const [data, setData] = useState<PortfolioPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (balances.length === 0) return;

    // Compute current total (anchor point)
    const totalNow = balances.reduce((sum, b) => {
      // For stablecoins use $1 as price
      if (STABLECOIN_SYMBOLS.includes(b.symbol)) return sum + b.balanceRaw;
      // For volatile tokens we don't have prices here, skip — fetch will include them
      return sum;
    }, 0);

    // Determine which volatile symbols have non-zero balances
    const symbolsToFetch = Array.from(
      new Set(
        balances
          .filter((b) => b.balanceRaw > 0 && VOLATILE_SYMBOLS.includes(b.symbol))
          .map((b) => b.symbol)
      )
    );

    if (symbolsToFetch.length === 0 && totalNow === 0) {
      // No balances at all
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cache key: symbols + days + balance snapshot signature
      const balanceKey = balances
        .map((b) => `${b.symbol}:${b.balanceRaw}`)
        .sort()
        .join('|');
      const cacheKey = `${symbolsToFetch.join(',')}:${days}:${balanceKey}`;

      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        if (mountedRef.current) {
          setData(cached.data);
          setLastUpdated(cached.ts);
          setLoading(false);
        }
        return;
      }

      // Fetch historical prices via our API proxy
      const url = `/api/portfolio-history?days=${days}&symbols=${symbolsToFetch.join(',')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      // result.history: { ETH: [[ts, price], ...], BNB: [...], POL: [...] }
      const history: Record<string, [number, number][]> = result.history || {};

      // Find the longest price array (reference for timestamps)
      let refSymbol = '';
      let maxLen = 0;
      for (const [sym, prices] of Object.entries(history)) {
        if (prices.length > maxLen) {
          maxLen = prices.length;
          refSymbol = sym;
        }
      }

      if (!refSymbol || maxLen === 0) {
        // No historical data — return flat line with current total
        const now = Date.now();
        const flatData: PortfolioPoint[] = [
          { timestamp: now - days * 86400_000, value: totalNow },
          { timestamp: now, value: totalNow },
        ];
        if (mountedRef.current) {
          setData(flatData);
          setLastUpdated(Date.now());
        }
        return;
      }

      // Build a price lookup map per symbol: { ts → price }
      const priceMaps: Record<string, Map<number, number>> = {};
      for (const [sym, prices] of Object.entries(history)) {
        const m = new Map<number, number>();
        for (const [ts, price] of prices) {
          m.set(ts, price);
        }
        priceMaps[sym] = m;
      }

      // For each timestamp in the reference series, sum up the portfolio value
      // = sum over symbols of (balance × price_at_ts)
      // For stablecoins, just use the balance as-is (price ≈ $1)
      const stableTotal = balances
        .filter((b) => STABLECOIN_SYMBOLS.includes(b.symbol))
        .reduce((sum, b) => sum + b.balanceRaw, 0);

      const balanceBySymbol: Record<string, number> = {};
      for (const b of balances) {
        if (b.balanceRaw > 0 && VOLATILE_SYMBOLS.includes(b.symbol)) {
          balanceBySymbol[b.symbol] = b.balanceRaw;
        }
      }

      const refPrices = history[refSymbol];
      const series: PortfolioPoint[] = [];

      for (const [ts, _] of refPrices) {
        // Find the closest price for each symbol at this timestamp
        let total = stableTotal;
        for (const [sym, prices] of Object.entries(history)) {
          const bal = balanceBySymbol[sym];
          if (!bal || bal === 0) continue;
          // Find closest timestamp (binary search would be ideal; here linear since arrays are small)
          let closestPrice = 0;
          let minDiff = Infinity;
          for (const [pts, pprice] of prices) {
            const diff = Math.abs(pts - ts);
            if (diff < minDiff) {
              minDiff = diff;
              closestPrice = pprice;
            }
            if (pts >= ts) break;
          }
          total += bal * closestPrice;
        }
        series.push({ timestamp: ts, value: total });
      }

      cache.set(cacheKey, { data: series, ts: Date.now(), totalNow });
      if (mountedRef.current) {
        setData(series);
        setLastUpdated(Date.now());
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message || 'Failed to fetch history');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [balances, days]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  // Stats
  const totalNow = data.length > 0 ? data[data.length - 1].value : 0;
  const totalThen = data.length > 0 ? data[0].value : 0;
  const changeAbs = totalNow - totalThen;
  const changePct = totalThen > 0 ? (changeAbs / totalThen) * 100 : 0;
  let high = 0;
  let low = Infinity;
  for (const p of data) {
    if (p.value > high) high = p.value;
    if (p.value < low) low = p.value;
  }
  if (data.length === 0) low = 0;

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    totalNow,
    totalThen,
    changePct,
    changeAbs,
    high,
    low,
  };
}
