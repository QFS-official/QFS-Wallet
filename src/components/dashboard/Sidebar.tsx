'use client';

import { motion } from 'framer-motion';
import { useWalletStore } from '@/store/wallet';
import type { Screen } from '@/types/wallet';
import { QFSLogo } from './QFSLogo';
import {
  LayoutDashboard,
  Wallet as WalletIcon,
  Send,
  Download,
  ArrowLeftRight,
  TrendingUp,
  Globe,
  Settings,
  Shield,
  Menu,
  X,
  Sparkles,
  LogOut,
  Plus,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  screen: Screen;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: LayoutDashboard, screen: 'dashboard' },
  { label: 'Billetera', icon: WalletIcon, screen: 'wallet' },
  { label: 'Mis Wallets', icon: Plus, screen: 'wallets' },
  { label: 'Enviar', icon: Send, screen: 'send' },
  { label: 'Recibir', icon: Download, screen: 'receive' },
  { label: 'Swap', icon: ArrowLeftRight, screen: 'swap' },
  { label: 'Staking', icon: TrendingUp, screen: 'staking' },
  { label: 'dApps', icon: Globe, screen: 'dapps' },
  { label: 'Mercados', icon: Sparkles, screen: 'markets' },
  { label: 'Seguridad', icon: Shield, screen: 'security' },
  { label: 'Ajustes', icon: Settings, screen: 'settings' },
];

export function Sidebar() {
  const currentScreen = useWalletStore((s) => s.currentScreen);
  const navigate = useWalletStore((s) => s.navigate);
  const sidebarOpen = useWalletStore((s) => s.sidebarOpen);
  const setSidebarOpen = useWalletStore((s) => s.setSidebarOpen);
  const lockWallet = useWalletStore((s) => s.lockWallet);
  const addToast = useWalletStore((s) => s.addToast);

  const handleSignOut = () => {
    lockWallet();
    addToast('Sesión cerrada', 'info');
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[256px] shrink-0 flex flex-col px-4 py-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0A0F1E 0%, #0B1120 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-4 lg:hidden p-2 rounded-lg hover:bg-white/5"
          aria-label="Cerrar menú"
        >
          <X size={18} className="text-muted-foreground" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <QFSLogo size={42} withGlow />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white">QFS Wallet</span>
            <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-medium">
              Quantum Financial System
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => navigate(item.screen)}
                className={`sidebar-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Promo card */}
        <div
          className="relative mt-6 mb-4 p-4 rounded-2xl overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 60%), rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(6, 182, 212, 0.12)',
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                QFS Premium
              </span>
            </div>
            <p className="text-[13px] font-medium text-white leading-snug mb-1">
              Desbloquea staking hasta 42% APY
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Haz stake de QFS y accede a recompensas exclusivas y zero-fee swaps.
            </p>
            <button
              onClick={() => navigate('staking')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-[#0B1120] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow"
            >
              Comenzar
            </button>
          </div>
          {/* Decorative wireframe globe */}
          <div
            className="absolute -bottom-6 -right-6 w-24 h-24 opacity-20 pointer-events-none"
            style={{
              borderRadius: '50%',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              boxShadow: 'inset 0 0 12px rgba(6, 182, 212, 0.3)',
            }}
          />
        </div>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="mt-4 w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>

        {/* Tagline footer */}
        <div className="px-2 mt-auto">
          <p className="text-[11px] text-muted-foreground/80 italic mb-1 leading-snug">
            Tu mundo cripto, en tus manos.
          </p>
          <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
            Seguro · Rápido · Global
          </p>
        </div>
      </aside>
    </>
  );
}

// Mobile menu trigger (used in the header)
export function MobileMenuButton() {
  const setSidebarOpen = useWalletStore((s) => s.setSidebarOpen);
  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Abrir menú"
    >
      <Menu size={20} />
    </button>
  );
}
