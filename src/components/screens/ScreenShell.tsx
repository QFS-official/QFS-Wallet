'use client';

import { ChevronLeft } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import type { Screen } from '@/types/wallet';
import { motion } from 'framer-motion';

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  backTo?: Screen;
  children: React.ReactNode;
  maxWidth?: string;
}

// Common wrapper for secondary screens: title + optional back button + content
export function ScreenShell({ title, subtitle, backTo = 'dashboard', children, maxWidth = '4xl' }: ScreenShellProps) {
  const navigate = useWalletStore((s) => s.navigate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-${maxWidth} w-full mx-auto`}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(backTo)}
          className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
