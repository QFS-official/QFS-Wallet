'use client';

import { motion } from 'framer-motion';

interface Earth3DProps {
  size?: number;
}

// Stylized 3D Earth with global connections (SVG-based)
// Navy ocean + gold continent outlines + cyan connection arcs + glowing nodes
export function Earth3D({ size = 220 }: Earth3DProps) {
  // Generate connection arcs between random points on the globe
  const connections = [
    { d: 'M 60 110 Q 110 50 160 80', delay: 0 },
    { d: 'M 40 130 Q 100 100 180 60', delay: 0.5 },
    { d: 'M 80 170 Q 140 140 200 100', delay: 1 },
    { d: 'M 30 90 Q 90 60 150 130', delay: 1.5 },
    { d: 'M 100 50 Q 130 100 180 160', delay: 2 },
    { d: 'M 50 160 Q 110 120 170 70', delay: 2.5 },
  ];

  // Node points (major hubs)
  const nodes = [
    { cx: 60, cy: 110 },
    { cx: 160, cy: 80 },
    { cx: 180, cy: 60 },
    { cx: 80, cy: 170 },
    { cx: 200, cy: 100 },
    { cx: 100, cy: 50 },
    { cx: 130, cy: 130 },
    { cx: 40, cy: 130 },
    { cx: 170, cy: 70 },
  ];

  return (
    <div className="earth-3d" style={{ width: size, height: size }}>
      <div className="earth-3d-glow" />
      <motion.svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <defs>
          {/* Ocean gradient */}
          <radialGradient id="ocean-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0A192F" />
            <stop offset="50%" stopColor="#051429" />
            <stop offset="100%" stopColor="#020B1A" />
          </radialGradient>
          {/* Continent gradient (gold) */}
          <linearGradient id="land-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFB300" stopOpacity="0.4" />
          </linearGradient>
          {/* Connection line gradient */}
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          {/* Atmosphere ring */}
          <radialGradient id="atmos-grad" cx="50%" cy="50%" r="50%">
            <stop offset="92%" stopColor="rgba(6, 182, 212, 0)" />
            <stop offset="96%" stopColor="rgba(6, 182, 212, 0.3)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
          </radialGradient>
        </defs>

        {/* Atmosphere */}
        <circle cx="110" cy="110" r="105" fill="url(#atmos-grad)" />

        {/* Ocean sphere */}
        <circle cx="110" cy="110" r="95" fill="url(#ocean-grad)" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />

        {/* Latitude/longitude grid lines */}
        <g stroke="rgba(6, 182, 212, 0.12)" fill="none" strokeWidth="0.5">
          <ellipse cx="110" cy="110" rx="95" ry="20" />
          <ellipse cx="110" cy="110" rx="95" ry="45" />
          <ellipse cx="110" cy="110" rx="95" ry="70" />
          <ellipse cx="110" cy="110" rx="20" ry="95" />
          <ellipse cx="110" cy="110" rx="45" ry="95" />
          <ellipse cx="110" cy="110" rx="70" ry="95" />
        </g>

        {/* Continents (stylized gold shapes) */}
        <g fill="url(#land-grad)" opacity="0.85">
          <path d="M 50 70 Q 70 55 90 65 Q 100 75 95 90 Q 80 100 65 95 Q 45 90 50 70 Z" />
          <path d="M 80 120 Q 95 130 100 150 Q 90 170 75 165 Q 70 145 80 120 Z" />
          <path d="M 115 60 Q 135 55 145 70 Q 140 85 125 85 Q 110 80 115 60 Z" />
          <path d="M 120 95 Q 140 100 145 120 Q 135 145 125 145 Q 110 130 115 110 Q 115 100 120 95 Z" />
          <path d="M 150 55 Q 180 65 185 85 Q 175 95 160 90 Q 145 80 150 55 Z" />
          <path d="M 165 140 Q 180 145 175 155 Q 165 158 160 150 Q 160 145 165 140 Z" />
        </g>

        {/* Connection lines (animated arcs) */}
        <g
          fill="none"
          stroke="url(#conn-grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        >
          {connections.map((c, i) => (
            <motion.path
              key={i}
              d={c.d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{
                duration: 2,
                delay: c.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 1,
              }}
              className="connection-line"
            />
          ))}
        </g>

        {/* Glowing nodes */}
        <g>
          {nodes.map((n, i) => (
            <motion.circle
              key={i}
              cx={n.cx}
              cy={n.cy}
              r="2.5"
              fill="#00D4FF"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{ filter: 'drop-shadow(0 0 4px #00D4FF)' }}
            />
          ))}
        </g>

        {/* Outer ring (orbit) */}
        <motion.circle
          cx="110"
          cy="110"
          r="100"
          fill="none"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="1"
          strokeDasharray="2 6"
          className="orbit-rotate"
          style={{ transformOrigin: '110px 110px' }}
        />
      </motion.svg>
    </div>
  );
}
