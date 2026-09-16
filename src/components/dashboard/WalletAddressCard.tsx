'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { truncateAddress } from '@/lib/wallet/core';
import { QRCodeSVG } from 'qrcode.react';

export function WalletAddressCard() {
  const address = useWalletStore((s) => s.address);
  const addToast = useWalletStore((s) => s.addToast);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      addToast('Dirección copiada al portapapeles', 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      addToast('No se pudo copiar', 'error');
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 mb-5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3">
        Dirección de tu Wallet
      </p>

      <div className="flex items-center justify-between gap-2 mb-3">
        <code className="text-sm font-mono text-foreground tabular-nums truncate">
          {truncateAddress(address, 6)}
        </code>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={copy}
            className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
            aria-label="Copiar dirección"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
            aria-label="Ver QR"
          >
            <QrCode size={14} />
          </button>
          <button
            onClick={() => addToast('Abriendo explorador...', 'info')}
            className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
            aria-label="Ver en explorador"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {showQR && (
        <div className="flex justify-center pt-2 pb-1 border-t border-white/[0.06] mt-3">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={address} size={140} level="M" />
          </div>
        </div>
      )}
    </div>
  );
}
