'use client';

import { motion } from 'framer-motion';

interface Earth3DProps {
  size?: number;
}

// Professional, technological, luminous 3D Earth
// Navy ocean + gold continent outlines + cyan data grid + glowing connection nodes
// Hexagonal tech grid overlay + radial glow + orbiting data points
export function Earth3D({ size = 260 }: Earth3DProps) {
  // More connection arcs — global network feel
  const connections = [
    { d: 'M 55 95 Q 110 40 165 75', delay: 0, dur: 2.5 },
    { d: 'M 35 130 Q 100 95 185 55', delay: 0.3, dur: 3 },
    { d: 'M 75 175 Q 140 140 200 95', delay: 0.6, dur: 2.8 },
    { d: 'M 25 85 Q 85 55 155 125', delay: 0.9, dur: 3.2 },
    { d: 'M 105 45 Q 135 95 180 165', delay: 1.2, dur: 2.6 },
    { d: 'M 45 165 Q 115 120 170 65', delay: 1.5, dur: 3 },
    { d: 'M 60 50 Q 120 90 190 130', delay: 0.4, dur: 2.7 },
    { d: 'M 30 145 Q 90 110 175 170', delay: 1.0, dur: 3.1 },
    { d: 'M 120 35 Q 100 80 60 170', delay: 0.7, dur: 2.9 },
    { d: 'M 180 45 Q 150 100 95 175', delay: 1.3, dur: 3.3 },
  ];

  // More nodes — major global hubs
  const nodes = [
    { cx: 55, cy: 95, r: 3 },
    { cx: 165, cy: 75, r: 3 },
    { cx: 185, cy: 55, r: 2.5 },
    { cx: 75, cy: 175, r: 3 },
    { cx: 200, cy: 95, r: 2.5 },
    { cx: 100, cy: 45, r: 3 },
    { cx: 130, cy: 130, r: 2.5 },
    { cx: 40, cy: 130, r: 3 },
    { cx: 170, cy: 65, r: 2.5 },
    { cx: 90, cy: 60, r: 2 },
    { cx: 145, cy: 155, r: 2.5 },
    { cx: 60, cy: 50, r: 2 },
    { cx: 190, cy: 130, r: 2.5 },
    { cx: 115, cy: 175, r: 2 },
  ];

  // Orbiting data points
  const orbitPoints = [
    { angle: 0, r: 102 },
    { angle: 72, r: 102 },
    { angle: 144, r: 102 },
    { angle: 216, r: 102 },
    { angle: 288, r: 102 },
  ];

  return (
    <div className="earth-3d" style={{ width: size, height: size }}>
      {/* Multi-layer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(255, 215, 0, 0.05) 40%, transparent 70%)',
          filter: 'blur(20px)',
          animation: 'earth-pulse 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-[-10%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      <motion.svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          {/* Deep navy ocean with subtle blue gradient */}
          <radialGradient id="ocean-grad-pro" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#0F2A4A" />
            <stop offset="40%" stopColor="#0A1E36" />
            <stop offset="80%" stopColor="#051429" />
            <stop offset="100%" stopColor="#020B1A" />
          </radialGradient>

          {/* Gold continent gradient — more vivid */}
          <linearGradient id="land-grad-pro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE45C" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFB300" stopOpacity="0.35" />
          </linearGradient>

          {/* Cyan connection gradient */}
          <linearGradient id="conn-grad-pro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#7DE5FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#00D4FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0099CC" stopOpacity="0.5" />
          </linearGradient>

          {/* Atmosphere — stronger cyan ring */}
          <radialGradient id="atmos-grad-pro" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="rgba(6, 182, 212, 0)" />
            <stop offset="93%" stopColor="rgba(6, 182, 212, 0.35)" />
            <stop offset="97%" stopColor="rgba(0, 212, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
          </radialGradient>

          {/* Inner highlight (specular light) */}
          <radialGradient id="spec-grad" cx="30%" cy="25%" r="35%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="50%" stopColor="rgba(125, 229, 255, 0.05)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* Glow filter for nodes */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gold glow filter */}
          <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer atmosphere glow */}
        <circle cx="110" cy="110" r="108" fill="url(#atmos-grad-pro)" />

        {/* Main ocean sphere */}
        <circle
          cx="110"
          cy="110"
          r="95"
          fill="url(#ocean-grad-pro)"
          stroke="rgba(0, 212, 255, 0.4)"
          strokeWidth="1"
        />

        {/* Specular highlight (top-left light) */}
        <circle cx="110" cy="110" r="95" fill="url(#spec-grad)" />

        {/* Tech grid — hexagonal pattern */}
        <g stroke="rgba(0, 212, 255, 0.1)" fill="none" strokeWidth="0.5">
          {/* Latitudes */}
          <ellipse cx="110" cy="110" rx="95" ry="15" />
          <ellipse cx="110" cy="110" rx="95" ry="35" />
          <ellipse cx="110" cy="110" rx="95" ry="55" />
          <ellipse cx="110" cy="110" rx="95" ry="75" />
          {/* Longitudes */}
          <ellipse cx="110" cy="110" rx="15" ry="95" />
          <ellipse cx="110" cy="110" rx="35" ry="95" />
          <ellipse cx="110" cy="110" rx="55" ry="95" />
          <ellipse cx="110" cy="110" rx="75" ry="95" />
          {/* Diagonal grid lines */}
          <line x1="30" y1="30" x2="190" y2="190" stroke="rgba(0, 212, 255, 0.05)" />
          <line x1="190" y1="30" x2="30" y2="190" stroke="rgba(0, 212, 255, 0.05)" />
        </g>

        {/* Continents — more detailed gold shapes with glow */}
        <g fill="url(#land-grad-pro)" filter="url(#gold-glow)" opacity="0.9">
          {/* North America */}
          <path d="M 45 65 Q 65 50 85 55 Q 100 60 105 75 Q 100 90 85 95 Q 70 100 55 95 Q 40 85 45 65 Z" />
          {/* Central America connection */}
          <path d="M 75 95 Q 85 100 90 110 Q 85 115 80 110 Q 72 105 75 95 Z" />
          {/* South America */}
          <path d="M 80 115 Q 95 125 100 145 Q 95 165 82 170 Q 72 160 75 140 Q 75 125 80 115 Z" />
          {/* Europe */}
          <path d="M 115 55 Q 135 50 145 65 Q 140 78 128 80 Q 115 75 115 55 Z" />
          {/* Africa */}
          <path d="M 118 85 Q 138 90 145 110 Q 142 135 128 148 Q 115 138 112 118 Q 112 95 118 85 Z" />
          {/* Middle East */}
          <path d="M 148 70 Q 158 72 162 82 Q 158 90 150 88 Q 145 80 148 70 Z" />
          {/* Asia (large) */}
          <path d="M 148 50 Q 175 55 188 75 Q 185 90 170 92 Q 155 85 148 70 Q 145 55 148 50 Z" />
          {/* Southeast Asia */}
          <path d="M 170 100 Q 182 102 185 112 Q 180 118 172 115 Q 168 108 170 100 Z" />
          {/* Australia */}
          <path d="M 165 140 Q 180 143 178 153 Q 168 158 162 152 Q 160 146 165 140 Z" />
          {/* Japan */}
          <path d="M 195 80 Q 200 82 198 88 Q 193 90 192 85 Q 192 80 195 80 Z" />
        </g>

        {/* Continent outline (gold stroke) */}
        <g
          fill="none"
          stroke="rgba(255, 215, 0, 0.5)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        >
          <path d="M 45 65 Q 65 50 85 55 Q 100 60 105 75 Q 100 90 85 95 Q 70 100 55 95 Q 40 85 45 65 Z" />
          <path d="M 80 115 Q 95 125 100 145 Q 95 165 82 170 Q 72 160 75 140 Q 75 125 80 115 Z" />
          <path d="M 115 55 Q 135 50 145 65 Q 140 78 128 80 Q 115 75 115 55 Z" />
          <path d="M 118 85 Q 138 90 145 110 Q 142 135 128 148 Q 115 138 112 118 Q 112 95 118 85 Z" />
          <path d="M 148 50 Q 175 55 188 75 Q 185 90 170 92 Q 155 85 148 70 Q 145 55 148 50 Z" />
          <path d="M 165 140 Q 180 143 178 153 Q 168 158 162 152 Q 160 146 165 140 Z" />
        </g>

        {/* Connection lines — more arcs with flow animation */}
        <g
          fill="none"
          stroke="url(#conn-grad-pro)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {connections.map((c, i) => (
            <motion.path
              key={i}
              d={c.d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.9, 0.5] }}
              transition={{
                duration: c.dur,
                delay: c.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 0.5,
              }}
              strokeDasharray="3 3"
            />
          ))}
        </g>

        {/* Glowing nodes with halo */}
        <g>
          {nodes.map((n, i) => (
            <g key={i}>
              {/* Halo ring */}
              <motion.circle
                cx={n.cx}
                cy={n.cy}
                r={n.r + 3}
                fill="none"
                stroke="rgba(0, 212, 255, 0.3)"
                strokeWidth="0.5"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
              />
              {/* Node dot */}
              <motion.circle
                cx={n.cx}
                cy={n.cy}
                r={n.r}
                fill="#00D4FF"
                filter="url(#node-glow)"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2,
                  delay: i * 0.12,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
              {/* Inner bright dot */}
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r * 0.4}
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>
          ))}
        </g>

        {/* Orbiting data points on outer ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '110px 110px' }}
        >
          {orbitPoints.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = 110 + Math.cos(rad) * p.r;
            const y = 110 + Math.sin(rad) * p.r;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#FFD700"
                filter="url(#gold-glow)"
                opacity="0.7"
              />
            );
          })}
        </motion.g>

        {/* Outer dashed orbit ring */}
        <circle
          cx="110"
          cy="110"
          r="102"
          fill="none"
          stroke="rgba(0, 212, 255, 0.2)"
          strokeWidth="0.5"
          strokeDasharray="3 6"
          className="orbit-rotate"
          style={{ transformOrigin: '110px 110px', animationDuration: '40s' }}
        />

        {/* Inner dashed ring */}
        <circle
          cx="110"
          cy="110"
          r="88"
          fill="none"
          stroke="rgba(255, 215, 0, 0.1)"
          strokeWidth="0.5"
          strokeDasharray="2 8"
          className="orbit-rotate"
          style={{ transformOrigin: '110px 110px', animationDuration: '60s', animationDirection: 'reverse' }}
        />
      </motion.svg>
    </div>
  );
}
