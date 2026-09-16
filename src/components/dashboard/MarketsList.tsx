'use client';

import { ChevronRight } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { TokenIcon } from './TokenIcon';
import { formatUsd } from '@/lib/wallet/core';

export function MarketsList() {
  const markets = useWalletStore((s) => s.markets);
  const addToast = useWalletStore((s) => s.addToast);

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Mercados</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Top Tokens
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {markets.map((m) => {
          const positive = m.change24h >= 0;
          return (
            <button
              key={m.symbol}
              onClick={() => addToast(`${m.name}: $${m.price.toLocaleString()} (${positive ? '+' : ''}${m.change24h.toFixed(2)}%)`, 'info')}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
            >
              <TokenIcon symbol={m.symbol} size={28} color={m.color} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{m.symbol}</p>
                <p className="text-[10px] text-muted-foreground truncate">{m.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground tabular-nums">
                  ${m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p
                  className={`text-[10px] font-semibold tabular-nums ${
                    positive ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {positive ? '+' : ''}
                  {m.change24h.toFixed(2)}%
                </p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/40" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
