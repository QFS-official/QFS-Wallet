'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle2, Fuel, ChevronDown } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { TokenIcon } from '@/components/dashboard/TokenIcon';

export function SendScreen() {
  const tokens = useWalletStore((s) => s.tokens);
  const address = useWalletStore((s) => s.address);
  const addToast = useWalletStore((s) => s.addToast);
  const addTransaction = useWalletStore((s) => s.addTransaction);

  const [selectedSymbol, setSelectedSymbol] = useState('QFS');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const selected = tokens.find((t) => t.symbol === selectedSymbol) || tokens[0];
  const parsedAmount = parseFloat(amount) || 0;
  const available = parseFloat(selected?.balance.replace(/,/g, '') || '0');
  const insufficient = parsedAmount > available;
  const gasFee = '0.0025 ETH';
  const canSend = recipient.length >= 42 && parsedAmount > 0 && !insufficient && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    // Simulate transaction broadcast
    await new Promise((r) => setTimeout(r, 1200));
    addTransaction({
      id: 'tx-' + Date.now(),
      type: 'send',
      status: 'confirmed',
      from: address,
      to: recipient,
      amount: parsedAmount.toLocaleString(),
      token: selected.symbol,
      chain: 'Ethereum',
      timestamp: Date.now(),
      gasFee,
    });
    addToast(`${parsedAmount} ${selected.symbol} enviados correctamente`, 'success');
    setRecipient('');
    setAmount('');
    setSending(false);
  };

  return (
    <ScreenShell
      title="Enviar"
      subtitle="Transfiere activos a otra dirección"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 space-y-5"
        >
          {/* Token selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Activo
            </label>
            <button
              onClick={() => setShowTokenPicker(!showTokenPicker)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TokenIcon symbol={selected.symbol} size={32} color={selected.color} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{selected.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">Saldo: {selected.balance}</p>
                </div>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {showTokenPicker && (
              <div className="mt-2 glass-card rounded-lg overflow-hidden">
                {tokens.map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => {
                      setSelectedSymbol(t.symbol);
                      setShowTokenPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors text-left ${
                      t.symbol === selectedSymbol ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <TokenIcon symbol={t.symbol} size={28} color={t.color} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{t.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{t.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{t.balance}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recipient */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Dirección del Destinatario
            </label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full h-12 px-4 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
            {recipient && recipient.length < 42 && (
              <p className="text-[11px] text-amber-400/80 mt-1.5 flex items-center gap-1">
                <AlertTriangle size={11} /> La dirección debe tener 42 caracteres
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Cantidad</label>
              <button
                onClick={() => setAmount(String(available))}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Máximo: {selected.balance}
              </button>
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              min="0"
              className={`w-full h-12 px-4 rounded-lg bg-white/[0.04] border text-2xl font-bold tabular-nums focus:outline-none transition-colors ${
                insufficient
                  ? 'border-red-500/50 text-red-400'
                  : 'border-white/[0.06] text-foreground focus:border-cyan-500/40'
              }`}
            />
            {insufficient && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle size={11} /> Saldo insuficiente
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full h-12 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} /> Enviar {parsedAmount > 0 ? `${parsedAmount} ${selected.symbol}` : ''}
              </>
            )}
          </button>
        </motion.div>

        {/* Right: transaction summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Fuel size={14} className="text-cyan-400" /> Resumen
            </h3>
            <div className="space-y-3 text-xs">
              <Row label="De" value={address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '—'} mono />
              <Row label="A" value={recipient ? `${recipient.slice(0, 8)}...${recipient.slice(-6)}` : '—'} mono />
              <Row label="Cantidad" value={amount ? `${amount} ${selected.symbol}` : '—'} />
              <Row label="Gas (estimado)" value={gasFee} />
              <Row
                label="Tiempo estimado"
                value="~30 segundos"
              />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Transacción Segura</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Todos los datos se procesan localmente. Tu clave privada nunca sale de tu dispositivo.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </ScreenShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-foreground text-right truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
