'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Fingerprint, AlertTriangle, ArrowRight, Trash2, Eye, EyeOff } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { QFSLogo } from '@/components/dashboard/QFSLogo';
import { truncateAddress } from '@/lib/wallet/core';

export function UnlockScreen() {
  const address = useWalletStore((s) => s.address);
  const unlockWithPin = useWalletStore((s) => s.unlockWithPin);
  const biometricEnabled = useWalletStore((s) => s.biometricEnabled);
  const resetWallet = useWalletStore((s) => s.resetWallet);
  const addToast = useWalletStore((s) => s.addToast);
  const navigate = useWalletStore((s) => s.navigate);

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUnlock = async () => {
    setError(null);
    if (pin.length < 6) {
      setError('El PIN debe tener al menos 6 dígitos');
      return;
    }
    setUnlocking(true);
    const ok = await unlockWithPin(pin);
    setUnlocking(false);

    if (ok) {
      setAttempts(0);
      addToast('Billetera desbloqueada', 'success');
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(`PIN incorrecto. Intentos: ${next}${next >= 5 ? ' — considera restablecer' : ''}`);
      setPin('');
    }
  };

  // ─── Biometric shortcut ─────────────────────────────────────
  useEffect(() => {
    if (!biometricEnabled) return;
    // Simulate biometric prompt after 600ms (real WebAuthn integration is future work)
    const timer = setTimeout(() => {
      addToast('Autenticación biométrica lista (simulada)', 'info');
    }, 600);
    return () => clearTimeout(timer);
  }, [biometricEnabled, addToast]);

  const triggerBiometric = async () => {
    addToast('Simulando huella...', 'info');
    await new Promise((r) => setTimeout(r, 800));
    setPin('');
    setError(null);
    setAttempts(0);
    useWalletStore.setState({ isWalletLocked: false, currentScreen: 'dashboard' });
    addToast('Billetera desbloqueada vía biometría', 'success');
  };

  const handleReset = () => {
    resetWallet();
    addToast('Wallet eliminada — configura una nueva', 'info');
    navigate('create-wallet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <QFSLogo size={64} withGlow className="mb-4" />
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-cyan-400" />
            <h1 className="text-lg font-bold text-white">Billetera Bloqueada</h1>
          </div>
          {address && (
            <p className="text-xs text-muted-foreground font-mono">
              {truncateAddress(address, 6)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider text-center">
              Ingresa tu PIN para desbloquear
            </label>
            <div className="relative">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUnlock();
                }}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                placeholder="••••••"
                className="w-full h-14 px-4 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.06] text-2xl tracking-widest text-center focus:outline-none focus:border-cyan-500/40"
                autoFocus
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400"
                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center justify-center gap-1.5">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          <button
            onClick={handleUnlock}
            disabled={unlocking || pin.length < 6}
            className="w-full h-12 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {unlocking ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Lock size={16} /> Desbloquear
              </>
            )}
          </button>

          {biometricEnabled && (
            <button
              onClick={triggerBiometric}
              className="w-full h-11 rounded-xl qfs-btn-ghost flex items-center justify-center gap-2 text-sm"
            >
              <Fingerprint size={16} /> Usar biometría
            </button>
          )}

          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 size={11} /> ¿Olvidaste tu PIN? Restablecer
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl"
                style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.3)' }}
              >
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Restablecer billetera?</h3>
                <p className="text-xs text-muted-foreground">Esta acción es irreversible</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Se borrarán todos los datos locales: dirección, PIN, transacciones y configuraciones.
              Solo podrás recuperar tus fondos si tienes tu frase semilla guardada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-10 rounded-lg qfs-btn-ghost text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 h-10 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-sm font-semibold transition-colors"
              >
                Restablecer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
