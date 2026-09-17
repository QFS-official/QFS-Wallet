'use client';

import { motion } from 'framer-motion';

interface Earth3DProps {
  size?: number;
}

// Pure SVG/CSS 3D holographic Earth — no rectangular image
// Layers: ocean sphere → grid → continents → nodes → connections → glow → QFS token
export function Earth3D({ size = 480 }: Earth3DProps) {
  // Continent paths (simplified outlines, gold stroke)
  const continents = [
    // North America
    'M 48 68 Q 68 52 88 56 Q 102 62 106 76 Q 100 92 84 96 Q 68 100 52 92 Q 42 82 48 68 Z',
    // South America
    'M 82 112 Q 96 122 100 142 Q 94 162 80 166 Q 70 156 74 136 Q 76 120 82 112 Z',
    // Europe
    'M 114 54 Q 134 50 144 64 Q 138 76 126 78 Q 114 72 114 54 Z',
    // Africa
    'M 118 84 Q 138 88 144 108 Q 140 132 126 144 Q 114 134 112 114 Q 112 92 118 84 Z',
    // Middle East
    'M 146 68 Q 156 70 160 80 Q 154 88 148 86 Q 142 78 146 68 Z',
    // Asia
    'M 148 48 Q 176 54 188 72 Q 184 88 168 90 Q 154 82 148 66 Q 144 52 148 48 Z',
    // Southeast Asia
    'M 168 98 Q 180 100 183 110 Q 176 116 170 112 Q 166 104 168 98 Z',
    // Australia
    'M 164 138 Q 178 141 176 151 Q 166 156 162 150 Q 160 144 164 138 Z',
    // Japan
    'M 194 78 Q 199 80 197 86 Q 192 88 191 84 Q 191 80 194 78 Z',
    // Greenland
    'M 96 38 Q 112 36 118 46 Q 112 54 100 52 Q 92 46 96 38 Z',
  ];

  // Data nodes (white dots) at major global hubs
  const nodes = [
    { cx: 58, cy: 72, r: 2 },
    { cx: 92, cy: 82, r: 1.8 },
    { cx: 130, cy: 62, r: 2 },
    { cx: 130, cy: 108, r: 1.8 },
    { cx: 168, cy: 72, r: 2 },
    { cx: 178, cy: 104, r: 1.5 },
    { cx: 80, cy: 130, r: 2 },
    { cx: 145, cy: 128, r: 1.8 },
    { cx: 108, cy: 44, r: 1.5 },
    { cx: 40, cy: 100, r: 1.8 },
    { cx: 188, cy: 80, r: 1.5 },
    { cx: 170, cy: 145, r: 1.5 },
    { cx: 100, cy: 92, r: 1.5 },
    { cx: 155, cy: 92, r: 1.5 },
    { cx: 65, cy: 145, r: 1.8 },
  ];

  // Connection arcs (cyan, animated flow)
  const connections = [
    { d: 'M 58 72 Q 95 35 130 62', delay: 0, dur: 3 },
    { d: 'M 130 62 Q 160 40 188 80', delay: 0.3, dur: 2.8 },
    { d: 'M 58 72 Q 70 110 92 82', delay: 0.5, dur: 3.2 },
    { d: 'M 92 82 Q 110 95 130 108', delay: 0.8, dur: 2.6 },
    { d: 'M 130 108 Q 150 120 168 72', delay: 1.0, dur: 3 },
    { d: 'M 130 62 Q 120 85 100 92', delay: 1.2, dur: 2.8 },
    { d: 'M 168 72 Q 180 90 178 104', delay: 1.5, dur: 3.2 },
    { d: 'M 130 108 Q 140 130 145 128', delay: 1.8, dur: 2.6 },
    { d: 'M 80 130 Q 90 140 65 145', delay: 0.6, dur: 3 },
    { d: 'M 40 100 Q 50 130 80 130', delay: 1.4, dur: 3.4 },
    { d: 'M 145 128 Q 160 140 170 145', delay: 2.0, dur: 2.8 },
    { d: 'M 108 44 Q 120 55 130 62', delay: 0.9, dur: 2.5 },
  ];

  // Gold QFS token position (floating, top-right of globe)
  const tokenX = 170;
  const tokenY = 40;
  const tokenSize = 18;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* ─── Multi-layer radial glow (electric blue aura) ─── */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.18) 0%, rgba(0, 153, 204, 0.06) 40%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'earth-pulse 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-[-10%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 55%)',
          filter: 'blur(45px)',
        }}
      />

      {/* ─── Main SVG globe ─── */}
      <motion.svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <defs>
          {/* Deep electric blue ocean */}
          <radialGradient id="ocean-holo" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#0F3A5C" />
            <stop offset="30%" stopColor="#0A2A4A" />
            <stop offset="60%" stopColor="#051A30" />
            <stop offset="100%" stopColor="#020E1C" />
          </radialGradient>

          {/* Gold continent gradient */}
          <linearGradient id="gold-cont" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE45C" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFB300" stopOpacity="0.4" />
          </linearGradient>

          {/* Cyan connection gradient */}
          <linearGradient id="cyan-conn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7DE5FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.7" />
          </linearGradient>

          {/* Atmosphere ring */}
          <radialGradient id="atmos-holo" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="rgba(0, 212, 255, 0)" />
            <stop offset="93%" stopColor="rgba(0, 212, 255, 0.35)" />
            <stop offset="97%" stopColor="rgba(0, 153, 204, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
          </radialGradient>

          {/* Specular highlight (top-left light reflection) */}
          <radialGradient id="spec-holo" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="40%" stopColor="rgba(125, 229, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* Glow filters */}
          <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Atmosphere glow ring */}
        <circle cx="110" cy="110" r="108" fill="url(#atmos-holo)" />

        {/* Ocean sphere */}
        <circle
          cx="110" cy="110" r="95"
          fill="url(#ocean-holo)"
          stroke="rgba(0, 212, 255, 0.35)"
          strokeWidth="1"
        />

        {/* Specular highlight */}
        <circle cx="110" cy="110" r="95" fill="url(#spec-holo)" />

        {/* Tech grid — latitude/longitude */}
        <g stroke="rgba(0, 212, 255, 0.12)" fill="none" strokeWidth="0.5">
          <ellipse cx="110" cy="110" rx="95" ry="15" />
          <ellipse cx="110" cy="110" rx="95" ry="35" />
          <ellipse cx="110" cy="110" rx="95" ry="55" />
          <ellipse cx="110" cy="110" rx="95" ry="75" />
          <ellipse cx="110" cy="110" rx="15" ry="95" />
          <ellipse cx="110" cy="110" rx="35" ry="95" />
          <ellipse cx="110" cy="110" rx="55" ry="95" />
          <ellipse cx="110" cy="110" rx="75" ry="95" />
          <line x1="25" y1="25" x2="195" y2="195" stroke="rgba(0, 212, 255, 0.05)" />
          <line x1="195" y1="25" x2="25" y2="195" stroke="rgba(0, 212, 255, 0.05)" />
        </g>

        {/* Continents — gold outlines (wireframe style) */}
        <g fill="url(#gold-cont)" fillOpacity="0.15" stroke="url(#gold-cont)" strokeWidth="1" strokeLinejoin="round" filter="url(#glow-gold)">
          {continents.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Continent outlines — brighter gold stroke */}
        <g fill="none" stroke="rgba(255, 215, 0, 0.5)" strokeWidth="0.8" strokeLinejoin="round">
          {continents.map((d, i) => (
            <path key={`outline-${i}`} d={d} />
          ))}
        </g>

        {/* Connection arcs — cyan, animated */}
        <g fill="none" stroke="url(#cyan-conn)" strokeWidth="1.2" strokeLinecap="round">
          {connections.map((c, i) => (
            <motion.path
              key={i}
              d={c.d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.9, 0.4] }}
              transition={{
                duration: c.dur,
                delay: c.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 0.3,
              }}
              strokeDasharray="3 3"
            />
          ))}
        </g>

        {/* Data nodes — white with glow + halo */}
        <g>
          {nodes.map((n, i) => (
            <g key={i}>
              {/* Expanding halo */}
              <motion.circle
                cx={n.cx} cy={n.cy}
                r={n.r + 2}
                fill="none"
                stroke="rgba(0, 212, 255, 0.25)"
                strokeWidth="0.5"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.12,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
              />
              {/* White node dot */}
              <motion.circle
                cx={n.cx} cy={n.cy}
                r={n.r}
                fill="#FFFFFF"
                filter="url(#glow-node)"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            </g>
          ))}
        </g>

        {/* QFS golden token — hexagonal, floating near the globe */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))' }}
        >
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Hexagonal QFS token */}
            <polygon
              points={`${tokenX},${tokenY - tokenSize} ${tokenX + tokenSize * 0.87},${tokenY - tokenSize * 0.5} ${tokenX + tokenSize * 0.87},${tokenY + tokenSize * 0.5} ${tokenX},${tokenY + tokenSize} ${tokenX - tokenSize * 0.87},${tokenY + tokenSize * 0.5} ${tokenX - tokenSize * 0.87},${tokenY - tokenSize * 0.5}`}
              fill="url(#gold-cont)"
              stroke="#FFD700"
              strokeWidth="1.5"
              filter="url(#glow-strong)"
            />
            {/* Inner hexagon */}
            <polygon
              points={`${tokenX},${tokenY - tokenSize * 0.6} ${tokenX + tokenSize * 0.52},${tokenY - tokenSize * 0.3} ${tokenX + tokenSize * 0.52},${tokenY + tokenSize * 0.3} ${tokenX},${tokenY + tokenSize * 0.6} ${tokenX - tokenSize * 0.52},${tokenY + tokenSize * 0.3} ${tokenX - tokenSize * 0.52},${tokenY - tokenSize * 0.3}`}
              fill="#020E1C"
              stroke="rgba(255, 215, 0, 0.5)"
              strokeWidth="0.5"
            />
            {/* Q letter */}
            <text
              x={tokenX} y={tokenY + 2}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#FFD700"
              fontFamily="sans-serif"
            >Q</text>
          </motion.g>
        </motion.g>

        {/* Outer dashed orbit ring — cyan */}
        <circle
          cx="110" cy="110" r="102"
          fill="none"
          stroke="rgba(0, 212, 255, 0.2)"
          strokeWidth="0.5"
          strokeDasharray="3 6"
          className="orbit-rotate"
          style={{ transformOrigin: '110px 110px', animationDuration: '40s' }}
        />

        {/* Inner dashed orbit ring — gold, counter-rotate */}
        <circle
          cx="110" cy="110" r="86"
          fill="none"
          stroke="rgba(255, 215, 0, 0.1)"
          strokeWidth="0.5"
          strokeDasharray="2 8"
          className="orbit-rotate"
          style={{ transformOrigin: '110px 110px', animationDuration: '60s', animationDirection: 'reverse' }}
        />
      </motion.svg>

      {/* Orbiting gold data points (outer ring) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const r = 48;
          const x = 50 + Math.cos(rad) * r;
          const y = 50 + Math.sin(rad) * r;
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
                boxShadow: '0 0 8px rgba(255, 215, 0, 0.7)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
