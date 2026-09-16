'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { Sparkline } from './Sparkline';
import { useWalletStore } from '@/store/wallet';
import type { Token } from '@/types/wallet';
import { formatUsd } from '@/lib/wallet/core';

export function AssetsTable({ onSelectToken }: { onSelectToken?: (t: Token) => void }) {
  const tokens = useWalletStore((s) => s.tokens);
  const hideBalances = useWalletStore((s) => s.hideBalances);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="glass-card rounded-2xl p-5 lg:p-6 mb-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Mis Activos</h2>
        <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
          Ver todos
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Column header (desktop only) */}
      <div className="hidden md:grid asset-row text-[11px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.04] mb-1 cursor-default hover:bg-transparent">
        <div>Activo</div>
        <div className="text-right">Cantidad</div>
        <div className="text-right">Valor (USD)</div>
        <div className="text-right">24h</div>
        <div className="text-right pr-2">Chart</div>
      </div>

      {/* Token rows */}
      <div className="flex flex-col">
        {tokens.map((t, i) => {
          const positive = t.change24h >= 0;
          return (
            <motion.div
              key={t.address + t.symbol}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.04, duration: 0.25 }}
              onClick={() => onSelectToken?.(t)}
              className="asset-row group"
            >
              {/* Activo */}
              <div className="flex items-center gap-3 min-w-0">
                <TokenIcon symbol={t.symbol} size={36} color={t.color} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.symbol}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.name}</p>
                </div>
              </div>

              {/* Cantidad */}
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {hideBalances ? '••••' : t.balance}
                </p>
                <p className="text-[11px] text-muted-foreground md:hidden">
                  {hideBalances ? '••••' : formatUsd(t.valueUsd)}
                </p>
              </div>

              {/* Valor USD (desktop only) */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {hideBalances ? '••••' : formatUsd(t.valueUsd)}
                </p>
              </div>

              {/* 24h change */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                    positive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-red-400 bg-red-500/10'
                  }`}
                >
                  {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(t.change24h).toFixed(2)}%
                </span>
              </div>

              {/* Sparkline */}
              <div className="hidden md:flex justify-end pr-1">
                <Sparkline
                  data={t.sparkline || []}
                  color={positive ? '#10B981' : '#F6465D'}
                  width={70}
                  height={26}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
