'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Plus, Download, Eye, EyeOff, Copy, Check,
  AlertTriangle, ArrowRight, ArrowLeft, Sparkles, Wallet,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import {
  generateSeedPhrase,
  validateSeedPhrase,
  createEncryptedWallet,
} from '@/lib/wallet/core';
import { OnboardingLayout } from './OnboardingLayout';

type Step = 'welcome' | 'seed-show' | 'seed-confirm' | 'pin-set' | 'done';

export function CreateWalletScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const setWalletCreated = useWalletStore((s) => s.setWalletCreated);
  const storeSetPin = useWalletStore((s) => s.setPin);
  const addToast = useWalletStore((s) => s.addToast);

  const [step, setStep] = useState<Step>('welcome');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [maskedWords, setMaskedWords] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCreate = async () => {
    const seed = await generateSeedPhrase(128);
    setSeedPhrase(seed);
    setMaskedWords(seed.split(' ').map(() => '••••'));
    setRevealed(false);
    setStep('seed-show');
  };

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase);
      setCopied(true);
      addToast('Seed phrase copied — keep it safe', 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      addToast('Could not copy', 'error');
    }
  };

  const toggleReveal = () => {
    setRevealed(!revealed);
    setMaskedWords(
      revealed
        ? seedPhrase.split(' ').map(() => '••••')
        : seedPhrase.split(' ')
    );
  };

  const goToSeedConfirm = () => setStep('seed-confirm');

  const verifySeed = () => {
    setError(null);
    const trimmed = userInput.trim().toLowerCase();
    if (trimmed === seedPhrase.trim().toLowerCase()) {
      setStep('pin-set');
    } else {
      setError('Phrase does not match. Check word by word.');
    }
  };

  const createWallet = async () => {
    setError(null);
    if (pin.length < 6) {
      setError('PIN must be at least 6 digits');
      return;
    }
    if (pin !== pinConfirm) {
      setError('PINs do not match');
      return;
    }
    setCreating(true);
    try {
      const { address, encryptedPrivateKey } = await createEncryptedWallet(pin, seedPhrase);
      storeSetPin(pin);
      setWalletCreated(address, encryptedPrivateKey);
      addToast('Wallet created successfully!', 'success');
      setStep('done');
    } catch (err: any) {
      setError(err?.message || 'Error creating wallet');
    } finally {
      setCreating(false);
    }
  };

  // ─── Inner content per step ─────────────────────────────────
  const renderInner = () => {
    if (step === 'welcome') {
      return (
        <div className="space-y-3">
          <button
            onClick={startCreate}
            className="w-full h-12 rounded-xl premium-btn flex items-center justify-center gap-2 text-base"
          >
            <Plus size={18} /> Create New Wallet
          </button>
          <button
            onClick={() => navigate('import-wallet')}
            className="w-full h-12 rounded-xl premium-btn-ghost flex items-center justify-center gap-2 text-sm"
          >
            <Download size={18} /> Import Existing Wallet
          </button>
        </div>
      );
    }

    if (step === 'seed-show') {
      return (
        <div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              <strong className="text-amber-300">Important:</strong> This is your 12-word seed phrase.
              Write it down on paper and keep it offline. If you lose it, you lose access to your funds.
              <strong className="text-amber-300"> Never share it with anyone.</strong>
            </p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Your Seed Phrase</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleReveal}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 text-xs text-[#B0C4DE] hover:text-cyan-400"
              >
                {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                {revealed ? 'Hide' : 'Reveal'}
              </button>
              <button
                onClick={copySeed}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 text-xs text-[#B0C4DE] hover:text-cyan-400"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-xl bg-white/[0.03] border border-cyan-500/15">
            {(revealed ? seedPhrase.split(' ') : maskedWords).map((word, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.04] text-xs">
                <span className="text-[#B0C4DE]/60 tabular-nums">{i + 1}.</span>
                <span className={`text-white font-mono ${!revealed ? 'tracking-widest' : ''}`}>
                  {word}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('welcome')}
              className="flex items-center gap-1 px-4 h-11 rounded-xl premium-btn-ghost text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={goToSeedConfirm}
              className="flex-1 h-11 rounded-xl premium-btn flex items-center justify-center gap-2 text-sm"
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      );
    }

    if (step === 'seed-confirm') {
      return (
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Confirm your seed phrase</h3>
          <p className="text-xs text-[#B0C4DE] mb-4 leading-relaxed">
            Type the 12 words in exact order to verify you saved it correctly.
          </p>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="word1 word2 word3..."
            rows={4}
            className="w-full p-3 rounded-xl bg-white/[0.04] border border-cyan-500/20 text-sm font-mono focus:outline-none focus:border-cyan-500/50 resize-none mb-2"
          />

          {error && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep('seed-show')}
              className="flex items-center gap-1 px-4 h-11 rounded-xl premium-btn-ghost text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={verifySeed}
              disabled={!userInput.trim()}
              className="flex-1 h-11 rounded-xl premium-btn flex items-center justify-center gap-2 text-sm disabled:opacity-40"
            >
              Verify <ArrowRight size={14} />
            </button>
          </div>
        </div>
      );
    }

    if (step === 'pin-set') {
      return (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Lock size={18} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Set your PIN</h3>
              <p className="text-xs text-[#B0C4DE]">Used to unlock the app and sign transactions</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-[#B0C4DE] mb-1.5 block uppercase tracking-wider">
                PIN (min 6 digits)
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

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15 mb-4">
            <Shield size={12} className="text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-cyan-300/80 leading-relaxed">
              Your PIN encrypts your private key with AES-256-GCM (600,000 PBKDF2 iterations).
              We only store a hash of your PIN, never the plaintext.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('seed-confirm')}
              className="flex items-center gap-1 px-4 h-11 rounded-xl premium-btn-ghost text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={createWallet}
              disabled={creating || pin.length < 6 || pin !== pinConfirm}
              className="flex-1 h-11 rounded-xl premium-btn flex items-center justify-center gap-2 text-sm disabled:opacity-40"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#020B1A] border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Lock size={14} /> Create Wallet
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // step === 'done'
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
        >
          <Check size={28} className="text-emerald-400" />
        </motion.div>
        <h2 className="text-lg font-bold text-white mb-2">Wallet Created!</h2>
        <p className="text-xs text-[#B0C4DE] mb-5">
          Your wallet is ready. Keep your seed phrase in a safe place.
        </p>
        <button
          onClick={() => navigate('dashboard')}
          className="w-full h-12 rounded-xl premium-btn flex items-center justify-center gap-2 text-sm"
        >
          Go to my Wallet <ArrowRight size={14} />
        </button>
      </div>
    );
  };

  // Modal title per step
  const modalTitle =
    step === 'welcome' ? 'Welcome to your QFS Wallet'
    : step === 'seed-show' ? 'Save your Seed Phrase'
    : step === 'seed-confirm' ? 'Confirm Seed Phrase'
    : step === 'pin-set' ? 'Set your PIN'
    : 'Wallet Created';

  return (
    <OnboardingLayout modalTitle={modalTitle}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {renderInner()}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
