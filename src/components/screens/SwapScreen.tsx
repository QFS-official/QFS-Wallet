'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ChevronDown, Settings2, Zap, TrendingDown } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { TokenIcon } from '@/components/dashboard/TokenIcon';

export function SwapScreen() {
  const tokens = useWalletStore((s) => s.tokens);
  const addToast = useWalletStore((s) => s.addToast);
  const addTransaction = useWalletStore((s) => s.addTransaction);

  const [fromSymbol, setFromSymbol] = useState('QFS');
  const [toSymbol, setToSymbol] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const fromToken = tokens.find((t) => t.symbol === fromSymbol) || tokens[0];
  const toToken = tokens.find((t) => t.symbol === toSymbol) || tokens[1];

  // Simulated quote: use balance + price ratio
  const fromValue = parseFloat(fromAmount) || 0;
  const fromUsd = fromValue * (fromToken.valueUsd / parseFloat(fromToken.balance.replace(/,/g, '') || '1'));
  const toUnitUsd = toToken.valueUsd / parseFloat(toToken.balance.replace(/,/g, '') || '1') || 1;
  const toAmount = fromUsd / toUnitUsd * (1 - 0.003); // 0.3% fee
  const priceImpact = fromValue > 0 ? Math.min(Math.log(fromValue + 1) * 0.02, 5) : 0;
  const minReceived = toAmount * (1 - slippage / 100);
  const canSwap = fromValue > 0 && fromSymbol !== toSymbol && !swapping;

  const handleSwap = async () => {
    if (!canSwap) return;
    setSwapping(true);
    await new Promise((r) => setTimeout(r, 1500));
    addTransaction({
      id: 'tx-' + Date.now(),
      type: 'swap',
      status: 'confirmed',
      from: '',
      to: '',
      amount: fromValue.toLocaleString(),
      token: `${fromSymbol} → ${toSymbol}`,
      chain: 'Ethereum',
      timestamp: Date.now(),
      gasFee: '0.003',
    });
    addToast(`${fromValue} ${fromSymbol} → ${toAmount.toFixed(4)} ${toSymbol}`, 'success');
    setFromAmount('');
    setSwapping(false);
  };

  const flip = () => {
    const tmp = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(tmp);
  };

  return (
    <ScreenShell title="Swap" subtitle="Intercambia tokens al instante">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 max-w-5xl">
        <div className="glass-card rounded-2xl p-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Intercambiar</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              <Settings2 size={14} /> {slippage}%
            </button>
          </div>

          {/* Settings dropdown */}
          {showSettings && (
            <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xs text-muted-foreground mb-2">Tolerancia de Slippage</p>
              <div className="flex gap-2">
                {[0.1, 0.5, 1, 3].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSlippage(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      slippage === v
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/[0.04] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* From */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">De</span>
              <span className="text-xs text-muted-foreground">
                Saldo: {fromToken.balance}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                className="flex-1 bg-transparent text-2xl font-bold tabular-nums focus:outline-none placeholder:text-muted-foreground/50"
              />
              <button
                onClick={() => setShowFromPicker(!showFromPicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                <TokenIcon symbol={fromToken.symbol} size={24} color={fromToken.color} />
                <span className="text-sm font-semibold text-foreground">{fromToken.symbol}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            </div>
            {showFromPicker && (
              <div className="mt-2 rounded-xl bg-[#0B1120] border border-white/[0.06] overflow-hidden">
                {tokens.map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => { setFromSymbol(t.symbol); setShowFromPicker(false); }}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <TokenIcon symbol={t.symbol} size={28} color={t.color} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{t.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{t.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.balance}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-2.5 relative z-10">
            <button
              onClick={flip}
              className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:rotate-180 transition-all flex items-center justify-center"
              aria-label="Invertir"
            >
              <ArrowLeftRight size={16} className="text-cyan-400" />
            </button>
          </div>

          {/* To */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Para</span>
              <span className="text-xs text-muted-foreground">
                Saldo: {toToken.balance}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={fromValue > 0 ? toAmount.toFixed(6) : ''}
                placeholder="0.00"
                readOnly
                className="flex-1 bg-transparent text-2xl font-bold tabular-nums focus:outline-none placeholder:text-muted-foreground/50 text-foreground"
              />
              <button
                onClick={() => setShowToPicker(!showToPicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                <TokenIcon symbol={toToken.symbol} size={24} color={toToken.color} />
                <span className="text-sm font-semibold text-foreground">{toToken.symbol}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            </div>
            {showToPicker && (
              <div className="mt-2 rounded-xl bg-[#0B1120] border border-white/[0.06] overflow-hidden">
                {tokens.map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => { setToSymbol(t.symbol); setShowToPicker(false); }}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <TokenIcon symbol={t.symbol} size={28} color={t.color} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{t.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{t.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.balance}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSwap}
            disabled={!canSwap}
            className="w-full h-12 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {swapping ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                Procesando swap...
              </>
            ) : fromSymbol === toSymbol ? (
              'Selecciona tokens diferentes'
            ) : (
              <>
                <Zap size={16} /> Intercambiar
              </>
            )}
          </button>
        </div>

        {/* Right info */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Detalles del Swap</h3>
            <div className="space-y-3 text-xs">
              <Row label="Precio" value={fromValue > 0 ? `1 ${fromToken.symbol} ≈ ${(toAmount / fromValue).toFixed(4)} ${toToken.symbol}` : '—'} />
              <Row label="Impacto de precio" value={`${priceImpact.toFixed(2)}%`} danger={priceImpact > 1} />
              <Row label="Slippage" value={`${slippage}%`} />
              <Row label="Mín. recibido" value={fromValue > 0 ? `${minReceived.toFixed(4)} ${toToken.symbol}` : '—'} />
              <Row label="Comisión" value="0.3%" />
              <Row label="Gas estimado" value="~0.003 ETH" />
            </div>
          </div>

          {priceImpact > 1 && (
            <div className="glass-card rounded-2xl p-4 border-red-500/20 flex items-start gap-3">
              <TrendingDown size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Alto impacto de precio</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Considera reducir el monto o dividir en varias transacciones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right truncate ${danger ? 'text-red-400' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}
