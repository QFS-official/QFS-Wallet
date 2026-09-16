'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Star, ExternalLink, Plus } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';

interface DApp {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  connected: boolean;
}

const CATEGORIES = ['Todos', 'DeFi', 'DEX', 'Staking', 'Gaming', 'NFT', 'Mercados'];

const DAPPS: DApp[] = [
  { id: '1', name: 'NESG Swap', url: 'https://exchange.nesg.org', category: 'DEX', icon: '🔄', color: '#06B6D4', description: 'Exchange descentralizado con 0.05% fee', connected: true },
  { id: '2', name: 'PancakeSwap', url: 'https://pancakeswap.finance', category: 'DEX', icon: '🥞', color: '#F3BA2F', description: 'AMM líder en BSC con farms y pools', connected: true },
  { id: '3', name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DEX', icon: '🦄', color: '#FF007A', description: 'El DEX más grande en Ethereum', connected: false },
  { id: '4', name: 'Aave', url: 'https://app.aave.com', category: 'DeFi', icon: '👻', color: '#B6509E', description: 'Préstamos y borrowing de activos', connected: false },
  { id: '5', name: 'Lido', url: 'https://lido.fi', category: 'Staking', icon: '💧', color: '#00A3FF', description: 'Staking líquido para ETH', connected: true },
  { id: '6', name: 'OpenSea', url: 'https://opensea.io', category: 'NFT', icon: '⛵', color: '#2081E2', description: 'Marketplace líder de NFTs', connected: false },
  { id: '7', name: '1inch', url: 'https://1inch.io', category: 'DEX', icon: '🦅', color: '#FF7834', description: 'Aggregator DEX con mejor routing', connected: false },
  { id: '8', name: 'Curve', url: 'https://curve.fi', category: 'DeFi', icon: '📈', color: '#40E0D0', description: 'Stablecoin AMM con bajos slippage', connected: false },
  { id: '9', name: 'Axie Infinity', url: 'https://axieinfinity.com', category: 'Gaming', icon: '🐾', color: '#0099FF', description: 'Juego play-to-earn', connected: false },
  { id: '10', name: 'CoinGecko', url: 'https://coingecko.com', category: 'Mercados', icon: '🦎', color: '#8DC63F', description: 'Precios y data de cripto', connected: true },
];

export function DAppsScreen() {
  const addToast = useWalletStore((s) => s.addToast);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [dapps, setDapps] = useState(DAPPS);

  const filtered = dapps.filter(
    (d) =>
      (filter === 'Todos' || d.category === filter) &&
      (search === '' || d.name.toLowerCase().includes(search.toLowerCase()) || d.url.includes(search.toLowerCase()))
  );

  const toggleConnection = (id: string) => {
    setDapps((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
    const dapp = dapps.find((d) => d.id === id);
    if (dapp) {
      addToast(
        dapp.connected ? `${dapp.name} desconectado` : `${dapp.name} conectado`,
        dapp.connected ? 'info' : 'success'
      );
    }
  };

  return (
    <ScreenShell title="dApps" subtitle="Conecta tu wallet a aplicaciones Web3">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dApp..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === c
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/[0.04] text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* dApps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dapp, i) => (
          <motion.div
            key={dapp.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
                style={{ background: `${dapp.color}14`, border: `1px solid ${dapp.color}26` }}
              >
                {dapp.icon}
              </div>
              {dapp.connected && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft" /> Conectado
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">{dapp.name}</h3>
            <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
              <Globe size={10} /> {dapp.url.replace('https://', '')}
            </p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
              {dapp.description}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleConnection(dapp.id)}
                className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-colors ${
                  dapp.connected
                    ? 'bg-white/[0.04] text-muted-foreground hover:bg-red-500/10 hover:text-red-400'
                    : 'qfs-btn-primary'
                }`}
              >
                {dapp.connected ? 'Desconectar' : 'Conectar'}
              </button>
              <a
                href={dapp.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.preventDefault()}
                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
                aria-label="Abrir"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Search size={32} className="mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No se encontraron dApps</p>
        </div>
      )}

      {/* Suggest dApp card */}
      <button
        onClick={() => addToast('Formulario de sugerencia próximamente', 'info')}
        className="w-full mt-6 glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
      >
        <Plus size={14} /> Sugerir nueva dApp
      </button>
    </ScreenShell>
  );
}
