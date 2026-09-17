'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  variant?: 'cyan' | 'gold';
}

export function FeatureCard({ icon: Icon, title, description, delay = 0, variant = 'cyan' }: FeatureCardProps) {
  const color = variant === 'gold' ? '#FFD700' : '#00D4FF';
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="feature-card rounded-xl p-3 flex items-center gap-3 cursor-pointer group"
    >
      {/* Neon-outlined icon — cyan or gold, NOT solid yellow */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `${color}0D`,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 12px ${color}20`,
        }}
      >
        <Icon size={18} color={color} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        <p className="text-[11px] text-[#B0C4DE] truncate">{description}</p>
      </div>
      <ChevronRight
        size={14}
        style={{ color: `${color}66` }}
        className="group-hover:opacity-100 opacity-50 transition-opacity shrink-0"
      />
    </motion.div>
  );
}
