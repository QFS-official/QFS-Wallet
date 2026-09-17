'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface Earth3DProps {
  size?: number;
}

// Professional 3D holographic Earth model
// Uses the official uploaded image — holographic wireframe globe with:
// - Deep electric blue/cyan oceans
// - White outlined continents (wireframe)
// - Bright cyan grid lines (lat/long)
// - White data nodes + connection lines
// - Neon blue glow aura
// - Specular highlights (glassy digital surface)
export function Earth3D({ size = 480 }: Earth3DProps) {
  return (
    <div
      className="earth-3d relative"
      style={{ width: size, height: size }}
    >
      {/* Multi-layer radial glow — electric blue aura */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, rgba(0, 153, 204, 0.08) 40%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'earth-pulse 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-[-8%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, transparent 55%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Holographic Earth image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.4))',
        }}
      >
        <Image
          src="/earth-model.png"
          alt="QFS Global Network — 3D Holographic Earth"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
          loading="eager"
          unoptimized
        />
      </motion.div>

      {/* Orbiting data points ring — gold accents for premium feel */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const r = size * 0.49;
          const x = 50 + Math.cos(rad) * (r / size * 100);
          const y = 50 + Math.sin(rad) * (r / size * 100);
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 4,
                height: 4,
                background: '#FFD700',
                boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </motion.div>

      {/* Outer dashed orbit ring — cyan */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none orbit-rotate"
        style={{
          border: '1px dashed rgba(0, 212, 255, 0.2)',
          animationDuration: '40s',
        }}
      />

      {/* Inner dashed orbit ring — gold, counter-rotate */}
      <div
        className="absolute inset-[8%] rounded-full pointer-events-none orbit-rotate"
        style={{
          border: '1px dashed rgba(255, 215, 0, 0.12)',
          animationDuration: '60s',
          animationDirection: 'reverse',
        }}
      />
    </div>
  );
}
