'use client';

import Image from 'next/image';

interface TokenIconProps {
  symbol: string;
  size?: number;
  color?: string;
  className?: string;
}

// Color circle + first letter fallback (used when no logo asset)
function ColorCircle({ symbol, size, color }: { symbol: string; size: number; color: string }) {
  const letter = symbol.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        boxShadow: `0 0 12px ${color}33`,
        fontSize: size * 0.42,
      }}
    >
      {letter}
    </div>
  );
}

const LOGO_MAP: Record<string, string> = {
  QFS: '/qfs-logo-official.png',
  GCRM: '/gcrm-logo-official.png',
  AlA: '/ala-logo-official.png',
  TRAEX: '/traex-logo-official.png',
  ETH: '/eth-token-logo.png',
  BNB: '/bnb-token-logo.png',
  SOL: '/sol-token-logo.png',
  POL: '/pol-token-logo.png',
  USDT: '/usdt-token-logo.png',
  USDC: '/usdt-token-logo.png', // fallback close enough
};

const COLOR_MAP: Record<string, string> = {
  QFS: '#06B6D4',
  GCRM: '#F59E0B',
  AlA: '#8B5CF6',
  TRAEX: '#EC4899',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  SOL: '#9945FF',
  POL: '#8247E5',
  USDT: '#26A17B',
  USDC: '#2775CA',
  BTC: '#F7931A',
};

export function TokenIcon({ symbol, size = 36, color, className = '' }: TokenIconProps) {
  const logoPath = LOGO_MAP[symbol];
  const resolvedColor = color || COLOR_MAP[symbol] || '#06B6D4';

  if (logoPath) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 12px ${resolvedColor}22`,
        }}
      >
        <Image
          src={logoPath}
          alt={`${symbol} logo`}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }
  return <ColorCircle symbol={symbol} size={size} color={resolvedColor} />;
}
