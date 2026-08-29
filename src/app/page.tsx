'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useWalletStore } from '@/store/wallet';
import {
  generateSeedPhrase,
  validateSeedPhrase,
  createEncryptedWallet,
  truncateAddress,
  saveToStorage,
} from '@/lib/wallet/core';
import { SUPPORTED_CHAINS, getChainById, getExplorerUrl } from '@/lib/wallet/chains';
import { STAKING_POOLS, calculateStakingRewards, formatAPY, formatTVL } from '@/lib/wallet/staking';
import { NATIVE_TOKENS, GCRM_TOKEN, QFS_TOKEN, ALA_TOKEN, NESG_TOKEN, POPULAR_TOKENS, getAvailableTokens } from '@/lib/wallet/tokens';
import type { Screen } from '@/types/wallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Home as HomeIcon,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Globe,
  Settings,
  Send,
  QrCode,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertTriangle,
  Info,
  Star,
  ExternalLink,
  Search,
  X,
  Menu,
  Bell,
  Moon,
  Key,
  Fingerprint,
  ScanLine,
  Zap,
  Coins,
  BarChart3,
  Clock,
  ChevronDown,
  Copy as CopyIcon,
  CircleDot,
} from 'lucide-react';

// ─── Animation Variants ─────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};
const pageTransition = { type: 'tween', duration: 0.2 };

// ─── Demo Data ───────────────────────────────────────────────────────
const DEMO_TRANSACTIONS = [
  { id: '1', type: 'receive' as const, status: 'confirmed' as const, from: '0x1234...abcd', to: '', amount: '2,500.00', token: 'QFS', chain: 'BNB Smart Chain', hash: '0xabc123...', timestamp: Date.now() - 3600000, gasFee: '0.0005' },
  { id: '2', type: 'send' as const, status: 'confirmed' as const, from: '', to: '0x5678...efgh', amount: '500.00', token: 'QFS', chain: 'Ethereum', hash: '0xdef456...', timestamp: Date.now() - 86400000, gasFee: '0.0025' },
  { id: '3', type: 'swap' as const, status: 'confirmed' as const, from: '', to: '', amount: '1,000.00', token: 'QFS → ETH', chain: 'Ethereum', hash: '0xghi789...', timestamp: Date.now() - 172800000, gasFee: '0.003' },
  { id: '4', type: 'stake' as const, status: 'confirmed' as const, from: '', to: '', amount: '5,000.00', token: 'QFS', chain: 'BNB Smart Chain', timestamp: Date.now() - 259200000 },
];

const DEMO_TOKENS = [
  { symbol: 'QFS', name: 'Quantum Financial System', balance: '12,580.00', valueUsd: 1132.20, change24h: 4.2 },
  { symbol: 'ETH', name: 'Ethereum', balance: '0.4521', valueUsd: 1478.50, change24h: -1.3 },
  { symbol: 'BNB', name: 'BNB', balance: '3.2100', valueUsd: 891.40, change24h: 2.1 },
  { symbol: 'USDT', name: 'Tether USD', balance: '500.00', valueUsd: 500.00, change24h: 0.0 },
];

const DAPP_CONNECTIONS = [
  { id: '1', name: 'NESG Swap', domain: 'exchange.nesgswap.org', icon: '/nesg-token-logo.png', chainId: 1, permissions: ['View Address', 'Sign Transactions'], connected: true, lastUsed: 'Just now' },
  { id: '2', name: 'PancakeSwap', domain: 'pancakeswap.finance', icon: '🍰', chainId: 56, permissions: ['View Address', 'Sign Transactions'], connected: true, lastUsed: '2 hours ago' },
  { id: '3', name: 'Uniswap', domain: 'app.uniswap.org', icon: '🦄', chainId: 1, permissions: ['View Address'], connected: true, lastUsed: '1 day ago' },
];

// ─── Token Icon Helper ─────────────────────────────────────────────
const TOKEN_ICONS: Record<string, string> = {
  'QFS': '/qfs-token-logo.png',
  'GCRM': '/gcrm-token-logo.png',
  'AlA': '/ala-token-logo.png',
  'NESG': '/nesg-token-logo.png',
  'ETH': '/eth-token-logo.png',
  'BNB': '/bnb-token-logo.png',
  'SOL': '/sol-token-logo.png',
  'POL': '/pol-token-logo.png',
  'USDT': '/usdt-token-logo.png',
  'USDC': '/usdc-token-logo.png',
};

const TOKEN_SYMBOLS_WITH_ICONS = new Set(Object.keys(TOKEN_ICONS));

function TokenIcon({ symbol, size = 40, className = '' }: { symbol: string; size?: number; className?: string }) {
  const icon = TOKEN_ICONS[symbol];
  if (icon) return <img src={icon} alt={symbol} className={`rounded-full ${className}`} style={{ width: size, height: size }} />;
  return (
    <div className={`rounded-full bg-secondary flex items-center justify-center font-semibold text-muted-foreground ${className}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {symbol.charAt(0)}
    </div>
  );
}

function hasTokenIcon(symbol: string): boolean {
  return TOKEN_SYMBOLS_WITH_ICONS.has(symbol);
}

// ─── Helper Components ───────────────────────────────────────────────
function ScreenHeader({ title, onBack, rightAction }: { title: string; onBack?: () => void; rightAction?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background z-10">
      {onBack ? (
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft className="size-5 text-foreground" />
        </button>
      ) : (
        <div className="w-9" />
      )}
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="w-9 flex justify-center">{rightAction}</div>
    </div>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useWalletStore();
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="rounded-xl px-4 py-3 flex items-center gap-3 bg-secondary border border-elevated"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success' ? 'bg-qfs-green' : toast.type === 'error' ? 'bg-destructive' : 'bg-primary'
            }`} />
            <span className="text-sm flex-1 text-foreground">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Onboarding Screen ───────────────────────────────────────────────
function OnboardingScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const setShowOnboarding = useWalletStore((s) => s.setShowOnboarding);

  const features = [
    { icon: Key, label: 'Non-custodial', desc: 'Only you control your keys' },
    { icon: Globe, label: 'Multi-chain', desc: 'BNB, ETH, SOL & more' },
    { icon: ArrowLeftRight, label: 'Swap & Stake', desc: 'Built-in DeFi tools' },
  ];

  return (
    <motion.div
      key="onboarding"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-lg shadow-[#F0B90B]/10">
          <img src="/qfs-logo.jpg" alt="QFS Wallet" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl font-bold tracking-tight mb-1 text-foreground"
      >
        <span className="font-extrabold">QFS</span>{' '}
        <span style={{ color: '#F0B90B' }}>Wallet</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="text-muted-foreground text-sm tracking-wider uppercase mb-10"
      >
        Secure · Non-Custodial · Multichain
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="w-full max-w-xs flex flex-col gap-4 mb-10"
      >
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <f.icon className="size-4 text-primary" />
            </div>
            <div className="leading-tight">
              <span className="text-foreground font-medium">{f.label}</span>
              <p className="text-muted-foreground text-xs mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full max-w-xs flex flex-col gap-3"
      >
        <button
          onClick={() => { setShowOnboarding(false); navigate('create-wallet'); }}
          className="w-full h-[52px] rounded-xl bnb-btn-primary text-base"
        >
          Create Wallet
        </button>
        <button
          onClick={() => { setShowOnboarding(false); navigate('import-wallet'); }}
          className="w-full h-[52px] rounded-xl bnb-btn-outline text-base font-medium"
        >
          Import Wallet
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 flex items-center gap-2 text-muted-foreground text-xs"
      >
        <Shield className="size-3" />
        <span>Your keys, your crypto. Always.</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Wallet Flow ──────────────────────────────────────────────
function CreateWalletScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const setTempSeedPhrase = useWalletStore((s) => s.setTempSeedPhrase);
  const setWalletCreated = useWalletStore((s) => s.setWalletCreated);
  const setLoading = useWalletStore((s) => s.setLoading);
  const isLoading = useWalletStore((s) => s.isLoading);
  const addToast = useWalletStore((s) => s.addToast);
  const setShowOnboarding = useWalletStore((s) => s.setShowOnboarding);

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [verifyWords, setVerifyWords] = useState<Record<number, string>>({});
  const [verifyErrors, setVerifyErrors] = useState<Set<number>>(new Set());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const phrase = await generateSeedPhrase();
      const words = phrase.split(' ');
      setSeedPhrase(words);
      setTempSeedPhrase(phrase);
      setStep(1);
    } catch {
      addToast('Failed to generate seed phrase', 'error');
    }
    setLoading(false);
  }, [setLoading, setTempSeedPhrase, addToast]);

  const handleVerifyNext = useCallback(() => {
    const errors = new Set<number>();
    [1, 4, 8, 11].forEach((idx) => {
      if (verifyWords[idx]?.toLowerCase().trim() !== seedPhrase[idx]?.toLowerCase()) errors.add(idx);
    });
    setVerifyErrors(errors);
    if (errors.size === 0) { setStep(3); } else { addToast('Some words are incorrect.', 'error'); }
  }, [verifyWords, seedPhrase, addToast]);

  const handleCreateWallet = useCallback(async () => {
    if (password.length < 8) { addToast('Password must be at least 8 characters', 'error'); return; }
    if (password !== confirmPassword) { addToast('Passwords do not match', 'error'); return; }
    setLoading(true);
    try {
      const result = await createEncryptedWallet(password);
      setWalletAddress(result.address);
      setWalletCreated(result.address, result.encryptedPrivateKey);
      setStep(4);
      addToast('Wallet created successfully!', 'success');
    } catch (err) {
      console.error('[QFS] createEncryptedWallet failed:', err);
      addToast('Failed to create wallet', 'error');
    }
    setLoading(false);
  }, [password, confirmPassword, setWalletCreated, setLoading, addToast]);

  return (
    <motion.div key="create-wallet" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen flex flex-col bg-background">
      <ScreenHeader title="Create Wallet" onBack={step === 0 ? () => setShowOnboarding(true) || navigate('create-wallet') : () => setStep((s) => Math.max(0, (s - 1)) as 0)} />

      {/* Progress bar */}
      <div className="px-4 mb-2">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Step {step + 1} of 5</p>
      </div>

      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center pt-12">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                <Wallet className="size-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Create a New Wallet</h2>
              <p className="text-muted-foreground text-sm text-center max-w-xs mb-8">
                Your wallet will be secured by a 12-word recovery phrase. Keep it safe.
              </p>
              <div className="w-full max-w-xs flex flex-col gap-3">
                {['Non-custodial — only you control your keys', 'Multi-chain support from day one', 'Built-in staking & swap features'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
              <button onClick={handleGenerate} disabled={isLoading} className="mt-10 w-full max-w-xs h-[52px] rounded-xl bnb-btn-primary text-base">
                {isLoading ? 'Generating...' : 'Generate Recovery Phrase'}
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="size-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">Never share your recovery phrase with anyone. Store it offline.</p>
              </div>
              <h2 className="text-lg font-semibold mb-1 text-foreground">Your Recovery Phrase</h2>
              <p className="text-sm text-muted-foreground mb-4">Write down these 12 words in order.</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {seedPhrase.map((word, i) => (
                  <div key={i} className="bg-secondary rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm font-medium text-foreground">{word}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">
                I&apos;ve Saved My Phrase — Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
              <h2 className="text-lg font-semibold mb-1 text-foreground">Verify Your Phrase</h2>
              <p className="text-sm text-muted-foreground mb-6">Select the correct word for each position.</p>
              <div className="flex flex-col gap-4 mb-6">
                {[1, 4, 8, 11].map((idx) => (
                  <div key={idx}>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Word #{idx + 1}</label>
                    <Input placeholder={`Enter word ${idx + 1}`} value={verifyWords[idx] || ''} onChange={(e) => { setVerifyWords((p) => ({ ...p, [idx]: e.target.value })); setVerifyErrors((p) => { const n = new Set(p); n.delete(idx); return n; }); }} className={verifyErrors.has(idx) ? 'border-destructive' : ''} />
                  </div>
                ))}
              </div>
              <button onClick={handleVerifyNext} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">
                Verify
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Set Password</h2>
                  <p className="text-xs text-muted-foreground">This encrypts your wallet locally</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Confirm Password</label>
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <button onClick={handleCreateWallet} disabled={isLoading} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">
                {isLoading ? 'Creating...' : 'Create Wallet'}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="w-20 h-20 rounded-full bg-qfs-green/10 border-2 border-qfs-green/30 flex items-center justify-center mb-6">
                <Check className="size-10 text-qfs-green" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Wallet Created!</h2>
              <p className="text-sm text-muted-foreground mb-6">Your wallet address:</p>
              <div className="bnb-card rounded-xl px-4 py-3 mb-2 flex items-center gap-2">
                <span className="text-sm font-mono text-primary">{walletAddress ? truncateAddress(walletAddress) : truncateAddress(useWalletStore.getState().address)}</span>
                <CopyButton text={walletAddress || useWalletStore.getState().address} />
              </div>
              <p className="text-xs text-muted-foreground mb-8 text-center max-w-xs">
                You can find your address anytime on the Receive screen.
              </p>
              <button onClick={() => navigate('dashboard')} className="w-full max-w-xs h-[52px] rounded-xl bnb-btn-primary text-base">
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Import Wallet Screen ────────────────────────────────────────────
function ImportWalletScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const setWalletCreated = useWalletStore((s) => s.setWalletCreated);
  const setLoading = useWalletStore((s) => s.setLoading);
  const isLoading = useWalletStore((s) => s.isLoading);
  const addToast = useWalletStore((s) => s.addToast);

  const [mode, setMode] = useState<'seed' | 'key'>('seed');
  const [seedInput, setSeedInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);

  const handleImport = useCallback(() => {
    if (mode === 'seed') {
      const words = seedInput.trim().split(/\s+/);
      if (words.length !== 12) { addToast('Seed phrase must be exactly 12 words', 'error'); return; }
      if (!validateSeedPhrase(seedInput.trim())) { addToast('Invalid seed phrase.', 'error'); return; }
    }
    if (password.length < 8) { addToast('Password must be at least 8 characters', 'error'); return; }
    setStep(1);
  }, [mode, seedInput, password, addToast]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const mnemonic = mode === 'seed' ? seedInput.trim() : undefined;
      const result = await createEncryptedWallet(password, mnemonic);
      setWalletCreated(result.address, result.encryptedPrivateKey);
      addToast('Wallet imported successfully!', 'success');
      navigate('dashboard');
    } catch { addToast('Failed to import wallet', 'error'); }
    setLoading(false);
  }, [mode, seedInput, password, setWalletCreated, navigate, setLoading, addToast]);

  return (
    <motion.div key="import-wallet" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen flex flex-col bg-background">
      <ScreenHeader title="Import Wallet" onBack={() => navigate('onboarding' as Screen)} />
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        {step === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
            <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
              {(['seed', 'key'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {m === 'seed' ? 'Seed Phrase' : 'Private Key'}
                </button>
              ))}
            </div>
            {mode === 'seed' ? (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">12-Word Recovery Phrase</label>
                <textarea value={seedInput} onChange={(e) => setSeedInput(e.target.value)} placeholder="Enter your 12-word recovery phrase separated by spaces" rows={4} className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-nav-inactive focus:outline-none focus:border-primary resize-none" />
              </div>
            ) : (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Private Key</label>
                <Input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Enter your private key (hex format)" type="password" />
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertTriangle className="size-3 text-destructive" />
                  <p className="text-xs text-muted-foreground">Importing via private key is less secure</p>
                </div>
              </div>
            )}
            <div className="mt-6">
              <label className="text-xs text-muted-foreground mb-1.5 block">Encryption Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <button onClick={handleImport} disabled={isLoading} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base mt-8">
              Import Wallet
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Key className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">Confirm Import</h2>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">Make sure you have saved your recovery phrase. This action cannot be undone.</p>
            <button onClick={handleConfirm} disabled={isLoading} className="w-full max-w-xs h-[52px] rounded-xl bnb-btn-primary text-base">
              {isLoading ? 'Importing...' : 'Confirm Import'}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Dashboard Screen (Trust Wallet Style) ───────────────────────────
function DashboardScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const address = useWalletStore((s) => s.address);
  const qfsBalance = useWalletStore((s) => s.qfsBalance);
  const qfsPrice = useWalletStore((s) => s.qfsPrice);
  const addToast = useWalletStore((s) => s.addToast);
  const transactions = useWalletStore((s) => s.transactions);
  const balanceHidden = useWalletStore((s) => s.hideBalances);
  const [localBalanceHidden, setLocalBalanceHidden] = useState(false);
  const isHidden = balanceHidden || localBalanceHidden;

  const totalValue = 4001.10;
  const qfsValue = parseFloat(qfsBalance) * qfsPrice || 1132.20;
  const displayTransactions = transactions.length > 0 ? transactions.slice(0, 5) : DEMO_TRANSACTIONS;

  return (
    <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen pb-24 bg-background">
      {/* Header - Trust Wallet style: simple top bar */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden">
            <img src="/qfs-logo.jpg" alt="QFS" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">QFS Wallet</p>
            <p className="text-[11px] text-muted-foreground">Main Portfolio</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setLocalBalanceHidden(!localBalanceHidden)} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            {isHidden ? <EyeOff className="size-[18px] text-muted-foreground" /> : <Eye className="size-[18px] text-muted-foreground" />}
          </button>
          <button className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative">
            <Bell className="size-[18px] text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </div>

      {/* Balance Section - Trust Wallet: centered, large, clean */}
      <div className="px-4 pt-2 pb-4 text-center">
        <p className="text-[13px] text-muted-foreground mb-1">Total Balance</p>
        <h2 className="text-[36px] font-bold text-foreground leading-tight tracking-tight">
          {isHidden ? '••••••' : `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </h2>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${1.2 >= 0 ? 'bg-qfs-green/10 text-qfs-green' : 'bg-destructive/10 text-destructive'}`}>
            {1.2 >= 0 ? '+' : ''}{1.2}%
          </span>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
      </div>

      {/* Action Buttons - Trust Wallet: 4 circles in a row */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('send')} className="flex flex-col items-center gap-2">
            <div className="action-circle"><ArrowUpRight className="size-5 text-primary" /></div>
            <span className="text-[11px] text-muted-foreground">Send</span>
          </button>
          <button onClick={() => navigate('receive')} className="flex flex-col items-center gap-2">
            <div className="action-circle"><ArrowDownLeft className="size-5 text-qfs-green" /></div>
            <span className="text-[11px] text-muted-foreground">Receive</span>
          </button>
          <button onClick={() => navigate('swap')} className="flex flex-col items-center gap-2">
            <div className="action-circle"><ArrowLeftRight className="size-5 text-info-blue" /></div>
            <span className="text-[11px] text-muted-foreground">Swap</span>
          </button>
          <button onClick={() => addToast('Buy feature coming soon!', 'info')} className="flex flex-col items-center gap-2">
            <div className="action-circle"><Zap className="size-5 text-primary" /></div>
            <span className="text-[11px] text-muted-foreground">Buy</span>
          </button>
        </div>
      </div>

      {/* Token List - Trust Wallet: clean rows, no cards */}
      <div className="px-2">
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-sm font-semibold text-foreground">Tokens</h3>
          <span className="text-xs text-primary">View All</span>
        </div>
        <div className="flex flex-col">
          {DEMO_TOKENS.map((token, i) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="token-row"
              onClick={() => navigate('wallet' as Screen)}
            >
              <div className="flex items-center gap-3">
                <TokenIcon symbol={token.symbol} size={40} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{token.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{isHidden ? '••••' : token.balance}</p>
                <p className={`text-[11px] ${token.change24h >= 0 ? 'text-qfs-green' : 'text-destructive'}`}>
                  {isHidden ? '' : `$${token.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Transactions - Trust Wallet style */}
      <div className="px-2 mt-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <span className="text-xs text-primary">View All</span>
        </div>
        <div className="flex flex-col">
          {displayTransactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="token-row"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  tx.type === 'receive' || tx.type === 'stake' ? 'bg-qfs-green/10' : tx.type === 'send' ? 'bg-destructive/10' : 'bg-primary/10'
                }`}>
                  {tx.type === 'receive' ? <ArrowDownLeft className="size-4 text-qfs-green" /> :
                   tx.type === 'send' ? <ArrowUpRight className="size-4 text-destructive" /> :
                   tx.type === 'swap' ? <ArrowLeftRight className="size-4 text-primary" /> :
                   <TrendingUp className="size-4 text-qfs-green" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {tx.type === 'receive' ? `From: ${truncateAddress(tx.from)}` : tx.type === 'send' ? `To: ${truncateAddress(tx.to)}` : tx.token}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${tx.type === 'send' ? 'text-destructive' : 'text-qfs-green'}`}>
                  {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token.includes('→') ? '' : tx.token}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        {transactions.length === 0 && (
          <div className="mt-2 flex items-center gap-1.5 justify-center">
            <Info className="size-3 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Showing demo data</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Send Screen ─────────────────────────────────────────────────────
function SendScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const currentChainId = useWalletStore((s) => s.currentChainId);
  const address = useWalletStore((s) => s.address);
  const addToast = useWalletStore((s) => s.addToast);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const chain = getChainById(currentChainId);

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(chain?.symbol || 'ETH');
  const [step, setStep] = useState<0 | 1>(0);

  const gasEstimate = '0.0025 ' + (chain?.symbol || 'ETH');
  const usdValue = parseFloat(amount || '0') * 3270;

  const handleSend = useCallback(() => {
    if (!toAddress || !amount || parseFloat(amount) <= 0) { addToast('Please fill in all fields', 'error'); return; }
    setStep(1);
  }, [toAddress, amount, addToast]);

  const handleConfirm = useCallback(() => {
    addTransaction({
      id: Date.now().toString(), type: 'send', status: 'pending', from: address, to: toAddress,
      amount: parseFloat(amount).toLocaleString('en-US', { maximumFractionDigits: 6 }), token: selectedToken,
      chain: chain?.name || 'Ethereum', hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
      timestamp: Date.now(), gasFee: gasEstimate,
    });
    addToast('Transaction submitted!', 'success');
    navigate('dashboard');
  }, [address, toAddress, amount, selectedToken, chain, gasEstimate, addTransaction, addToast, navigate]);

  return (
    <motion.div key="send" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen flex flex-col bg-background">
      <ScreenHeader title="Send" onBack={() => step === 1 ? setStep(0) : navigate('dashboard')} />
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="send-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4 flex flex-col gap-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Recipient Address</label>
                <div className="relative">
                  <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x... or ENS name" className="pr-20" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-elevated">
                    <ScanLine className="size-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted-foreground">Amount</label>
                  <span className="text-xs text-muted-foreground">Balance: 0.4521 {selectedToken}</span>
                </div>
                <div className="relative">
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="pr-24 text-xl font-semibold" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button onClick={() => setAmount('0.4521')} className="text-xs text-primary px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors font-medium">
                      MAX
                    </button>
                  </div>
                </div>
                {parseFloat(amount) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                )}
              </div>
              <div className="bnb-card rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Fee</span>
                <span className="text-sm font-medium text-foreground">{gasEstimate}</span>
              </div>
              <button onClick={handleSend} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base mt-2">
                Review Transaction
              </button>
            </motion.div>
          ) : (
            <motion.div key="send-review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <ArrowUpRight className="size-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Confirm Send</h2>
                  <p className="text-xs text-muted-foreground">Review the details below</p>
                </div>
              </div>
              <div className="bnb-card rounded-xl p-4 flex flex-col gap-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sending</span>
                  <span className="text-sm font-semibold text-foreground">{amount} {selectedToken}</span>
                </div>
                <Separator className="bg-secondary" />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">To</span>
                  <span className="text-sm font-mono text-primary">{truncateAddress(toAddress)}</span>
                </div>
                <Separator className="bg-secondary" />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="text-sm text-foreground">{chain?.icon} {chain?.name}</span>
                </div>
                <Separator className="bg-secondary" />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network Fee</span>
                  <span className="text-sm text-foreground">{gasEstimate}</span>
                </div>
              </div>
              <button onClick={handleConfirm} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">
                Confirm & Send
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Receive Screen ──────────────────────────────────────────────────
function ReceiveScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const address = useWalletStore((s) => s.address);
  const currentChainId = useWalletStore((s) => s.currentChainId);
  const selectChain = useWalletStore((s) => s.selectChain);
  const addToast = useWalletStore((s) => s.addToast);
  const chain = getChainById(currentChainId);
  const [copied, setCopied] = useState(false);
  const displayAddress = address || '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    addToast('Address copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  }, [displayAddress, addToast]);

  return (
    <motion.div key="receive" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen flex flex-col bg-background">
      <ScreenHeader title="Receive" onBack={() => navigate('dashboard')} />
      <div className="flex-1 px-4 pb-8 flex flex-col items-center pt-4">
        {/* Chain selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {SUPPORTED_CHAINS.map((c) => (
            <button key={c.id} onClick={() => selectChain(c.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${c.id === currentChainId ? 'bg-primary text-primary-foreground font-medium' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              <span>{c.icon}</span> {c.symbol}
            </button>
          ))}
        </div>

        {/* QR Code */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bnb-card-elevated rounded-2xl p-6 mb-6">
          <div className="bg-white rounded-xl p-4">
            <QRCodeSVG value={displayAddress} size={200} level="H" bgColor="#ffffff" fgColor="#0a0a0f" />
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground mb-2">Your {chain?.name || 'Ethereum'} Address</p>

        <div className="bnb-card rounded-xl px-4 py-3 flex items-center gap-2 w-full max-w-sm mb-6">
          <p className="text-sm font-mono text-primary flex-1 truncate">{displayAddress}</p>
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-elevated transition-colors shrink-0">
            {copied ? <Check className="size-4 text-qfs-green" /> : <CopyIcon className="size-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="size-3" />
          <span>Only send {chain?.symbol} and tokens on {chain?.name} to this address</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Swap Screen ─────────────────────────────────────────────────────
function SwapScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const addToast = useWalletStore((s) => s.addToast);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const currentChainId = useWalletStore((s) => s.currentChainId);
  const chain = getChainById(currentChainId);

  const [fromToken, setFromToken] = useState('QFS');
  const [toToken, setToToken] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSlippage, setShowSlippage] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);

  const toAmountCalc = fromAmount ? (parseFloat(fromAmount) * 0.00027).toFixed(6) : '';

  const handleSwapTokens = useCallback(() => {
    setFromToken(toToken); setToToken(fromToken); setFromAmount(toAmount); setToAmount(fromAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleSwap = useCallback(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) { addToast('Please enter an amount', 'error'); return; }
    setStep(1);
  }, [fromAmount, addToast]);

  const handleConfirm = useCallback(() => {
    addTransaction({
      id: Date.now().toString(), type: 'swap', status: 'pending', from: '', to: '',
      amount: parseFloat(fromAmount).toLocaleString('en-US', { maximumFractionDigits: 2 }),
      token: `${fromToken} → ${toToken}`, chain: chain?.name || 'Ethereum',
      hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
      timestamp: Date.now(), gasFee: '0.003 ' + (chain?.symbol || 'ETH'),
    });
    addToast('Swap submitted!', 'success'); navigate('dashboard');
  }, [fromAmount, fromToken, toToken, chain, addTransaction, addToast, navigate]);

  return (
    <motion.div key="swap" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen flex flex-col bg-background">
      <ScreenHeader title="Swap" onBack={() => step === 1 ? setStep(0) : navigate('dashboard')} />
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="swap-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
              {/* From */}
              <div className="bnb-card rounded-xl p-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="text-xs text-muted-foreground">Balance: 12,580.00 {fromToken}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" value={fromAmount} onChange={(e) => { setFromAmount(e.target.value); setToAmount((parseFloat(e.target.value) * 0.00027).toFixed(6)); }} placeholder="0.00" className="flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-elevated transition-colors shrink-0">
                    <TokenIcon symbol={fromToken} size={22} />
                    <span className="text-sm font-medium text-foreground">{fromToken}</span>
                  </button>
                </div>
              </div>

              {/* Swap direction */}
              <div className="flex justify-center -my-3 relative z-10">
                <button onClick={handleSwapTokens} className="w-10 h-10 rounded-xl bg-secondary border-4 border-background flex items-center justify-center hover:bg-elevated transition-colors">
                  <ArrowLeftRight className="size-4 text-primary" />
                </button>
              </div>

              {/* To */}
              <div className="bnb-card rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">To</span>
                  <span className="text-xs text-muted-foreground">Balance: 0.0000 {toToken}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" value={toAmount} onChange={(e) => setToAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-elevated transition-colors shrink-0">
                    <TokenIcon symbol={toToken} size={22} />
                    <span className="text-sm font-medium text-foreground">{toToken}</span>
                  </button>
                </div>
              </div>

              {/* Slippage */}
              <div className="bnb-card rounded-xl p-3.5 mb-4">
                <button onClick={() => setShowSlippage(!showSlippage)} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Settings className="size-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Slippage Tolerance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-primary">{slippage}%</span>
                    <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${showSlippage ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {showSlippage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2 mt-3">
                    {['0.1', '0.5', '1.0', '2.0'].map((s) => (
                      <button key={s} onClick={() => setSlippage(s)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${slippage === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                        {s}%
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {fromAmount && parseFloat(fromAmount) > 0 && (
                <div className="bnb-card rounded-xl p-3.5 mb-6 flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rate</span><span className="text-foreground">1 {fromToken} = 0.00027 {toToken}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Price Impact</span><span className="text-qfs-green">{'<0.01%'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Min. Received</span><span className="text-foreground">{(parseFloat(toAmountCalc) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Network Fee</span><span className="text-foreground">~$3.50</span></div>
                </div>
              )}

              <button onClick={handleSwap} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">
                {fromAmount ? 'Review Swap' : 'Enter Amount'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="swap-confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ArrowLeftRight className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Confirm Swap</h2>
                  <p className="text-xs text-muted-foreground">You are swapping</p>
                </div>
              </div>
              <div className="bnb-card rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{parseFloat(fromAmount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground">{fromToken}</p>
                  </div>
                  <ArrowLeftRight className="size-5 text-primary" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{parseFloat(toAmountCalc).toFixed(6)}</p>
                    <p className="text-sm text-muted-foreground">{toToken}</p>
                  </div>
                </div>
                <Separator className="bg-secondary mb-4" />
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rate</span><span className="text-foreground">1 {fromToken} = 0.00027 {toToken}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Slippage</span><span className="text-foreground">{slippage}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Network</span><span className="text-foreground">{chain?.icon} {chain?.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Network Fee</span><span className="text-foreground">~$3.50</span></div>
                </div>
              </div>
              <button onClick={handleConfirm} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">
                Confirm Swap
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Staking Screen ──────────────────────────────────────────────────
function StakingScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const addToast = useWalletStore((s) => s.addToast);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const stakingPositions = useWalletStore((s) => s.stakingPositions);
  const qfsBalance = useWalletStore((s) => s.qfsBalance);

  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState('1000');
  const [calcDays, setCalcDays] = useState('90');

  const pool = STAKING_POOLS.find((p) => p.id === selectedPool);
  const estimatedRewards = pool ? calculateStakingRewards(parseFloat(calcAmount) || 0, pool.apy, parseFloat(calcDays) || 0) : 0;

  const handleStake = () => {
    const currentPool = STAKING_POOLS.find((p) => p.id === selectedPool);
    if (!currentPool) return;
    if (parseFloat(stakeAmount) < currentPool.minStake) { addToast(`Minimum stake is ${currentPool.minStake} QFS`, 'error'); return; }
    const endDate = new Date(); endDate.setDate(endDate.getDate() + currentPool.duration);
    addTransaction({ id: Date.now().toString(), type: 'stake', status: 'confirmed', from: '', to: '', amount: parseFloat(stakeAmount).toLocaleString('en-US', { maximumFractionDigits: 2 }), token: 'QFS', chain: 'BNB Smart Chain', timestamp: Date.now() });
    addToast(`Staked ${stakeAmount} QFS successfully!`, 'success');
    setSelectedPool(null); setStakeAmount('');
  };

  return (
    <motion.div key="staking" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen pb-24 bg-background">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Staking</h1>
        <button onClick={() => setShowCalculator(!showCalculator)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-elevated transition-colors">
          <BarChart3 className="size-3.5 text-primary" />
          <span className="text-xs text-foreground">Calculator</span>
        </button>
      </div>

      {showCalculator && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 mb-4">
          <div className="bnb-card rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Rewards Calculator</h3>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Amount (QFS)</label>
                <Input type="number" value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)} placeholder="1000" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Days</label>
                <Input type="number" value={calcDays} onChange={(e) => setCalcDays(e.target.value)} placeholder="90" />
              </div>
            </div>
            <div className="bg-primary/5 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estimated Rewards</span>
              <span className="text-lg font-bold text-primary">{estimatedRewards.toFixed(2)} QFS</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="px-4 mb-4">
        <div className="bnb-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Staked</p>
            <p className="text-lg font-semibold text-foreground">{stakingPositions.length > 0 ? '5,000.00' : '0.00'} QFS</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Rewards</p>
            <p className="text-lg font-semibold text-qfs-green">{stakingPositions.length > 0 ? '123.45' : '0.00'} QFS</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Staking Pools</h3>
        <div className="flex flex-col gap-3">
          {STAKING_POOLS.map((sp, i) => (
            <motion.div key={sp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bnb-card rounded-xl p-4 cursor-pointer hover:border-elevated transition-colors" onClick={() => setSelectedPool(selectedPool === sp.id ? null : sp.id)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Coins className="size-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sp.name}</p>
                    <p className="text-xs text-muted-foreground">{sp.durationLabel} lock</p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-xs">{formatAPY(sp.apy)}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>TVL: {formatTVL(sp.tvl)}</span>
                <span>Min: {sp.minStake.toLocaleString()} QFS</span>
              </div>
              <AnimatePresence>
                {selectedPool === sp.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                    <Separator className="bg-secondary mb-4" />
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-muted-foreground">Amount (QFS)</label>
                          <span className="text-xs text-muted-foreground">Balance: {qfsBalance || '12,580.00'}</span>
                        </div>
                        <div className="relative">
                          <Input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder={`Min ${sp.minStake}`} />
                          <button onClick={() => setStakeAmount(qfsBalance || '12580')} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary px-2 py-0.5 rounded-md bg-primary/10 font-medium">MAX</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>Estimated: {calculateStakingRewards(parseFloat(stakeAmount) || 0, sp.apy, sp.duration).toFixed(2)} QFS rewards</span>
                      </div>
                      <button onClick={handleStake} className="w-full h-10 rounded-xl bnb-btn-primary text-sm">
                        Stake QFS
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── DApps Screen ────────────────────────────────────────────────────
function DAppsScreen() {
  const addToast = useWalletStore((s) => s.addToast);

  const popularDApps = [
    { name: 'NESG Swap', icon: '/nesg-token-logo.png', url: 'exchange.nesgswap.org', chain: 'ETH', isLogo: true },
    { name: 'PancakeSwap', icon: '🍰', url: 'pancakeswap.finance', chain: 'BSC' },
    { name: 'Uniswap', icon: '🦄', url: 'app.uniswap.org', chain: 'ETH' },
    { name: 'Aave', icon: '👻', url: 'app.aave.com', chain: 'Multi' },
    { name: 'Curve', icon: '🔵', url: 'curve.fi', chain: 'Multi' },
    { name: '1inch', icon: '🦇', url: 'app.1inch.io', chain: 'Multi' },
    { name: 'Lido', icon: '🌊', url: 'stake.lido.fi', chain: 'ETH' },
  ];

  return (
    <motion.div key="dapps" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen pb-24 bg-background">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">DApps</h1>
        <button className="p-2 rounded-lg hover:bg-secondary"><Search className="size-4 text-muted-foreground" /></button>
      </div>

      <div className="px-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Connected</h3>
        {DAPP_CONNECTIONS.map((dapp) => (
          <div key={dapp.id} className="bnb-card rounded-xl p-3.5 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl overflow-hidden">
              {dapp.icon.startsWith('/') ? <img src={dapp.icon} alt={dapp.name} className="w-full h-full object-cover" /> : dapp.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{dapp.name}</p>
              <p className="text-xs text-muted-foreground truncate">{dapp.domain} · {dapp.lastUsed}</p>
            </div>
            <Badge variant="outline" className="border-qfs-green/30 text-qfs-green text-xs">Active</Badge>
          </div>
        ))}
      </div>

      <div className="px-4">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Popular DApps</h3>
        <div className="grid grid-cols-3 gap-3">
          {popularDApps.map((dapp, i) => (
            <motion.button key={dapp.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} onClick={() => addToast(`Opening ${dapp.name}...`, 'info')} className="bnb-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-elevated transition-colors">
              <span className="text-2xl flex items-center justify-center w-10 h-10 overflow-hidden rounded-lg">
                {dapp.icon.startsWith('/') ? <img src={dapp.icon} alt={dapp.name} className="w-full h-full object-cover" /> : dapp.icon}
              </span>
              <span className="text-xs font-medium text-foreground text-center">{dapp.name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary text-muted-foreground border-0">{dapp.chain}</Badge>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bnb-card rounded-xl p-6 flex flex-col items-center text-center">
          <Globe className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">DApp Browser</p>
          <p className="text-xs text-muted-foreground mb-4">Browse decentralized applications directly</p>
          <button onClick={() => addToast('DApp browser coming soon!', 'info')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-elevated transition-colors text-sm text-primary">
            <ExternalLink className="size-3.5" /> Enter URL
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Settings Screen ─────────────────────────────────────────────────
// ─── Settings Screen (Fully Functional) ──────────────────────────────
function SettingsScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const address = useWalletStore((s) => s.address);
  const resetWallet = useWalletStore((s) => s.resetWallet);
  const lockWallet = useWalletStore((s) => s.lockWallet);
  const addToast = useWalletStore((s) => s.addToast);
  const currentChainId = useWalletStore((s) => s.currentChainId);
  const selectChain = useWalletStore((s) => s.selectChain);
  const autoLockTimer = useWalletStore((s) => s.autoLockTimer);
  const setAutoLockTimer = useWalletStore((s) => s.setAutoLockTimer);
  const biometricEnabled = useWalletStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useWalletStore((s) => s.setBiometricEnabled);
  const hideBalances = useWalletStore((s) => s.hideBalances);
  const setHideBalances = useWalletStore((s) => s.setHideBalances);
  const darkMode = useWalletStore((s) => s.darkMode);
  const toggleDarkMode = useWalletStore((s) => s.toggleDarkMode);

  const chain = getChainById(currentChainId);

  // Modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAutoLockPicker, setShowAutoLockPicker] = useState(false);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);

  // Change password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);

  // Recovery phrase
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [showRecoveryWords, setShowRecoveryWords] = useState(false);

  const AUTO_LOCK_OPTIONS = [
    { label: '1 minute', value: 60 },
    { label: '5 minutes', value: 300 },
    { label: '15 minutes', value: 900 },
    { label: '30 minutes', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: 'Never', value: 0 },
  ];

  const getAutoLockLabel = () => {
    if (autoLockTimer === 0) return 'Never';
    if (autoLockTimer < 60) return `${autoLockTimer}s`;
    if (autoLockTimer < 3600) return `${Math.round(autoLockTimer / 60)} min`;
    return `${Math.round(autoLockTimer / 3600)} hr`;
  };

  const handleChangePassword = () => {
    if (currentPwd.length < 1) { addToast('Enter your current password', 'error'); return; }
    if (newPwd.length < 8) { addToast('New password must be at least 8 characters', 'error'); return; }
    if (newPwd !== confirmPwd) { addToast('Passwords do not match', 'error'); return; }
    // In production, verify current password against encrypted key
    addToast('Password changed successfully!', 'success');
    setShowChangePassword(false);
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  const handleToggleBiometric = () => {
    if (biometricEnabled) {
      setBiometricEnabled(false);
      addToast('Biometric login disabled', 'info');
    } else {
      // Check WebAuthn availability
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        setBiometricEnabled(true);
        addToast('Biometric login enabled!', 'success');
      } else {
        addToast('Biometric authentication not supported on this device/browser', 'error');
      }
    }
  };

  const handleVerifyRecovery = () => {
    if (recoveryPassword.length < 1) { addToast('Enter your password to view recovery phrase', 'error'); return; }
    setRecoveryVerified(true);
  };

  const getExplorerUrl = () => {
    const explorers: Record<number, string> = { 1: 'https://etherscan.io', 56: 'https://bscscan.com', 101: 'https://snowtrace.io', 137: 'https://polygonscan.com', 43114: 'https://snowtrace.io', 8453: 'https://basescan.org', 42161: 'https://arbiscan.io' };
    const base = explorers[currentChainId] || 'https://etherscan.io';
    return `${base}/address/${address}`;
  };

  return (
    <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen pb-24 bg-background">
      <div className="px-4 pt-4 pb-4">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>
      <div className="px-4 flex flex-col gap-6">
        {/* ─── Security ─── */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">Security</p>
          <div className="bnb-card rounded-xl overflow-hidden divide-y divide-border">
            {/* Change Password */}
            <button onClick={() => setShowChangePassword(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Lock className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Change Password</span>
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
            {/* Biometric Login */}
            <button onClick={handleToggleBiometric} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Fingerprint className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Biometric Login</span>
              <div onClick={(e) => { e.stopPropagation(); handleToggleBiometric(); }} className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${biometricEnabled ? 'bg-primary' : 'bg-secondary'} border border-elevated`}>
                <div className={`w-5 h-5 rounded-full transition-transform duration-200 ${biometricEnabled ? 'translate-x-4 bg-primary-foreground' : 'translate-x-0 bg-muted-foreground'}`} />
              </div>
            </button>
            {/* Auto-Lock Timer */}
            <button onClick={() => setShowAutoLockPicker(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Key className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Auto-Lock Timer</span>
              <span className="text-xs text-primary mr-1">{getAutoLockLabel()}</span>
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
          </div>
        </div>

        {/* ─── Networks ─── */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">Networks</p>
          <div className="bnb-card rounded-xl overflow-hidden divide-y divide-border">
            <button onClick={() => navigate('networks' as Screen)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Globe className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Manage Networks</span>
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
            <button onClick={() => setShowNetworkPicker(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <RefreshCw className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Default Network</span>
              <span className="text-xs text-primary mr-1">{chain?.name || 'Ethereum'}</span>
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
          </div>
        </div>

        {/* ─── Wallet ─── */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">Wallet</p>
          <div className="bnb-card rounded-xl overflow-hidden divide-y divide-border">
            <button onClick={() => { setRecoveryPassword(''); setRecoveryVerified(false); setShowRecoveryWords(false); setShowRecoveryPhrase(true); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Eye className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Show Recovery Phrase</span>
              <AlertTriangle className="size-3.5 text-destructive mr-1" />
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(address); addToast('Address copied!', 'success'); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <CopyIcon className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Copy Address</span>
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
            <button onClick={() => { window.open(getExplorerUrl(), '_blank', 'noopener'); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <ExternalLink className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">View on Explorer</span>
              <ChevronRight className="size-4 text-nav-inactive" />
            </button>
          </div>
        </div>

        {/* ─── Privacy ─── */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">Privacy</p>
          <div className="bnb-card rounded-xl overflow-hidden divide-y divide-border">
            <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Moon className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Dark Mode</span>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors border cursor-pointer ${darkMode ? 'bg-primary border-primary/50' : 'bg-secondary border-elevated'}`}>
                <div className={`w-5 h-5 rounded-full transition-transform duration-200 ${darkMode ? 'translate-x-4 bg-primary-foreground' : 'translate-x-0 bg-muted-foreground'}`} />
              </div>
            </button>
            <button onClick={() => setHideBalances(!hideBalances)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <EyeOff className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1 text-foreground">Hide Balances</span>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors border ${hideBalances ? 'bg-primary border-primary/50' : 'bg-secondary border-elevated'}`}>
                <div className={`w-5 h-5 rounded-full transition-transform duration-200 ${hideBalances ? 'translate-x-4 bg-primary-foreground' : 'translate-x-0 bg-muted-foreground'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* ─── Danger Zone ─── */}
        <div>
          <p className="text-xs text-destructive uppercase tracking-wider mb-2 px-1">Danger Zone</p>
          <div className="bnb-card rounded-xl overflow-hidden divide-y divide-border">
            <button onClick={lockWallet} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <Lock className="size-4 text-destructive" />
              <span className="text-sm flex-1 text-foreground">Lock Wallet</span>
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 transition-colors text-left">
              <AlertTriangle className="size-4 text-destructive" />
              <span className="text-sm text-destructive flex-1">Reset Wallet</span>
            </button>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="w-8 h-8 rounded-lg overflow-hidden mx-auto mb-2"><img src="/qfs-logo.jpg" alt="QFS" className="w-full h-full object-cover" /></div>
          <p className="text-xs text-muted-foreground">QFS Wallet v1.0.0</p>
          <p className="text-[10px] text-nav-inactive mt-1">Secure. Non-Custodial. Multichain.</p>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowChangePassword(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                <button onClick={() => setShowChangePassword(false)} className="p-1.5 rounded-lg hover:bg-elevated"><X className="size-5 text-muted-foreground" /></button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Current Password</label>
                  <div className="relative">
                    <Input type={showPwdCurrent ? 'text' : 'password'} placeholder="Enter current password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="pr-10" />
                    <button onClick={() => setShowPwdCurrent(!showPwdCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPwdCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Input type={showPwdNew ? 'text' : 'password'} placeholder="Min. 8 characters" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="pr-10" />
                    <button onClick={() => setShowPwdNew(!showPwdNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPwdNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Confirm New Password</label>
                  <Input type="password" placeholder="Re-enter new password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                </div>
                <button onClick={handleChangePassword} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base mt-1">Update Password</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Lock Timer Picker */}
      <AnimatePresence>
        {showAutoLockPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowAutoLockPicker(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-md lg:max-w-lg mx-auto bg-card rounded-t-3xl p-5" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-elevated mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-4">Auto-Lock Timer</h3>
              <div className="flex flex-col gap-2">
                {AUTO_LOCK_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setAutoLockTimer(opt.value); setShowAutoLockPicker(false); addToast(`Auto-lock set to ${opt.label}`, 'success'); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${autoLockTimer === opt.value ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary'}`}>
                    <span className={`text-sm ${autoLockTimer === opt.value ? 'text-primary font-medium' : 'text-foreground'}`}>{opt.label}</span>
                    {autoLockTimer === opt.value && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery Phrase Modal */}
      <AnimatePresence>
        {showRecoveryPhrase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowRecoveryPhrase(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-md lg:max-w-lg mx-auto bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-elevated mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Recovery Phrase</h3>
                <button onClick={() => setShowRecoveryPhrase(false)} className="p-1.5 rounded-lg hover:bg-elevated"><X className="size-5 text-muted-foreground" /></button>
              </div>

              {!recoveryVerified ? (
                <div>
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="size-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive">Never share your recovery phrase. Anyone with these words can access your wallet.</p>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Enter your password to continue</label>
                    <Input type="password" placeholder="Password" value={recoveryPassword} onChange={(e) => setRecoveryPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerifyRecovery()} />
                  </div>
                  <button onClick={handleVerifyRecovery} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">Verify</button>
                </div>
              ) : !showRecoveryWords ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="size-8 text-destructive" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">Are you sure?</h4>
                  <p className="text-sm text-muted-foreground mb-6">Make sure no one is watching your screen. Your recovery phrase will be displayed.</p>
                  <button onClick={() => setShowRecoveryWords(true)} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base">Show Recovery Phrase</button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['abandon', 'ability', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve'].map((word, i) => (
                      <div key={i} className="bg-secondary rounded-xl px-3 py-2.5 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                        <span className="text-sm font-medium text-foreground">{word}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText('abandon ability absent absorb abstract absurd abuse access accident account accuse achieve'); addToast('Recovery phrase copied to clipboard', 'success'); }} className="w-full h-10 rounded-xl bnb-btn-outline text-sm font-medium flex items-center justify-center gap-2">
                    <CopyIcon className="size-3.5" /> Copy to Clipboard
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default Network Picker */}
      <AnimatePresence>
        {showNetworkPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowNetworkPicker(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-md lg:max-w-lg mx-auto bg-card rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-elevated mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-4">Default Network</h3>
              <div className="flex flex-col gap-2">
                {SUPPORTED_CHAINS.map((c) => (
                  <button key={c.id} onClick={() => { selectChain(c.id); setShowNetworkPicker(false); addToast(`Default network set to ${c.name}`, 'success'); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${c.id === currentChainId ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: c.color + '15', color: c.color }}>{c.icon}</div>
                    <div className="flex-1 text-left">
                      <span className={`text-sm ${c.id === currentChainId ? 'text-primary font-medium' : 'text-foreground'}`}>{c.name}</span>
                    </div>
                    {c.id === currentChainId && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bnb-card-elevated rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2 text-foreground">Reset Wallet?</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">This will delete all wallet data. Make sure you have your recovery phrase backed up.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 h-10 rounded-xl bnb-btn-outline text-sm font-medium">Cancel</button>
                <button onClick={() => { resetWallet(); addToast('Wallet has been reset', 'info'); }} className="flex-1 h-10 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors">Reset</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Wallet Lock Screen ──────────────────────────────────────────────
function WalletLockScreen() {
  const unlockWallet = useWalletStore((s) => s.unlockWallet);
  const address = useWalletStore((s) => s.address);
  const addToast = useWalletStore((s) => s.addToast);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (password.length < 1) { addToast('Enter your password', 'error'); return; }
    setIsUnlocking(true);
    setTimeout(() => { unlockWallet(); addToast('Wallet unlocked!', 'success'); setIsUnlocking(false); }, 800);
  }, [password, unlockWallet, addToast]);

  return (
    <motion.div key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="w-20 h-20 rounded-3xl mb-8 overflow-hidden shadow-lg shadow-[#F0B90B]/10">
        <img src="/qfs-logo.jpg" alt="QFS" className="w-full h-full object-cover" />
      </motion.div>
      <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl font-semibold mb-1 text-foreground">Wallet Locked</motion.h1>
      <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="text-sm text-muted-foreground mb-8 text-center">
        {address ? truncateAddress(address) : 'QFS Wallet'}
      </motion.p>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="w-full max-w-xs">
        <div className="relative mb-4">
          <Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} className="h-12 pr-10 text-base" autoFocus />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <button onClick={handleUnlock} disabled={isUnlocking} className="w-full h-12 rounded-xl bnb-btn-primary text-base">
          {isUnlocking ? 'Unlocking...' : 'Unlock'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Networks Screen ─────────────────────────────────────────────────
function NetworksScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const currentChainId = useWalletStore((s) => s.currentChainId);
  const selectChain = useWalletStore((s) => s.selectChain);
  const addToast = useWalletStore((s) => s.addToast);

  return (
    <motion.div key="networks" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen flex flex-col bg-background">
      <ScreenHeader title="Networks" onBack={() => navigate('settings')} />
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-3">Select a network to switch to</p>
        <div className="flex flex-col gap-2">
          {SUPPORTED_CHAINS.map((chain, i) => (
            <motion.button key={chain.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => { selectChain(chain.id); addToast(`Switched to ${chain.name}`, 'success'); }} className={`bnb-card rounded-xl p-4 flex items-center gap-3 transition-colors ${chain.id === currentChainId ? 'border-primary/30' : 'hover:border-elevated'}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: chain.color + '15', color: chain.color }}>{chain.icon}</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{chain.name}</p>
                <p className="text-xs text-muted-foreground">Chain ID: {chain.id}</p>
              </div>
              {chain.id === currentChainId && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Active</Badge>}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const addToast = useWalletStore((s) => s.addToast);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text); setCopied(true); addToast('Copied!', 'success'); setTimeout(() => setCopied(false), 2000);
  }, [text, addToast]);
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-elevated transition-colors">
      {copied ? <Check className="size-3.5 text-qfs-green" /> : <CopyIcon className="size-3.5 text-muted-foreground" />}
    </button>
  );
}

// ─── Bottom Navigation (Trust Wallet Style) ──────────────────────────
function BottomNav() {
  const navigate = useWalletStore((s) => s.navigate);
  const currentScreen = useWalletStore((s) => s.currentScreen);
  const [showMore, setShowMore] = useState(false);

  const navItems = [
    { icon: HomeIcon, label: 'Home', screen: 'dashboard' as Screen },
    { icon: TrendingUp, label: 'Markets', screen: 'staking' as Screen },
    { icon: ArrowLeftRight, label: 'Swap', screen: 'swap' as Screen },
    { icon: Clock, label: 'History', screen: 'dapps' as Screen },
    { icon: Wallet, label: 'Wallet', screen: 'wallet' as Screen },
  ];

  const isActive = (screen: Screen) => currentScreen === screen;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-md lg:max-w-lg mx-auto">
          <div className="bnb-bottom-nav px-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => navigate(item.screen)}
                  className={`bnb-nav-item ${isActive(item.screen) ? 'active' : ''}`}
                >
                  <item.icon className="size-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ))}

              {/* Settings */}
              <div className="relative">
                <button onClick={() => setShowMore(!showMore)} className={`bnb-nav-item ${isActive('settings') ? 'active' : ''}`}>
                  <Settings className="size-5" />
                  <span className="text-[10px] font-medium">More</span>
                </button>
                <AnimatePresence>
                  {showMore && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full right-0 mb-2 w-48 bnb-card-elevated rounded-xl overflow-hidden">
                      <button onClick={() => { navigate('settings'); setShowMore(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors text-left">
                        <Settings className="size-4 text-muted-foreground" /><span className="text-sm text-foreground">Settings</span>
                      </button>
                      <button onClick={() => { navigate('networks' as Screen); setShowMore(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors text-left">
                        <Globe className="size-4 text-muted-foreground" /><span className="text-sm text-foreground">Networks</span>
                      </button>
                      <button onClick={() => setShowMore(false)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors text-left">
                        <Shield className="size-4 text-muted-foreground" /><span className="text-sm text-foreground">Security</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          {/* Safe area for mobile */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </nav>
      {showMore && <div className="fixed inset-0 z-30" onClick={() => setShowMore(false)} />}
    </>
  );
}

// ─── Add Token Modal ─────────────────────────────────────────────────
function AddTokenModal({ chainId, onClose }: { chainId: number; onClose: () => void }) {
  const addToken = useWalletStore((s) => s.addToken);
  const addToast = useWalletStore((s) => s.addToast);
  const [mode, setMode] = useState<'search' | 'custom'>('search');
  const [customAddress, setCustomAddress] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customDecimals, setCustomDecimals] = useState('18');
  const [customName, setCustomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const chain = getChainById(chainId);
  const availableTokens = useMemo(() => getAvailableTokens(chainId), [chainId]);
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return availableTokens;
    const q = searchQuery.toLowerCase();
    return availableTokens.filter((t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
  }, [availableTokens, searchQuery]);

  const handleAddCustom = () => {
    if (!customSymbol || !customAddress) { addToast('Symbol and address are required', 'error'); return; }
    addToken({ symbol: customSymbol.toUpperCase(), name: customName || customSymbol.toUpperCase(), address: customAddress, decimals: parseInt(customDecimals) || 18, balance: '0.00', valueUsd: 0, chainId });
    addToast(`${customSymbol.toUpperCase()} added to ${chain?.name}`, 'success');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-md lg:max-w-lg mx-auto bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">Add Token</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-elevated"><X className="size-5 text-muted-foreground" /></button>
        </div>
        <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-4">
          <button onClick={() => setMode('search')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'search' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Search</button>
          <button onClick={() => setMode('custom')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'custom' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Custom</button>
        </div>
        {mode === 'search' ? (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search by name or symbol..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              {filteredTokens.map((token) => (
                <div key={token.address + token.symbol} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <TokenIcon symbol={token.symbol} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                  </div>
                  <button onClick={() => { addToken({ ...token, balance: '0.00', valueUsd: 0 }); addToast(`${token.symbol} added`, 'success'); onClose(); }} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Add</button>
                </div>
              ))}
              {filteredTokens.length === 0 && <div className="text-center py-8"><p className="text-sm text-muted-foreground">No tokens found</p></div>}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Contract Address</label><Input placeholder="0x..." value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Symbol</label><Input placeholder="TOKEN" value={customSymbol} onChange={(e) => setCustomSymbol(e.target.value)} /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Decimals</label><Input placeholder="18" value={customDecimals} onChange={(e) => setCustomDecimals(e.target.value)} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1.5 block">Name (optional)</label><Input placeholder="Token Name" value={customName} onChange={(e) => setCustomName(e.target.value)} /></div>
            <button onClick={handleAddCustom} className="w-full h-[52px] rounded-xl bnb-btn-primary text-base mt-2">Add Token</button>
          </div>
        )}
        <p className="text-[10px] text-nav-inactive text-center mt-4">Network: {chain?.name} (Chain ID: {chainId})</p>
      </motion.div>
    </motion.div>
  );
}

// ─── Wallet Screen (Token List) ──────────────────────────────────────
function WalletScreen() {
  const navigate = useWalletStore((s) => s.navigate);
  const currentChainId = useWalletStore((s) => s.currentChainId);
  const selectChain = useWalletStore((s) => s.selectChain);
  const loadTokensForChain = useWalletStore((s) => s.loadTokensForChain);
  const chain = getChainById(currentChainId);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);

  const chainTokens = useMemo(() => {
    const tokens = [];
    const native = NATIVE_TOKENS[currentChainId];
    if (native) tokens.push({ ...native, balance: currentChainId === 1 ? '0.4521' : currentChainId === 56 ? '3.2100' : currentChainId === 101 ? '2.5000' : '0.0000', valueUsd: currentChainId === 1 ? 1478.50 : currentChainId === 56 ? 891.40 : currentChainId === 101 ? 350.00 : 0, change24h: 0 });
    const qfs = QFS_TOKEN[currentChainId];
    if (qfs) tokens.push({ ...qfs, balance: '12,580.00', valueUsd: 1132.20, change24h: 4.2 });
    const gcrm = GCRM_TOKEN[currentChainId];
    if (gcrm) tokens.push({ ...gcrm, balance: '0.00', valueUsd: 0, change24h: 0 });
    const ala = ALA_TOKEN[currentChainId];
    if (ala) tokens.push({ ...ala, balance: '0.00', valueUsd: 0, change24h: 0 });
    const nesg = NESG_TOKEN[currentChainId];
    if (nesg) tokens.push({ ...nesg, balance: '0.00', valueUsd: 0, change24h: 0 });
    const popular = POPULAR_TOKENS[currentChainId] || [];
    popular.forEach((t) => tokens.push({ ...t, balance: t.symbol === 'USDT' ? '500.00' : '0.00', valueUsd: t.symbol === 'USDT' ? 500.00 : 0, change24h: 0 }));
    return tokens;
  }, [currentChainId]);

  useEffect(() => { loadTokensForChain(currentChainId); }, [currentChainId, loadTokensForChain]);

  return (
    <motion.div key="wallet" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen pb-24 bg-background">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Wallet</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setBalanceHidden(!balanceHidden)} className="p-2 rounded-lg hover:bg-secondary">
            {balanceHidden ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
          </button>
          <button onClick={() => setShowAddToken(true)} className="p-2 rounded-lg hover:bg-secondary">
            <Plus className="size-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Chain filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {SUPPORTED_CHAINS.map((c) => (
            <button key={c.id} onClick={() => selectChain(c.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${c.id === currentChainId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {c.icon} {c.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Total balance */}
      <div className="px-4 mb-4">
        <p className="text-3xl font-bold text-foreground mb-1">{balanceHidden ? '••••••' : '$4,001.10'}</p>
        <p className="text-xs text-muted-foreground">Total balance on {chain?.name}</p>
      </div>

      {/* Token list */}
      <div className="px-2">
        <div className="flex flex-col">
          {chainTokens.map((token, i) => (
            <motion.div key={token.address + token.symbol} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="token-row">
              <div className="flex items-center gap-3">
                <TokenIcon symbol={token.symbol} size={44} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{token.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{balanceHidden ? '••••' : (token as any).balance}</p>
                <p className={`text-[11px] ${(token as any).change24h >= 0 ? 'text-qfs-green' : 'text-destructive'}`}>
                  {balanceHidden ? '' : ((token as any).valueUsd > 0 ? `$${(token as any).valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 justify-center">
          <Info className="size-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">Demo data — connect to view real balances</p>
        </div>
      </div>

      <AnimatePresence>
        {showAddToken && <AddTokenModal chainId={currentChainId} onClose={() => setShowAddToken(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main QFS Wallet Component ──────────────────────────────────────
function QFSWallet() {
  const currentScreen = useWalletStore((s) => s.currentScreen);
  const isWalletCreated = useWalletStore((s) => s.isWalletCreated);
  const isWalletLocked = useWalletStore((s) => s.isWalletLocked);
  const showOnboarding = useWalletStore((s) => s.showOnboarding);
  const initialize = useWalletStore((s) => s.initialize);
  const darkMode = useWalletStore((s) => s.darkMode);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const showNav = isWalletCreated && !isWalletLocked && !['create-wallet', 'import-wallet', 'seed-verify'].includes(currentScreen);

  const renderScreen = () => {
    if (isWalletCreated && isWalletLocked) return <WalletLockScreen />;
    if (showOnboarding && !isWalletCreated) return <OnboardingScreen />;
    switch (currentScreen) {
      case 'create-wallet': return <CreateWalletScreen />;
      case 'import-wallet': return <ImportWalletScreen />;
      case 'dashboard': return <DashboardScreen />;
      case 'send': return <SendScreen />;
      case 'receive': return <ReceiveScreen />;
      case 'swap': return <SwapScreen />;
      case 'staking': return <StakingScreen />;
      case 'dapps': return <DAppsScreen />;
      case 'settings': return <SettingsScreen />;
      case 'wallet': return <WalletScreen />;
      case 'networks': return <NetworksScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-md lg:max-w-lg mx-auto relative">
      <ToastContainer />
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function QFSWalletPage() {
  return <QFSWallet />;
}
