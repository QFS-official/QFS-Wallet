'use client';

import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, TrendingUp, ChevronRight } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { shortTimeAgo } from '@/lib/wallet/core';
import type { TxType } from '@/types/wallet';

const ICONS: Record<TxType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; label: string }> = {
  receive: { icon: ArrowDownLeft, color: '#10B981', label: 'Recibido' },
  send: { icon: ArrowUpRight, color: '#F6465D', label: 'Enviado' },
  swap: { icon: ArrowLeftRight, color: '#3B82F6', label: 'Swap' },
  stake: { icon: TrendingUp, color: '#06B6D4', label: 'Stake' },
  unstake: { icon: TrendingUp, color: '#8B5CF6', label: 'Unstake' },
  claim: { icon: ArrowDownLeft, color: '#F59E0B', label: 'Claim' },
};

export function RecentTransactions() {
  const transactions = useWalletStore((s) => s.transactions);
  const addToast = useWalletStore((s) => s.addToast);

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Transacciones Recientes</h3>
        <button
          onClick={() => addToast('Cargando historial completo...', 'info')}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
        >
          Ver todas
          <ChevronRight size={10} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {transactions.slice(0, 5).map((tx) => {
          const config = ICONS[tx.type];
          const Icon = config.icon;
          const positive = tx.type === 'receive' || tx.type === 'claim';
          return (
            <button
              key={tx.id}
              onClick={() => addToast(`${config.label}: ${tx.amount} ${tx.token}`, 'info')}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: `${config.color}14`, border: `1px solid ${config.color}26` }}
              >
                <Icon size={14} color={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{config.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {tx.chain} · {shortTimeAgo(tx.timestamp)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-xs font-semibold tabular-nums ${
                    positive ? 'text-emerald-400' : 'text-foreground'
                  }`}
                >
                  {positive ? '+' : '-'}{tx.amount}
                </p>
                <p className="text-[10px] text-muted-foreground">{tx.token}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
