'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Plus, Download, Eye, EyeOff, Copy, Check,
  AlertTriangle, ArrowRight, ArrowLeft, Sparkles,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { QFSLogo } from '@/components/dashboard/QFSLogo';
import {
  generateSeedPhrase,
  validateSeedPhrase,
  createEncryptedWallet,
} from '@/lib/wallet/core';

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

  // ─── Step: Welcome ──────────────────────────────────────────
  const startCreate = async () => {
    const seed = await generateSeedPhrase(128); // 12 words
    setSeedPhrase(seed);
    setMaskedWords(seed.split(' ').map(() => '••••'));
    setRevealed(false);
    setStep('seed-show');
  };

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase);
      setCopied(true);
      addToast('Frase semilla copiada — guárdala en un lugar seguro', 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      addToast('No se pudo copiar', 'error');
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

  // ─── Step: Seed confirm ─────────────────────────────────────
  const goToSeedConfirm = () => setStep('seed-confirm');

  const verifySeed = () => {
    setError(null);
    const trimmed = userInput.trim().toLowerCase();
    if (trimmed === seedPhrase.trim().toLowerCase()) {
      setStep('pin-set');
    } else {
      setError('La frase no coincide. Revísala palabra por palabra.');
    }
  };

  // ─── Step: PIN set ──────────────────────────────────────────
  const createWallet = async () => {
    setError(null);
    if (pin.length < 6) {
      setError('El PIN debe tener al menos 6 dígitos');
      return;
    }
    if (pin !== pinConfirm) {
      setError('Los PINs no coinciden');
      return;
    }
    setCreating(true);
    try {
      // Encrypt the private key with the PIN (AES-256-GCM via PBKDF2)
      const { address, encryptedPrivateKey } = await createEncryptedWallet(pin, seedPhrase);
      // Save the PIN hash for unlock verification
      storeSetPin(pin);
      // Save the wallet to the store
      setWalletCreated(address, encryptedPrivateKey);
      addToast('¡Billetera creada con éxito!', 'success');
      setStep('done');
    } catch (err: any) {
      setError(err?.message || 'Error al crear la billetera');
    } finally {
      setCreating(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-10 w-full max-w-xl"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <QFSLogo size={72} withGlow className="mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">QFS Wallet</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            Quantum Financial System
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <Sparkles size={32} className="mx-auto mb-4 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white mb-3">
                Bienvenido a tu Billetera QFS
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Crea una nueva billetera no-custodial o importa una existente.
                Tus claves privadas nunca salen de tu dispositivo.
              </p>
              <button
                onClick={startCreate}
                className="w-full h-12 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 mb-3"
              >
                <Plus size={18} /> Crear nueva billetera
              </button>
              <button
                onClick={() => navigate('import-wallet')}
                className="w-full h-12 rounded-xl qfs-btn-ghost flex items-center justify-center gap-2"
              >
                <Download size={18} /> Importar billetera existente
              </button>
            </motion.div>
          )}

          {step === 'seed-show' && (
            <motion.div
              key="seed-show"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-5">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  <strong className="text-amber-300">¡Importante!</strong> Esta es tu frase semilla de 12 palabras.
                  Escríbala en papel y guárdala offline. Si la pierdes, perderás acceso a tus fondos.
                  <strong className="text-amber-300"> Nunca la compartas con nadie.</strong>
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">Tu Frase Semilla</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleReveal}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 text-xs text-muted-foreground hover:text-cyan-400"
                  >
                    {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                    {revealed ? 'Ocultar' : 'Revelar'}
                  </button>
                  <button
                    onClick={copySeed}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 text-xs text-muted-foreground hover:text-cyan-400"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {(revealed ? seedPhrase.split(' ') : maskedWords).map((word, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-white/[0.04] text-xs">
                    <span className="text-muted-foreground/60 tabular-nums">{i + 1}.</span>
                    <span className={`text-foreground font-mono ${!revealed ? 'tracking-widest' : ''}`}>
                      {word}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('welcome')}
                  className="flex items-center gap-1 px-4 h-11 rounded-xl qfs-btn-ghost text-sm"
                >
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={goToSeedConfirm}
                  className="flex-1 h-11 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  Continuar <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'seed-confirm' && (
            <motion.div
              key="seed-confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-base font-semibold text-white mb-2">
                Confirma tu frase semilla
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Escribe las 12 palabras en el orden exacto para verificar que la guardaste correctamente.
              </p>

              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="palabra1 palabra2 palabra3..."
                rows={4}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-mono focus:outline-none focus:border-cyan-500/40 resize-none"
              />

              {error && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> {error}
                </p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setStep('seed-show')}
                  className="flex items-center gap-1 px-4 h-11 rounded-xl qfs-btn-ghost text-sm"
                >
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={verifySeed}
                  disabled={!userInput.trim()}
                  className="flex-1 h-11 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                >
                  Verificar <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'pin-set' && (
            <motion.div
              key="pin-set"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Lock size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Establece tu PIN</h3>
                  <p className="text-xs text-muted-foreground">
                    Se usará para desbloquear la app y firmar transacciones
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
                    PIN (mín. 6 dígitos)
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

              <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15 mb-5">
                <Shield size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                  El PIN cifra tu clave privada con AES-256-GCM (600,000 iteraciones PBKDF2).
                  No se almacena en texto plano — solo su hash.
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
                  className="flex items-center gap-1 px-4 h-11 rounded-xl qfs-btn-ghost text-sm"
                >
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={createWallet}
                  disabled={creating || pin.length < 6 || pin !== pinConfirm}
                  className="flex-1 h-11 rounded-xl qfs-btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Lock size={14} /> Crear billetera
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Billetera creada!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tu billetera está lista para usar. Guarda tu frase semilla en un lugar seguro.
              </p>
              <button
                onClick={() => navigate('dashboard')}
                className="w-full h-12 rounded-xl qfs-btn-primary flex items-center justify-center gap-2"
              >
                Ir a mi billetera <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
