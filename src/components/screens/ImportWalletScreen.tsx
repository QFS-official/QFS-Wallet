'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Lock, ArrowLeft, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { QFSLogo } from '@/components/dashboard/QFSLogo';
import {
  validateSeedPhrase,
  createEncryptedWallet,
} from '@/lib/wallet/core';

export function ImportWalletScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const setWalletCreated = useWalletStore((s) => s.setWalletCreated);
  const storeSetPin = useWalletStore((s) => s.setPin);
  const addToast = useWalletStore((s) => s.addToast);

  const [seedInput, setSeedInput] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);

    const trimmed = seedInput.trim().toLowerCase();
    const wordCount = trimmed.split(/\s+/).length;

    if (wordCount !== 12 && wordCount !== 24) {
      setError('La frase semilla debe tener 12 o 24 palabras');
      return;
    }
    if (!validateSeedPhrase(trimmed)) {
      setError('Frase semilla inválida. Verifica las palabras.');
      return;
    }
    if (pin.length < 6) {
      setError('El PIN debe tener al menos 6 dígitos');
      return;
    }
    if (pin !== pinConfirm) {
      setError('Los PINs no coinciden');
      return;
    }

    setImporting(true);
    try {
      const { address, encryptedPrivateKey } = await createEncryptedWallet(pin, trimmed);
      storeSetPin(pin);
      setWalletCreated(address, encryptedPrivateKey);
      addToast('¡Billetera importada!', 'success');
      navigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-10 w-full max-w-xl"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <QFSLogo size={72} withGlow className="mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Importar Billetera</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            Restaura con tu frase semilla
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-5">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300/90 leading-relaxed">
            Asegúrate de estar en un entorno privado. Nunca compartas tu frase semilla
            ni la ingreses en sitios no confiables.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Frase Semilla (12 o 24 palabras)
            </label>
            <textarea
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="palabra1 palabra2 palabra3..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-mono focus:outline-none focus:border-cyan-500/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                PIN (mín. 6)
              </label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                type="password"
                inputMode="numeric"
                placeholder="••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-lg tracking-widest focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                Confirmar PIN
              </label>
              <input
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                type="password"
                inputMode="numeric"
                placeholder="••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-lg tracking-widest focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('create-wallet')}
              className="flex items-center gap-1 px-4 h-11 rounded-xl qfs-btn-ghost text-sm"
            >
              <ArrowLeft size={14} /> Atrás
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !seedInput.trim() || pin.length < 6}
              className="flex-1 h-11 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-40"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Download size={14} /> Importar billetera
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
