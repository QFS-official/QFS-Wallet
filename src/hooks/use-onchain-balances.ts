// QFS Wallet — Hook to fetch on-chain balances live
// Returns balance state + loading + error + refresh function
// Caches results in memory for 30 seconds to avoid refetching on screen changes

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAllBalances,
  type OnChainBalance,
} from '@/lib/wallet/onchain';

interface UseOnChainBalancesResult {
  balances: OnChainBalance[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

const CACHE_TTL = 30_000; // 30s
const cache = new Map<string, { data: OnChainBalance[]; ts: number }>();

export function useOnChainBalances(walletAddress: string | null): UseOnChainBalancesResult {
  const [balances, setBalances] = useState<OnChainBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      // Check cache first
      const cached = cache.get(walletAddress);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        if (mountedRef.current) {
          setBalances(cached.data);
          setLastUpdated(cached.ts);
          setLoading(false);
        }
        return;
      }

      const result = await fetchAllBalances(walletAddress);
      cache.set(walletAddress, { data: result, ts: Date.now() });
      if (mountedRef.current) {
        setBalances(result);
        setLastUpdated(Date.now());
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message || 'Failed to fetch balances');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    mountedRef.current = true;
    if (walletAddress) {
      refresh();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [walletAddress, refresh]);

  return { balances, loading, error, lastUpdated, refresh };
}
