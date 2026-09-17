'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="feature-card rounded-xl p-3 flex items-center gap-3 cursor-pointer group"
    >
      <div className="gold-icon w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        <p className="text-[11px] text-[#B0C4DE] truncate">{description}</p>
      </div>
      <ChevronRight
        size={14}
        className="text-cyan-400/40 group-hover:text-cyan-400 transition-colors shrink-0"
      />
    </motion.div>
  );
}
