'use client';

import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Zap, Share2, BarChart3, Wallet, Send, Lock } from 'lucide-react';
import { Earth3D } from './Earth3D';
import { FlagsHeader, FlagsFooter } from './Flags';
import { FeatureCard } from './FeatureCard';
import { QFSLogo } from '@/components/dashboard/QFSLogo';
import type { LucideIcon } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  modalTitle?: string;
  modalSubtitle?: string;
  onReset?: () => void;
}

// Flag chip with label
function FlagWithLabel({ code, label, emoji }: { code: string; label: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-6 rounded-md overflow-hidden flex items-center justify-center border border-cyan-400/30 bg-white/5 shadow-sm"
        style={{ boxShadow: '0 0 8px rgba(0, 212, 255, 0.15)' }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji}</span>
      </div>
      <span className="text-[8px] text-[#B0C4DE]/70 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

// Primary flags with labels
function PrimaryFlags() {
  const flags: { code: string; label: string; emoji: string }[] = [
    { code: 'US', label: 'United States', emoji: '🇺🇸' },
    { code: 'AE', label: 'UAE', emoji: '🇦🇪' },
    { code: 'EU', label: 'European Union', emoji: '🇪🇺' },
    { code: 'CH', label: 'Switzerland', emoji: '🇨🇭' },
    { code: 'CN', label: 'China', emoji: '🇨🇳' },
  ];
  return (
    <div className="flex items-end gap-4">
      {flags.map((f) => (
        <FlagWithLabel key={f.code} {...f} />
      ))}
    </div>
  );
}

export function OnboardingLayout({
  children,
  modalTitle = 'Welcome to your QFS Wallet',
  modalSubtitle,
  onReset,
}: OnboardingLayoutProps) {
  return (
    <div className="onboarding-bg min-h-screen flex flex-col relative">
      {/* ─── Top header ─────────────────────────────────── */}
      <header className="relative z-20 px-6 lg:px-10 py-4 flex items-center justify-between border-b border-cyan-500/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <QFSLogo size={40} withGlow />
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">QFS Wallet</span>
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/70 font-medium">
              Quantum Financial System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#B0C4DE] uppercase tracking-widest font-medium">
            <Globe size={12} className="text-cyan-400" />
            <span>Global Ecosystem</span>
            <span className="text-gold-gradient font-bold mx-1">|</span>
            <span>One QFS</span>
          </div>
          <PrimaryFlags />
        </div>
      </header>

      {/* ─── Main 3-column content ──────────────────────── */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1fr] gap-4 lg:gap-6 px-4 lg:px-10 py-6 items-center min-h-[600px]">
        {/* ─── Left column: headline + features ──────────── */}
        <div className="hidden lg:flex flex-col gap-5 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3">
              Welcome to <br />
              <span className="text-gold-gradient">QFS Wallet</span>
            </h1>
            <p className="text-sm text-[#B0C4DE] leading-relaxed mb-4">
              Manage, send and receive your digital assets securely,
              quickly and without borders.
            </p>
            <p className="text-lg font-bold text-cyan-gradient mb-1">
              Your financial world, in a single wallet.
            </p>
          </motion.div>

          {/* Feature list — more prominent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-2.5"
          >
            <FeatureCard
              icon={ShieldCheck}
              title="Advanced Security"
              description="Your assets are your first priority."
              delay={0.2}
              variant="cyan"
            />
            <FeatureCard
              icon={Zap}
              title="Global Transactions"
              description="Fast, secure and borderless."
              delay={0.3}
              variant="cyan"
            />
            <FeatureCard
              icon={Share2}
              title="Multi-Chain"
              description="Multiple networks, one wallet."
              delay={0.4}
              variant="cyan"
            />
            <FeatureCard
              icon={BarChart3}
              title="Total Control"
              description="Your funds, always in your control."
              delay={0.5}
              variant="cyan"
            />
          </motion.div>
        </div>

        {/* ─── Center column: Earth + QFS token + modal ──── */}
        <div className="flex flex-col items-center justify-center relative">
          {/* 3D Earth — large, behind the modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Earth3D size={480} />
          </motion.div>

          {/* Premium glass modal — matching reference design exactly */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="premium-glass rounded-[24px] p-8 sm:p-10 w-full max-w-md relative z-10"
            style={{
              boxShadow: `
                0 0 0 1px rgba(0, 212, 255, 0.2) inset,
                0 0 0 2px rgba(0, 212, 255, 0.08),
                0 12px 48px rgba(0, 0, 0, 0.5),
                0 0 100px rgba(0, 212, 255, 0.08),
                0 0 60px rgba(255, 215, 0, 0.04)
              `,
            }}
          >
            {/* ─── QFS Golden Logo — hexagonal, centered ─── */}
            <div className="flex justify-center mb-3">
              <div
                style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.5))' }}
              >
                <QFSLogo size={56} withGlow />
              </div>
            </div>

            {/* ─── Title: "QFS Wallet" — white + cyan ─── */}
            <h2 className="text-2xl font-bold text-center mb-1">
              <span className="text-white">QFS </span>
              <span className="text-cyan-400">Wallet</span>
            </h2>

            {/* ─── Subtitle: "QUANTUM FINANCIAL SYSTEM" — gold with decorative lines ─── */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/50" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400/80 font-medium">
                Quantum Financial System
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/50" />
            </div>

            {/* ─── Divider line ─── */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent mb-5" />

            {/* ─── Modal title + subtitle ─── */}
            {modalTitle !== 'Welcome to your QFS Wallet' && (
              <p className="text-sm font-semibold text-white text-center mb-1">{modalTitle}</p>
            )}
            {modalSubtitle && (
              <p className="text-xs text-[#B0C4DE]/70 text-center italic mb-1">{modalSubtitle}</p>
            )}
            <p className="text-[10px] text-[#B0C4DE]/50 text-center italic mb-5">
              Your private keys never leave your device.
            </p>

            {/* ─── Children content (PIN input, buttons, etc.) ─── */}
            {children}

            {/* ─── Bottom divider ─── */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent mt-5 mb-3" />

            {/* ─── Footer: Reset link ─── */}
            <div className="flex items-center justify-center gap-1.5 text-xs">
              <span className="text-[#B0C4DE]/50">?</span>
              <span className="text-[#B0C4DE]/60">Forgot your PIN?</span>
              <button
                onClick={onReset}
                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                Reset it
              </button>
            </div>
          </motion.div>
        </div>

        {/* ─── Right column: feature cards + skyline ─────── */}
        <div className="hidden lg:flex flex-col gap-4 max-w-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] text-[#B0C4DE] uppercase tracking-widest flex items-center gap-2"
          >
            <Globe size={12} className="text-cyan-400" />
            <span>Global Ecosystem | One QFS</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-base font-semibold text-white"
          >
            Your financial world, <br />
            <span className="text-cyan-gradient">in a single wallet.</span>
          </motion.p>

          {/* Feature cards — gold variant for right column */}
          <div className="space-y-2.5 mt-1">
            <FeatureCard
              icon={Wallet}
              title="Multiple Assets"
              description="Cryptocurrencies, tokens and more."
              delay={0.3}
              variant="gold"
            />
            <FeatureCard
              icon={Send}
              title="Send & Receive"
              description="Fast and secure."
              delay={0.4}
              variant="gold"
            />
            <FeatureCard
              icon={BarChart3}
              title="Transaction History & Stats"
              description="Full control at all times."
              delay={0.5}
              variant="gold"
            />
            <FeatureCard
              icon={Lock}
              title="Advanced Security"
              description="Your security is our priority."
              delay={0.6}
              variant="gold"
            />
          </div>

          {/* City skyline silhouette with cyan windows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.6 }}
            className="mt-2 h-20 skyline rounded-t-lg"
          />
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="relative z-20 px-6 lg:px-10 py-4 border-t border-cyan-500/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-[#B0C4DE] uppercase tracking-widest font-medium">
            QFS | <span className="text-cyan-400">Connect</span> ·{' '}
            <span className="text-cyan-400">Manage</span> ·{' '}
            <span className="text-cyan-400">Transform</span>
          </p>
          <div className="flex items-center gap-2 text-[10px] text-cyan-400/80 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 session-dot" />
            <span>Session closed</span>
          </div>
        </div>
        <FlagsFooter />
      </footer>
    </div>
  );
}
