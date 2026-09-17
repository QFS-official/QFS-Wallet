'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Fingerprint, AlertTriangle, ArrowRight, Trash2, Eye, EyeOff, Unlock,
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

  return (
    <OnboardingLayout modalTitle="Unlock Wallet" modalSubtitle={address ? `Address: ${truncateAddress(address, 6)}` : undefined}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Lock size={20} className="text-cyan-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#B0C4DE] mb-1.5 block uppercase tracking-wider text-center">
              Enter your PIN to unlock
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
                className="w-full h-14 px-4 pr-12 rounded-xl bg-white/[0.04] border border-cyan-500/20 text-2xl tracking-widest text-center focus:outline-none focus:border-cyan-500/50"
                autoFocus
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/5 text-[#B0C4DE] hover:text-cyan-400"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
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
            className="w-full h-12 rounded-xl premium-btn flex items-center justify-center gap-2 disabled:opacity-40"
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

          {biometricEnabled && (
            <button
              onClick={triggerBiometric}
              className="w-full h-11 rounded-xl premium-btn-ghost flex items-center justify-center gap-2 text-sm"
            >
              <Fingerprint size={16} /> Use Biometrics
            </button>
          )}

          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-[#B0C4DE] hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 size={11} /> Forgot your PIN? <span className="text-gold-gradient font-semibold">Reset it</span>
            </button>
          </div>
        </div>
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
