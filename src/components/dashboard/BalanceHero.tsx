'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, Send, Download, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { QFSLogo } from './QFSLogo';
import { useWalletStore } from '@/store/wallet';
import { formatUsd } from '@/lib/wallet/core';

interface BalanceHeroProps {
  onAction?: (action: 'send' | 'receive' | 'swap' | 'stake') => void;
}

export function BalanceHero({ onAction }: BalanceHeroProps) {
  const hideBalances = useWalletStore((s) => s.hideBalances);
  const toggleHideBalances = useWalletStore((s) => s.toggleHideBalances);
  const totalAssets = 42_870_000;
  const totalChange = 12.4;

  const actions: Array<{
    id: 'send' | 'receive' | 'swap' | 'stake';
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    primary?: boolean;
  }> = [
    { id: 'send', label: 'Enviar', icon: Send, primary: true },
    { id: 'receive', label: 'Recibir', icon: Download },
    { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
    { id: 'stake', label: 'Stake', icon: TrendingUp },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="hero-gradient relative rounded-3xl overflow-hidden p-6 lg:p-8 mb-6"
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* QFS logo with orbit */}
        <div className="flex-shrink-0 order-1 md:order-1">
          <QFSLogo size={128} withGlow withOrbit />
        </div>

        {/* Balance + actions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-cyan-300/70 font-medium">
              Saldo Total
            </span>
            <button
              onClick={toggleHideBalances}
              className="p-1 rounded hover:bg-white/10 text-cyan-300/70 hover:text-cyan-300 transition-colors"
              aria-label={hideBalances ? 'Mostrar saldo' : 'Ocultar saldo'}
            >
              {hideBalances ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white tabular-nums"
            >
              {hideBalances ? '••••••••' : formatUsd(totalAssets, 2)}
            </motion.h1>
            <span
              className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
                totalChange >= 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}
            >
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center md:justify-start gap-6 mt-2">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  onClick={() => onAction?.(a.id)}
                  className="group flex flex-col items-center gap-2"
                  aria-label={a.label}
                >
                  <div className={`action-circle ${a.primary ? 'primary' : ''}`}>
                    <Icon size={22} className={a.primary ? 'text-[#0B1120]' : 'text-cyan-300'} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
