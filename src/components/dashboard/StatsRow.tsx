'use client';

import { motion } from 'framer-motion';
import { Wallet, Droplets, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface StatsRowProps {
  totalAssets: number;
  totalAssetsChange: number;
  liquidityPool: number;
  liquidityPoolChange: number;
  apy: number;
}

export function StatsRow({
  totalAssets,
  totalAssetsChange,
  liquidityPool,
  liquidityPoolChange,
  apy,
}: StatsRowProps) {
  const cards = [
    {
      label: 'Total en Activos',
      value: `$${(totalAssets / 1_000_000).toFixed(2)}M`,
      change: totalAssetsChange,
      icon: Wallet,
      color: '#06B6D4',
      spark: [12.4, 14.1, 13.7, 15.2, 16.8, 18.5, 19.2, 21.4, 23.1, 24.6, 26.8, 28.4, 30.1, 32.5, 34.8, 36.2, 38.9, 40.5, 41.2, 42.8],
    },
    {
      label: 'Pool de Liquidez',
      value: `$${(liquidityPool / 1_000_000).toFixed(2)}M`,
      change: liquidityPoolChange,
      icon: Droplets,
      color: '#3B82F6',
      spark: [12.1, 12.8, 13.5, 14.2, 13.9, 14.8, 15.5, 16.1, 16.9, 17.2, 17.8, 18.4, 18.0, 18.2, 18.45],
    },
    {
      label: 'Rendimiento (APY)',
      value: `${apy.toFixed(1)}%`,
      change: 2.3,
      icon: TrendingUp,
      color: '#10B981',
      spark: [8.1, 8.4, 8.7, 9.2, 9.5, 10.1, 10.6, 11.2, 11.5, 11.8, 12.1, 12.3, 12.4, 12.5, 12.6],
      isApy: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
            className="glass-card glass-card-hover rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{
                  background: `${c.color}14`,
                  border: `1px solid ${c.color}26`,
                }}
              >
                <Icon size={16} style={{ color: c.color }} />
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  c.change >= 0
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-red-400 bg-red-500/10'
                }`}
              >
                <ArrowUpRight size={10} className="inline mr-0.5" />
                {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
              {c.label}
            </p>
            <div className="flex items-end justify-between gap-2">
              <p className="text-2xl font-bold text-white tabular-nums">{c.value}</p>
              <Sparkline
                data={c.spark}
                color={c.change >= 0 ? '#10B981' : '#F6465D'}
                width={80}
                height={28}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
