'use client';

import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Zap, Share2, BarChart3 } from 'lucide-react';
import { Earth3D } from './Earth3D';
import { FlagsHeader, FlagsFooter } from './Flags';
import { FeatureCard } from './FeatureCard';
import { QFSLogo } from '@/components/dashboard/QFSLogo';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  /** Title shown above the central modal */
  modalTitle?: string;
  /** Subtitle under the title */
  modalSubtitle?: string;
}

export function OnboardingLayout({
  children,
  modalTitle = 'Welcome to your QFS Wallet',
  modalSubtitle,
}: OnboardingLayoutProps) {
  return (
    <div className="onboarding-bg min-h-screen flex flex-col relative">
      {/* Top header bar */}
      <header className="relative z-10 px-6 lg:px-12 py-4 flex items-center justify-between border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <QFSLogo size={36} withGlow />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">QFS Wallet</span>
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/70 font-medium">
              Quantum Financial System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#B0C4DE] uppercase tracking-widest">
            <Globe size={12} className="text-cyan-400" />
            <span>Global Ecosystem</span>
          </div>
          <FlagsHeader />
        </div>
      </header>

      {/* Main 3-column content */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] gap-6 px-6 lg:px-12 py-8 items-center">
        {/* Left column: headline + features */}
        <div className="hidden lg:flex flex-col gap-6 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Welcome to <br />
              <span className="text-gold-gradient">QFS Wallet</span>
            </h1>
            <p className="text-sm text-[#B0C4DE] leading-relaxed mb-6">
              Manage, send and receive your digital assets securely,
              quickly and without borders.
            </p>
            <p className="text-base font-semibold text-cyan-gradient">
              Your financial world, in a single wallet.
            </p>
          </motion.div>

          {/* Feature list (compact) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
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

        {/* Center column: Earth + modal */}
        <div className="flex flex-col items-center justify-center relative">
          {/* Earth 3D behind the modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Earth3D size={420} />
          </motion.div>

          {/* Glass modal on top */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="premium-glass rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10"
          >
            {/* Logo + infinity symbol + title */}
            <div className="flex flex-col items-center text-center mb-5">
              <QFSLogo size={56} withGlow className="mb-2" />
              <span className="text-cyan-400/60 text-lg mb-1">∞</span>
              <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
              {modalSubtitle && (
                <p className="text-xs text-[#B0C4DE] mt-1">{modalSubtitle}</p>
              )}
            </div>

            {children}
          </motion.div>
        </div>

        {/* Right column: feature cards + skyline */}
        <div className="hidden lg:flex flex-col gap-4 max-w-md">
          <div className="text-[10px] text-[#B0C4DE] uppercase tracking-widest flex items-center gap-2">
            <Globe size={12} className="text-cyan-400" />
            <span>Global Ecosystem | One QFS</span>
          </div>

          <p className="text-base font-semibold text-white">
            Your financial world, <br />
            <span className="text-cyan-gradient">in a single wallet.</span>
          </p>

          <div className="space-y-2.5 mt-2">
            <FeatureCard
              icon={ShieldCheck}
              title="Multiple Assets"
              description="Cryptocurrencies, tokens and more."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="Send & Receive"
              description="Fast and secure."
              delay={0.3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Transaction History & Stats"
              description="Full control at all times."
              delay={0.4}
            />
            <FeatureCard
              icon={Share2}
              title="Advanced Security"
              description="Your security is our priority."
              delay={0.5}
            />
          </div>

          {/* City skyline silhouette */}
          <div className="mt-4 h-16 skyline rounded-t-lg opacity-50" />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-4 border-t border-cyan-500/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-[#B0C4DE] uppercase tracking-widest">
            QFS | Connect · Manage · Transform
          </p>
          <div className="flex items-center gap-2 text-[10px] text-cyan-400/80">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 session-dot" />
            <span>Session closed</span>
          </div>
        </div>
        <FlagsFooter />
      </footer>
    </div>
  );
}
