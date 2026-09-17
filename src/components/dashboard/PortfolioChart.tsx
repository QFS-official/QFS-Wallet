'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { usePortfolioHistory } from '@/hooks/use-portfolio-history';
import type { OnChainBalance } from '@/lib/wallet/onchain';
import { formatUsd } from '@/lib/wallet/prices';

interface PortfolioChartProps {
  balances: OnChainBalance[];
}

const TIMEFRAMES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1A', days: 365 },
];

function formatDate(ts: number, days: number): string {
  const d = new Date(ts);
  if (days <= 7) {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  if (days <= 90) {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

// Custom tooltip for the chart — moved outside the component to satisfy
// react-hooks/static-components lint rule.
function CustomTooltip({ active, payload, selectedDays }: any) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-0.5">{formatDate(point.ts, selectedDays)}</p>
      <p className="font-bold text-foreground tabular-nums">{formatUsd(point.value)}</p>
    </div>
  );
}

export function PortfolioChart({ balances }: PortfolioChartProps) {
  const [selectedDays, setSelectedDays] = useState(30);
  const { data, loading, error, totalNow, totalThen, changePct, changeAbs, high, low } =
    usePortfolioHistory(balances, selectedDays);

  const positive = changePct >= 0;

  // Convert to Recharts format
  const chartData = useMemo(
    () => data.map((p) => ({ ts: p.timestamp, value: p.value })),
    [data]
  );

  // Determine if we have any non-zero balance to display
  const hasBalance = balances.some((b) => b.balanceRaw > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-5 mb-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
            <Activity size={14} className="text-cyan-400" />
            Portfolio Histórico
          </h3>
          <div className="flex items-baseline gap-2">
            {loading && data.length === 0 ? (
              <div className="w-24 h-7 rounded-md bg-white/[0.04] animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white tabular-nums">
                {formatUsd(totalNow)}
              </p>
            )}
            {data.length > 0 && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                  positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                }`}
              >
                {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {positive ? '+' : ''}{changePct.toFixed(2)}%
              </span>
            )}
          </div>
          {data.length > 0 && (
            <p className={`text-[11px] mt-0.5 tabular-nums ${positive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {positive ? '+' : ''}{formatUsd(changeAbs)} en {selectedDays} días
            </p>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedDays(tf.days)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                selectedDays === tf.days
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Error: {error}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Activity size={20} className="text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              {hasBalance
                ? 'Cargando datos históricos...'
                : 'Recibe tokens para ver tu portfolio histórico'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={positive ? '#10B981' : '#F6465D'} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={positive ? '#10B981' : '#F6465D'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="ts"
                tickFormatter={(ts) => formatDate(ts, selectedDays)}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(v) => formatUsd(v)}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={50}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip selectedDays={selectedDays} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={positive ? '#10B981' : '#F6465D'}
                strokeWidth={2}
                fill="url(#portfolioGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats footer */}
      {data.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Mínimo:</span>
            <span className="text-red-400/80 tabular-nums font-semibold">{formatUsd(low)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Máximo:</span>
            <span className="text-emerald-400/80 tabular-nums font-semibold">{formatUsd(high)}</span>
          </div>
          <div className="text-[10px] text-muted-foreground/50">
            CoinGecko · {selectedDays}d
          </div>
        </div>
      )}
    </motion.div>
  );
}
