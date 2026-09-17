// QFS Wallet — Hook to fetch token prices from CoinGecko
// Caches results for 60 seconds to respect rate limits

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllPrices, getPriceKey, type PriceResult, type TokenPrice } from '@/lib/wallet/prices';
import type { OnChainBalance } from '@/lib/wallet/onchain';

interface UseTokenPricesResult {
  prices: Record<string, TokenPrice>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  // Helper to get the price for a balance
  getPriceFor: (balance: OnChainBalance) => TokenPrice | null;
  // Helper to compute the USD value of a balance
  getUsdValueFor: (balance: OnChainBalance) => number;
}

const CACHE_TTL = 60_000; // 60 seconds
const cache = new Map<string, { data: PriceResult; ts: number }>();

export function useTokenPrices(balances: OnChainBalance[]): UseTokenPricesResult {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (balances.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // Cache key: a hash of the unique (symbol, chainId, contractAddress) tuples
      const cacheKey = balances
        .map((b) => `${b.symbol}:${b.chainId}:${b.contractAddress}`)
        .sort()
        .join('|');
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        if (mountedRef.current) {
          setPrices(cached.data.prices);
          setLastUpdated(cached.data.fetchedAt);
          setLoading(false);
        }
        return;
      }

      const result = await fetchAllPrices(balances);
      cache.set(cacheKey, { data: result, ts: Date.now() });
      if (mountedRef.current) {
        setPrices(result.prices);
        setLastUpdated(result.fetchedAt);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message || 'Failed to fetch prices');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [balances]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const getPriceFor = useCallback(
    (balance: OnChainBalance): TokenPrice | null => {
      const key = getPriceKey(balance);
      return prices[key] || null;
    },
    [prices]
  );

  const getUsdValueFor = useCallback(
    (balance: OnChainBalance): number => {
      const price = getPriceFor(balance);
      if (!price) return 0;
      return balance.balanceRaw * price.usd;
    },
    [getPriceFor]
  );

  return {
    prices,
    loading,
    error,
    lastUpdated,
    refresh,
    getPriceFor,
    getUsdValueFor,
  };
}
