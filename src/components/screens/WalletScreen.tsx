'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, EyeOff, Trash2, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { TokenIcon } from '@/components/dashboard/TokenIcon';
import { Sparkline } from '@/components/dashboard/Sparkline';
import { formatUsd } from '@/lib/wallet/core';

export function WalletScreen() {
  const tokens = useWalletStore((s) => s.tokens);
  const addToken = useWalletStore((s) => s.addToken);
  const removeToken = useWalletStore((s) => s.removeToken);
  const navigate = useWalletStore((s) => s.navigate);
  const hideBalances = useWalletStore((s) => s.hideBalances);
  const toggleHideBalances = useWalletStore((s) => s.toggleHideBalances);
  const addToast = useWalletStore((s) => s.addToast);

  const [showAdd, setShowAdd] = useState(false);
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customDecimals, setCustomDecimals] = useState('18');

  const totalValue = tokens.reduce((acc, t) => acc + t.valueUsd, 0);

  const handleAdd = () => {
    if (!customSymbol || !customAddress) {
      addToast('Símbolo y dirección son obligatorios', 'error');
      return;
    }
    addToken({
      symbol: customSymbol.toUpperCase(),
      name: customName || customSymbol.toUpperCase(),
      address: customAddress,
      decimals: parseInt(customDecimals) || 18,
      balance: '0.00',
      valueUsd: 0,
      change24h: 0,
      chainId: 1,
      color: '#06B6D4',
      sparkline: [],
    });
    addToast(`${customSymbol.toUpperCase()} añadido correctamente`, 'success');
    setCustomSymbol(''); setCustomName(''); setCustomAddress(''); setCustomDecimals('18');
    setShowAdd(false);
  };

  return (
    <ScreenShell
      title="Billetera"
      subtitle="Gestiona tus activos y tokens personalizados"
    >
      {/* Total balance summary */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Valor Total de la Billetera
          </span>
          <button
            onClick={toggleHideBalances}
            className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
            aria-label={hideBalances ? 'Mostrar' : 'Ocultar'}
          >
            {hideBalances ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-3xl font-extrabold text-white tabular-nums mb-1">
          {hideBalances ? '••••••••' : formatUsd(totalValue)}
        </p>
        <p className="text-xs text-muted-foreground">
          {tokens.length} activos · Mult cadena
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Enviar', icon: ArrowUpRight, screen: 'send' as const, color: '#06B6D4' },
          { label: 'Recibir', icon: ArrowDownRight, screen: 'receive' as const, color: '#10B981' },
          { label: 'Swap', icon: Plus, screen: 'swap' as const, color: '#3B82F6' },
          { label: 'Stake', icon: ArrowUpRight, screen: 'staking' as const, color: '#8B5CF6' },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={() => navigate(a.screen)}
              className="glass-card glass-card-hover rounded-xl p-4 flex flex-col items-center gap-2"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ background: `${a.color}14`, border: `1px solid ${a.color}26` }}
              >
                <Icon size={18} color={a.color} />
              </div>
              <span className="text-xs font-semibold text-foreground">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tokens header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white">Mis Tokens</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-xs font-semibold"
        >
          <Plus size={14} /> Añadir Token
        </button>
      </div>

      {/* Tokens list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {tokens.map((t, i) => {
          const positive = t.change24h >= 0;
          return (
            <motion.div
              key={t.address + t.symbol}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="group flex items-center gap-3 p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => addToast(`Seleccionando ${t.symbol}...`, 'info')}
            >
              <TokenIcon symbol={t.symbol} size={40} color={t.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t.symbol}</p>
                <p className="text-[11px] text-muted-foreground truncate">{t.name}</p>
              </div>
              <div className="hidden sm:block">
                <Sparkline
                  data={t.sparkline || []}
                  color={positive ? '#10B981' : '#F6465D'}
                  width={60}
                  height={24}
                />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {hideBalances ? '••••' : t.balance}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {hideBalances ? '••••' : formatUsd(t.valueUsd)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToken(t.address);
                  addToast(`${t.symbol} eliminado`, 'info');
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                aria-label="Eliminar token"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Add token modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Añadir Token Personalizado</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Dirección del Contrato *</label>
                <input
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Símbolo *</label>
                  <input
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    placeholder="TOKEN"
                    className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Decimales</label>
                  <input
                    value={customDecimals}
                    onChange={(e) => setCustomDecimals(e.target.value)}
                    placeholder="18"
                    className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Nombre (opcional)</label>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Mi Token"
                  className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full h-11 rounded-xl qfs-btn-primary text-sm"
              >
                Añadir Token
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </ScreenShell>
  );
}
