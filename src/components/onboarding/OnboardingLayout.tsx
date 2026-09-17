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
              <span className="text-cyan-gradient">QFS Wallet</span>
            </h1>
            <p className="text-sm text-[#B0C4DE] leading-relaxed mb-4">
              Manage, send and receive your digital assets securely,
              quickly and without borders.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
              <span className="text-gold-gradient text-xs font-bold">★</span>
              <p className="text-sm font-semibold text-cyan-gradient">
                Your financial world, in a single wallet.
              </p>
            </div>
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
            />
            <FeatureCard
              icon={Zap}
              title="Global Transactions"
              description="Fast, secure and borderless."
              delay={0.3}
            />
            <FeatureCard
              icon={Share2}
              title="Multi-Chain"
              description="Multiple networks, one wallet."
              delay={0.4}
            />
            <FeatureCard
              icon={BarChart3}
              title="Total Control"
              description="Your funds, always in your control."
              delay={0.5}
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

          {/* QFS Golden token — floating above the modal, as visual protagonist */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative z-20 mb-2"
          >
            <div
              className="relative"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))' }}
            >
              <QFSLogo size={64} withGlow />
            </div>
          </motion.div>

          {/* Premium glass modal — larger, more elegant */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="premium-glass rounded-3xl p-7 sm:p-10 w-full max-w-lg relative z-10"
            style={{
              boxShadow: `
                0 0 0 1px rgba(6, 182, 212, 0.15) inset,
                0 8px 40px rgba(0, 0, 0, 0.5),
                0 0 100px rgba(6, 182, 212, 0.1),
                0 0 60px rgba(255, 215, 0, 0.05)
              `,
            }}
          >
            {/* Infinity symbol */}
            <div className="flex justify-center mb-2">
              <span className="text-cyan-400/50 text-lg tracking-widest">∞</span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">{modalTitle}</h2>
            {modalSubtitle && (
              <p className="text-xs text-[#B0C4DE] text-center mb-5">{modalSubtitle}</p>
            )}
            {!modalSubtitle && <div className="mb-5" />}

            {children}
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

          {/* Feature cards — more prominent */}
          <div className="space-y-2.5 mt-1">
            <FeatureCard
              icon={Wallet}
              title="Multiple Assets"
              description="Cryptocurrencies, tokens and more."
              delay={0.3}
            />
            <FeatureCard
              icon={Send}
              title="Send & Receive"
              description="Fast and secure."
              delay={0.4}
            />
            <FeatureCard
              icon={BarChart3}
              title="Transaction History & Stats"
              description="Full control at all times."
              delay={0.5}
            />
            <FeatureCard
              icon={Lock}
              title="Advanced Security"
              description="Your security is our priority."
              delay={0.6}
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
