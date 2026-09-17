'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, Database, ChevronDown, Pencil, X, Check } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { BalanceHero } from '@/components/dashboard/BalanceHero';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { WalletAddressCard } from '@/components/dashboard/WalletAddressCard';
import { PortfolioDonut } from '@/components/dashboard/PortfolioDonut';
import { MarketsList } from '@/components/dashboard/MarketsList';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TokenIcon } from '@/components/dashboard/TokenIcon';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { useOnChainBalances } from '@/hooks/use-onchain-balances';
import { useTokenPrices } from '@/hooks/use-token-prices';
import { formatUsd as formatUsdValue } from '@/lib/wallet/prices';
import { getChainById } from '@/lib/wallet/chains';
import { type OnChainBalance } from '@/lib/wallet/onchain';
import type { Screen, Token } from '@/types/wallet';
import { formatUsd } from '@/lib/wallet/core';

export function DashboardScreen({ onAction }: { onAction: (action: Screen) => void }) {
  const address = useWalletStore((s) => s.address);
  const setAddress = useWalletStore((s) => s.setAddress);
  const demoTokens = useWalletStore((s) => s.tokens);
  const addToast = useWalletStore((s) => s.addToast);

  // Live on-chain balances
  const { balances, loading, error, lastUpdated, refresh } = useOnChainBalances(address);

  const [liveMode, setLiveMode] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(address);

  const stats = useMemo(
    () => ({
      totalAssets: 42_870_000,
      totalAssetsChange: 12.4,
      liquidityPool: 18_450_000,
      liquidityPoolChange: 8.7,
      apy: 12.6,
    }),
    []
  );

  // Build tokens for display based on mode
  const displayTokens: Token[] = useMemo(() => {
    if (!liveMode) return demoTokens;

    // Convert on-chain balances to Token[] for the AssetsTable
    return balances
      .filter((b) => b.status !== 'failed' && b.status !== 'unsupported')
      .map((b) => {
        const chain = getChainById(b.chainId);
        return {
          symbol: b.symbol,
          name: b.name,
          address: b.contractAddress,
          decimals: b.decimals,
          balance: b.balance,
          valueUsd: 0, // price feed not integrated yet
          change24h: 0,
          chainId: b.chainId,
          color: b.isNative ? chain?.color || '#06B6D4' : '#06B6D4',
          sparkline: [],
        } as Token;
      });
  }, [liveMode, demoTokens, balances]);

  const liveStats = useMemo(() => {
    if (!liveMode) return stats;
    // For live mode we can't compute USD value (no price feed yet)
    // Show count of non-zero balances as a proxy
    const nonZero = balances.filter((b) => b.balanceRaw > 0).length;
    const totalChains = new Set(balances.filter((b) => b.balanceRaw > 0).map((b) => b.chainId)).size;
    return {
      totalAssets: nonZero,
      totalAssetsChange: 0,
      liquidityPool: totalChains,
      liquidityPoolChange: 0,
      apy: 0,
    };
  }, [liveMode, balances, stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mode toggle bar */}
      <div className="flex items-center justify-between mb-4 px-4 py-2.5 glass-card rounded-xl gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
            <button
              onClick={() => setLiveMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                !liveMode ? 'bg-cyan-500/15 text-cyan-400' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={!liveMode}
            >
              <Database size={12} /> Demo
            </button>
            <button
              onClick={() => {
                setLiveMode(true);
                if (address) refresh();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                liveMode ? 'bg-cyan-500/15 text-cyan-400' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={liveMode}
            >
              <Wifi size={12} /> Live
            </button>
          </div>
          {liveMode && lastUpdated && (
            <span className="text-[10px] text-muted-foreground">
              Actualizado: {new Date(lastUpdated).toLocaleTimeString('es-ES')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Address editor (only in live mode) */}
          {liveMode && (
            editingAddress ? (
              <div className="flex items-center gap-1">
                <input
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="0x..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (/^0x[a-fA-F0-9]{40}$/.test(addressInput)) {
                        setAddress(addressInput);
                        setEditingAddress(false);
                        addToast('Dirección actualizada, refrescando...', 'success');
                        setTimeout(() => refresh(), 100);
                      } else {
                        addToast('Dirección inválida (debe ser 0x + 40 hex chars)', 'error');
                      }
                    } else if (e.key === 'Escape') {
                      setEditingAddress(false);
                      setAddressInput(address);
                    }
                  }}
                  className="h-8 w-64 px-2 rounded-md bg-white/[0.04] border border-cyan-500/40 text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (/^0x[a-fA-F0-9]{40}$/.test(addressInput)) {
                      setAddress(addressInput);
                      setEditingAddress(false);
                      addToast('Dirección actualizada', 'success');
                      setTimeout(() => refresh(), 100);
                    } else {
                      addToast('Dirección inválida', 'error');
                    }
                  }}
                  className="p-1.5 rounded-md bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                  aria-label="Confirmar"
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => {
                    setEditingAddress(false);
                    setAddressInput(address);
                  }}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground"
                  aria-label="Cancelar"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAddressInput(address);
                  setEditingAddress(true);
                }}
                className="flex items-center gap-1.5 px-2 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                title="Cambiar dirección para observar"
              >
                <Pencil size={11} />
                <span className="hidden sm:inline">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </button>
            )
          )}

          {liveMode && (
            <>
              {error && (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <WifiOff size={11} /> Error RPC
                </span>
              )}
              {loading && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400">
                  <div className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Cargando...
                </span>
              )}
              <button
                onClick={() => refresh()}
                disabled={loading}
                className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors disabled:opacity-40"
                aria-label="Refrescar balances"
                title="Refrescar"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="min-w-0">
          <BalanceHero onAction={onAction} />

          {/* Live balances detail panel (only in live mode) */}
          {liveMode && balances.length > 0 && (
            <LiveBalancesPanel balances={balances} loading={loading} onRefresh={refresh} />
          )}

          {/* Portfolio historical chart — only in live mode */}
          {liveMode && balances.length > 0 && <PortfolioChart balances={balances} />}

          <StatsRow
            totalAssets={liveStats.totalAssets}
            totalAssetsChange={liveStats.totalAssetsChange}
            liquidityPool={liveStats.liquidityPool}
            liquidityPoolChange={liveStats.liquidityPoolChange}
            apy={liveStats.apy}
          />
          <AssetsTable />
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-0">
          <WalletAddressCard />
          <PortfolioDonut />
          <MarketsList />
          <RecentTransactions />
        </aside>
      </div>
    </motion.div>
  );
}

// ─── Live balances detail panel ──────────────────────────────────
function LiveBalancesPanel({
  balances,
  loading,
  onRefresh,
}: {
  balances: OnChainBalance[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const nonZero = balances.filter((b) => b.balanceRaw > 0);
  const chains = new Set(balances.map((b) => b.chainId));

  // Fetch prices from CoinGecko
  const { getPriceFor, getUsdValueFor, lastUpdated: pricesUpdated, loading: pricesLoading } = useTokenPrices(balances);

  // Total USD value across all balances
  const totalUsd = balances.reduce((sum, b) => sum + getUsdValueFor(b), 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="glass-card rounded-2xl p-5 mb-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft" />
          Saldos On-Chain ({chains.size} redes)
        </h3>
        <div className="flex items-center gap-2">
          {totalUsd > 0 && (
            <span className="text-sm font-bold text-cyan-400 tabular-nums">
              {formatUsdValue(totalUsd)}
            </span>
          )}
          {(pricesLoading || loading) && (
            <div className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {nonZero.length} con saldo · {balances.length} totales
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-white/5 text-muted-foreground"
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {balances.map((b) => {
            const chain = getChainById(b.chainId);
            const positive = b.balanceRaw > 0;
            const price = getPriceFor(b);
            const usdValue = getUsdValueFor(b);
            return (
              <div
                key={`${b.symbol}-${b.chainId}`}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  positive
                    ? 'bg-cyan-500/5 border-cyan-500/20'
                    : 'bg-white/[0.02] border-white/[0.04]'
                }`}
                title={b.error || (b.isNative ? 'Native token' : b.contractAddress)}
              >
                <TokenIcon symbol={b.symbol} size={28} color={chain?.color || '#06B6D4'} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {b.symbol}
                    <span className="text-muted-foreground font-normal ml-1">
                      · {chain?.symbol}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {b.isNative
                      ? chain?.name
                      : b.contractAddress.slice(0, 6) + '...' + b.contractAddress.slice(-4)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {b.status === 'failed' ? (
                    <span className="text-[10px] text-red-400">RPC ✕</span>
                  ) : b.status === 'unsupported' ? (
                    <span className="text-[10px] text-amber-400">N/A</span>
                  ) : (
                    <>
                      <p className={`text-xs font-semibold tabular-nums ${positive ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                        {Number(b.balance).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </p>
                      {price ? (
                        <p className="text-[10px] text-emerald-400/80 tabular-nums">
                          {formatUsdValue(usdValue)}
                          {price.change24h !== 0 && (
                            <span className={price.change24h >= 0 ? 'text-emerald-400/60 ml-1' : 'text-red-400/60 ml-1'}>
                              {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(1)}%
                            </span>
                          )}
                        </p>
                      ) : positive ? (
                        <p className="text-[10px] text-muted-foreground/40">Sin precio</p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && nonZero.length === 0 && balances.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Esta wallet no tiene saldos en las 3 redes soportadas. Recibe tokens para verlos aquí.
        </p>
      )}
      {pricesUpdated && (
        <p className="text-[10px] text-muted-foreground/50 text-right mt-2">
          Precios: CoinGecko · actualizado {new Date(pricesUpdated).toLocaleTimeString('es-ES')}
        </p>
      )}
    </motion.div>
  );
}
