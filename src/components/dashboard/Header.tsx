'use client';

import { useState } from 'react';
import { Search, Bell, Globe, Sun, Moon, QrCode } from 'lucide-react';
import { MobileMenuButton } from './Sidebar';
import { QFSLogo } from './QFSLogo';
import { useWalletStore } from '@/store/wallet';
import { truncateAddress } from '@/lib/wallet/core';

export function Header() {
  const address = useWalletStore((s) => s.address);
  const addToast = useWalletStore((s) => s.addToast);
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 h-16 backdrop-blur-xl bg-[#0B1120]/80 border-b border-white/[0.04]">
      <MobileMenuButton />

      {/* Search */}
      <div className="relative hidden md:flex items-center flex-1 max-w-md">
        <Search size={16} className="absolute left-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar token, dApp, transacción..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
          aria-label="Buscar"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language selector */}
        <button
          onClick={() => {
            const next = lang === 'ES' ? 'EN' : 'ES';
            setLang(next);
            addToast(`Idioma cambiado a ${next === 'ES' ? 'Español' : 'English'}`, 'info');
          }}
          className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          aria-label="Cambiar idioma"
        >
          <Globe size={14} />
          <span>{lang}</span>
        </button>

        {/* Mobile QR shortcut */}
        <button
          onClick={() => addToast('Escaneando QR...', 'info')}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Escanear QR"
        >
          <QrCode size={18} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => addToast('Tienes 3 nuevas notificaciones', 'info')}
          className="relative p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 pulse-soft" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/[0.06]">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              width: 36,
              height: 36,
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <QFSLogo size={36} withGlow={false} withOrbit={false} />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-foreground">Mi Billetera</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {truncateAddress(address, 4)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
