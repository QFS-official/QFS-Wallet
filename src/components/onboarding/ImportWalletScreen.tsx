'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Lock, ArrowLeft, AlertTriangle,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import {
  validateSeedPhrase,
  createEncryptedWallet,
} from '@/lib/wallet/core';
import { OnboardingLayout } from './OnboardingLayout';

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
      setError('Seed phrase must have 12 or 24 words');
      return;
    }
    if (!validateSeedPhrase(trimmed)) {
      setError('Invalid seed phrase. Verify the words.');
      return;
    }
    if (pin.length < 6) {
      setError('PIN must be at least 6 digits');
      return;
    }
    if (pin !== pinConfirm) {
      setError('PINs do not match');
      return;
    }

    setImporting(true);
    try {
      const { address, encryptedPrivateKey } = await createEncryptedWallet(pin, trimmed);
      storeSetPin(pin);
      setWalletCreated(address, encryptedPrivateKey);
      addToast('Wallet imported!', 'success');
      navigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Error importing');
    } finally {
      setImporting(false);
    }
  };

  return (
    <OnboardingLayout modalTitle="Import Wallet" modalSubtitle="Restore from your seed phrase">
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-300/90 leading-relaxed">
            Make sure you are in a private environment. Never share your seed phrase
            or enter it on untrusted sites.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#B0C4DE] mb-1.5 block uppercase tracking-wider">
              Seed Phrase (12 or 24 words)
            </label>
            <textarea
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="word1 word2 word3..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white/[0.04] border border-cyan-500/20 text-sm font-mono focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#B0C4DE] mb-1.5 block uppercase tracking-wider">
                PIN (min 6)
              </label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                type="password"
                inputMode="numeric"
                placeholder="••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-cyan-500/20 text-lg tracking-widest focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-[#B0C4DE] mb-1.5 block uppercase tracking-wider">
                Confirm PIN
              </label>
              <input
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                type="password"
                inputMode="numeric"
                placeholder="••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-cyan-500/20 text-lg tracking-widest focus:outline-none focus:border-cyan-500/50"
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
              className="flex items-center gap-1 px-4 h-11 rounded-xl premium-btn-ghost text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !seedInput.trim() || pin.length < 6}
              className="flex-1 h-11 rounded-xl premium-btn flex items-center justify-center gap-2 text-sm disabled:opacity-40"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#020B1A] border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download size={14} /> Import Wallet
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
