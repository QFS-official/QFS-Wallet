'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { TokenIcon } from '@/components/dashboard/TokenIcon';
import { Sparkline } from '@/components/dashboard/Sparkline';
import { generateSparkline } from '@/lib/wallet/tokens';

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  color: string;
  favorite: boolean;
}

const INITIAL_MARKETS: MarketItem[] = [
  { symbol: 'QFS', name: 'QFS Token', price: 0.91, change24h: 12.4, marketCap: 91_000_000, volume24h: 8_500_000, color: '#06B6D4', favorite: true },
  { symbol: 'GCRM', name: 'Global Currency Restart Master', price: 0.10, change24h: 8.7, marketCap: 14_582_000, volume24h: 480_000, color: '#F59E0B', favorite: false },
  { symbol: 'AlA', name: 'AlArab', price: 0.30, change24h: 5.3, marketCap: 18_744_000, volume24h: 620_000, color: '#8B5CF6', favorite: false },
  { symbol: 'TRAEX', name: 'TRAEX Token', price: 0.30, change24h: -2.4, marketCap: 5_475_000, volume24h: 220_000, color: '#EC4899', favorite: false },
  { symbol: 'BTC', name: 'Bitcoin', price: 67_240.55, change24h: 2.1, marketCap: 1_320_000_000_000, volume24h: 24_000_000_000, color: '#F7931A', favorite: true },
  { symbol: 'ETH', name: 'Ethereum', price: 3_245.67, change24h: -1.3, marketCap: 390_000_000_000, volume24h: 14_000_000_000, color: '#627EEA', favorite: false },
  { symbol: 'SOL', name: 'Solana', price: 168.42, change24h: 5.7, marketCap: 78_000_000_000, volume24h: 3_200_000_000, color: '#9945FF', favorite: false },
  { symbol: 'BNB', name: 'BNB', price: 612.34, change24h: 0.87, marketCap: 94_000_000_000, volume24h: 1_800_000_000, color: '#F3BA2F', favorite: false },
  { symbol: 'USDT', name: 'Tether', price: 1.0, change24h: 0.01, marketCap: 110_000_000_000, volume24h: 50_000_000_000, color: '#26A17B', favorite: false },
  { symbol: 'USDC', name: 'USD Coin', price: 1.0, change24h: -0.005, marketCap: 33_000_000_000, volume24h: 8_000_000_000, color: '#2775CA', favorite: false },
  { symbol: 'XRP', name: 'Ripple', price: 0.58, change24h: 1.8, marketCap: 32_000_000_000, volume24h: 1_200_000_000, color: '#23292F', favorite: false },
  { symbol: 'ADA', name: 'Cardano', price: 0.42, change24h: -2.1, marketCap: 14_500_000_000, volume24h: 580_000_000, color: '#0033AD', favorite: false },
  { symbol: 'AVAX', name: 'Avalanche', price: 32.18, change24h: 3.4, marketCap: 12_400_000_000, volume24h: 410_000_000, color: '#E84142', favorite: false },
  { symbol: 'DOT', name: 'Polkadot', price: 6.85, change24h: -0.8, marketCap: 9_800_000_000, volume24h: 280_000_000, color: '#E6007A', favorite: false },
  { symbol: 'MATIC', name: 'Polygon', price: 0.72, change24h: 5.12, marketCap: 7_200_000_000, volume24h: 420_000_000, color: '#8247E5', favorite: false },
];

type SortKey = 'marketCap' | 'price' | 'change24h' | 'volume24h';

export function MarketsScreen() {
  const addToast = useWalletStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('marketCap');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [markets, setMarkets] = useState(INITIAL_MARKETS);

  const filtered = useMemo(() => {
    let list = [...markets];
    if (onlyFavorites) list = list.filter((m) => m.favorite);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => b[sort] - a[sort]);
    return list;
  }, [markets, sort, onlyFavorites, search]);

  const toggleFav = (symbol: string) => {
    setMarkets((prev) =>
      prev.map((m) => (m.symbol === symbol ? { ...m, favorite: !m.favorite } : m))
    );
  };

  const fmtPrice = (v: number) =>
    v >= 1 ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${v.toFixed(4)}`;
  const fmtLarge = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}K`;
    return `$${v.toFixed(2)}`;
  };

  return (
    <ScreenShell title="Mercados" subtitle="Precios en vivo del mercado cripto">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar token..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm focus:outline-none focus:border-cyan-500/40"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 h-10 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              onlyFavorites
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-white/[0.04] text-muted-foreground border border-transparent hover:text-foreground'
            }`}
          >
            <Star size={12} fill={onlyFavorites ? 'currentColor' : 'none'} /> Favoritos
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-foreground focus:outline-none"
          >
            <option value="marketCap">Por Cap. de Mercado</option>
            <option value="price">Por Precio</option>
            <option value="change24h">Por Cambio 24h</option>
            <option value="volume24h">Por Volumen 24h</option>
          </select>
        </div>
      </div>

      {/* Table header (desktop) */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_2fr_1.5fr_1.5fr_1.5fr_80px] gap-4 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.06]">
          <div></div>
          <div>Activo</div>
          <div className="text-right">Precio</div>
          <div className="text-right">Cambio 24h</div>
          <div className="text-right">Cap. Mercado</div>
          <div className="text-right pr-2">Chart</div>
        </div>

        {filtered.map((m, i) => {
          const positive = m.change24h >= 0;
          const spark = generateSparkline(m.price, m.change24h);
          return (
            <motion.div
              key={m.symbol}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => addToast(`${m.name}: ${fmtPrice(m.price)} (${positive ? '+' : ''}${m.change24h.toFixed(2)}%)`, 'info')}
              className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_2fr_1.5fr_1.5fr_1.5fr_80px] gap-3 md:gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
            >
              {/* Favorite */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFav(m.symbol); }}
                className="flex items-center justify-center"
                aria-label="Favorito"
              >
                <Star
                  size={16}
                  className={m.favorite ? 'text-amber-400' : 'text-muted-foreground/40 hover:text-amber-400'}
                  fill={m.favorite ? 'currentColor' : 'none'}
                />
              </button>

              {/* Token */}
              <div className="flex items-center gap-3 min-w-0">
                <TokenIcon symbol={m.symbol} size={32} color={m.color} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{m.symbol}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{m.name}</p>
                </div>
              </div>

              {/* Price (mobile: shows after token) */}
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground tabular-nums">{fmtPrice(m.price)}</p>
                <p className="md:hidden text-[10px] text-muted-foreground">{fmtLarge(m.marketCap)}</p>
              </div>

              {/* Change 24h */}
              <div className="hidden md:flex justify-end">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                    positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                  }`}
                >
                  {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {positive ? '+' : ''}{m.change24h.toFixed(2)}%
                </span>
              </div>

              {/* Market cap */}
              <div className="hidden md:block text-right text-xs text-foreground tabular-nums">
                {fmtLarge(m.marketCap)}
              </div>

              {/* Sparkline */}
              <div className="hidden md:flex justify-end pr-1">
                <Sparkline data={spark} color={positive ? '#10B981' : '#F6465D'} width={70} height={26} />
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Search size={32} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No se encontraron tokens</p>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
