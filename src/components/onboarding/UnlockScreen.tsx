'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Fingerprint, AlertTriangle, Trash2, Eye, EyeOff, Unlock, Download,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { truncateAddress } from '@/lib/wallet/core';
import { OnboardingLayout } from './OnboardingLayout';

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
      setError('PIN must be at least 6 digits');
      return;
    }
    setUnlocking(true);
    const ok = await unlockWithPin(pin);
    setUnlocking(false);

    if (ok) {
      setAttempts(0);
      addToast('Wallet unlocked', 'success');
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(`Wrong PIN. Attempts: ${next}${next >= 5 ? ' — consider resetting' : ''}`);
      setPin('');
    }
  };

  useEffect(() => {
    if (!biometricEnabled) return;
    const timer = setTimeout(() => {
      addToast('Biometric authentication ready (simulated)', 'info');
    }, 600);
    return () => clearTimeout(timer);
  }, [biometricEnabled, addToast]);

  const triggerBiometric = async () => {
    addToast('Simulating fingerprint...', 'info');
    await new Promise((r) => setTimeout(r, 800));
    setPin('');
    setError(null);
    setAttempts(0);
    useWalletStore.setState({ isWalletLocked: false, currentScreen: 'dashboard' });
    addToast('Wallet unlocked via biometrics', 'success');
  };

  const handleReset = () => {
    resetWallet();
    addToast('Wallet reset — set up a new one', 'info');
    navigate('create-wallet');
  };

  // Render PIN dots (7 dots per reference)
  const maxDots = 8;
  const pinDots = Array.from({ length: maxDots }, (_, i) => i < pin.length);

  return (
    <OnboardingLayout
      modalTitle="Welcome to your QFS Wallet"
      modalSubtitle="Create a new wallet or import an existing one."
      onReset={() => setShowResetConfirm(true)}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ─── PIN input — pill-shaped with dots + eye icon ─── */}
        <div className="relative mb-3">
          <div
            className="flex items-center gap-1.5 h-14 px-4 rounded-full bg-[#020E1C]/80 border border-cyan-500/20"
            style={{ boxShadow: '0 0 0 1px rgba(0, 212, 255, 0.05) inset' }}
          >
            {/* PIN dots */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {pinDots.map((filled, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ scale: filled ? 1 : 0.7, opacity: filled ? 1 : 0.3 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background: filled ? '#00D4FF' : 'rgba(176, 196, 222, 0.3)',
                    boxShadow: filled ? '0 0 6px rgba(0, 212, 255, 0.4)' : 'none',
                  }}
                />
              ))}
            </div>
            {/* Eye toggle */}
            <button
              onClick={() => setShowPin(!showPin)}
              className="p-1 rounded-full hover:bg-white/5 text-[#B0C4DE]/60 hover:text-cyan-400 transition-colors shrink-0"
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Hidden actual input for mobile keyboard */}
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, maxDots))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUnlock();
            }}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            className="absolute inset-0 opacity-0 w-full h-full cursor-text"
            autoFocus
            aria-label="PIN input"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center justify-center gap-1.5 mb-3">
            <AlertTriangle size={12} /> {error}
          </p>
        )}

        {/* ─── Unlock Wallet button — gold→cyan gradient, pill shape ─── */}
        <button
          onClick={handleUnlock}
          disabled={unlocking || pin.length < 6}
          className="w-full h-12 rounded-full flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
            color: '#020B1A',
            boxShadow: '0 0 0 1px rgba(255, 215, 0, 0.3), 0 4px 20px rgba(0, 212, 255, 0.3)',
          }}
        >
          {unlocking ? (
            <>
              <div className="w-4 h-4 border-2 border-[#020B1A] border-t-transparent rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Unlock size={16} /> Unlock Wallet
            </>
          )}
        </button>

        {/* ─── Import Existing Wallet — ghost cyan border, pill shape ─── */}
        <button
          onClick={() => navigate('import-wallet')}
          className="w-full h-11 mt-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          style={{
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#B0C4DE',
          }}
        >
          <Download size={14} /> Import Existing Wallet
        </button>

        {/* Biometric option */}
        {biometricEnabled && (
          <button
            onClick={triggerBiometric}
            className="w-full h-11 mt-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-all"
            style={{
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              color: '#FFD700',
            }}
          >
            <Fingerprint size={16} /> Use Biometrics
          </button>
        )}
      </motion.div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-glass rounded-2xl p-6 w-full max-w-md"
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
                <h3 className="text-base font-bold text-white">Reset wallet?</h3>
                <p className="text-xs text-[#B0C4DE]">This action is irreversible</p>
              </div>
            </div>
            <p className="text-sm text-[#B0C4DE] mb-5 leading-relaxed">
              All local data will be deleted: address, PIN, transactions and settings.
              You can only recover your funds if you have your seed phrase saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-10 rounded-lg premium-btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 h-10 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-sm font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </OnboardingLayout>
  );
}
