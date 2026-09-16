'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface QFSLogoProps {
  size?: number;
  withGlow?: boolean;
  withOrbit?: boolean;
  className?: string;
}

// Official QFS Quantum Symbol — 3D isometric cube with cyan→deep-blue gradient.
// Used as the APP branding (sidebar top-left, hero centerpiece, header avatar).
// For the QFS TOKEN logo (gold coin with "QFS" letters), see TokenIcon component.
export function QFSLogo({ size = 96, withGlow = true, withOrbit = false, className = '' }: QFSLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {withOrbit && (
        <>
          <div
            className="absolute inset-0 spin-slow"
            style={{
              borderRadius: '50%',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              boxShadow: 'inset 0 0 24px rgba(6, 182, 212, 0.08)',
            }}
          />
          <div
            className="absolute"
            style={{
              inset: '12%',
              borderRadius: '50%',
              border: '1px dashed rgba(59, 130, 246, 0.2)',
            }}
          />
        </>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative ${withGlow ? 'qfs-logo-glow' : ''}`}
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: '14%',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/qfs-app-logo.png"
          alt="QFS Quantum Symbol"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
          loading="eager"
          unoptimized
        />
      </motion.div>
    </div>
  );
}
