'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useWalletStore } from '@/store/wallet';
import { formatUsd } from '@/lib/wallet/core';

const PALETTE = ['#06B6D4', '#26A17B', '#2775CA', '#627EEA', '#F3BA2F', '#8B5CF6'];

export function PortfolioDonut() {
  const tokens = useWalletStore((s) => s.tokens);

  const total = tokens.reduce((acc, t) => acc + t.valueUsd, 0);
  const data = tokens
    .filter((t) => t.valueUsd > 0)
    .map((t) => ({
      name: t.symbol,
      value: t.valueUsd,
      color: t.color || PALETTE[tokens.indexOf(t) % PALETTE.length],
    }));

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Balance por Moneda</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {tokens.length} activos
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative" style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v: number, name: string) => [formatUsd(v), name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
            <span className="text-sm font-bold text-white tabular-nums">{formatUsd(total)}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: d.color, boxShadow: `0 0 6px ${d.color}55` }}
              />
              <span className="text-muted-foreground font-medium">{d.name}</span>
              <span className="ml-auto text-foreground tabular-nums font-semibold">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
