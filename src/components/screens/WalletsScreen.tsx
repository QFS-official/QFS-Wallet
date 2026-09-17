'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Check, Trash2, ChevronRight, AlertTriangle, X, Wallet as WalletIcon,
  ArrowLeftRight, Copy, Eye, EyeOff,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { QFSLogo } from '@/components/dashboard/QFSLogo';
import { truncateAddress } from '@/lib/wallet/core';
import type { WalletEntry } from '@/store/wallet';

export function WalletsScreen() {
  const wallets = useWalletStore((s) => s.wallets);
  const currentWalletId = useWalletStore((s) => s.currentWalletId);
  const switchWallet = useWalletStore((s) => s.switchWallet);
  const removeWallet = useWalletStore((s) => s.removeWallet);
  const renameWallet = useWalletStore((s) => s.renameWallet);
  const navigate = useWalletStore((s) => s.navigate);
  const lockWallet = useWalletStore((s) => s.lockWallet);
  const addToast = useWalletStore((s) => s.addToast);

  const [pinForSwitch, setPinForSwitch] = useState<{ walletId: string; pin: string; show: boolean } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const handleSwitch = (walletId: string) => {
    if (walletId === currentWalletId) return;
    // Need PIN to switch (each wallet has its own PIN)
    setPinForSwitch({ walletId, pin: '', show: false });
  };

  const confirmSwitch = async () => {
    if (!pinForSwitch) return;
    const ok = await switchWallet(pinForSwitch.walletId, pinForSwitch.pin);
    if (ok) {
      addToast('Wallet cambiada', 'success');
      setPinForSwitch(null);
      navigate('dashboard');
    } else {
      addToast('PIN incorrecto para esa wallet', 'error');
      setPinForSwitch({ ...pinForSwitch, pin: '' });
    }
  };

  const handleRemove = (wallet: WalletEntry) => {
    setRemovingId(wallet.id);
  };

  const confirmRemove = () => {
    if (!removingId) return;
    const wallet = wallets.find((w) => w.id === removingId);
    removeWallet(removingId);
    setRemovingId(null);
    addToast(`Wallet ${wallet?.name} eliminada`, 'info');
    if (wallets.length === 1) {
      navigate('create-wallet');
    }
  };

  const startRename = (wallet: WalletEntry) => {
    setEditingId(wallet.id);
    setRenameValue(wallet.name);
  };

  const confirmRename = () => {
    if (!editingId) return;
    const trimmed = renameValue.trim();
    if (trimmed.length === 0) {
      addToast('El nombre no puede estar vacío', 'error');
      return;
    }
    renameWallet(editingId, trimmed);
    setEditingId(null);
    setRenameValue('');
    addToast('Nombre actualizado', 'success');
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddr(address);
      addToast('Dirección copiada', 'success');
      setTimeout(() => setCopiedAddr(null), 1500);
    } catch {
      addToast('No se pudo copiar', 'error');
    }
  };

  const handleCreateNew = () => {
    // Lock the current wallet so the user goes through the onboarding flow
    // to create a NEW wallet (it will be added to the wallets list)
    lockWallet();
    navigate('create-wallet');
    addToast('Crea una nueva wallet', 'info');
  };

  return (
    <ScreenShell title="Mis Wallets" subtitle="Gestiona todas tus billeteras en un solo lugar">
      {/* Top actions */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {wallets.length === 0
            ? 'No tienes wallets todavía'
            : `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''} configurada${wallets.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-semibold"
        >
          <Plus size={14} /> Crear Wallet
        </button>
      </div>

      {/* Wallets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {wallets.map((w, i) => {
          const isCurrent = w.id === currentWalletId;
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card glass-card-hover rounded-2xl p-5 flex flex-col ${
                isCurrent ? 'border-cyan-500/40 bg-cyan-500/[0.04]' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl ${
                      isCurrent
                        ? 'bg-cyan-500/15 border border-cyan-500/30'
                        : 'bg-white/[0.04] border border-white/[0.06]'
                    }`}
                  >
                    <WalletIcon size={16} className={isCurrent ? 'text-cyan-400' : 'text-muted-foreground'} />
                  </div>
                  <div>
                    {editingId === w.id ? (
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setRenameValue('');
                          }
                        }}
                        className="h-6 px-2 rounded-md bg-white/[0.04] border border-cyan-500/40 text-xs font-semibold text-foreground focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground">{w.name}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Creada: {new Date(w.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-soft" /> Activa
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] mb-3">
                <code className="text-xs font-mono text-foreground">
                  {truncateAddress(w.address, 6)}
                </code>
                <button
                  onClick={() => copyAddress(w.address)}
                  className="p-1 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
                  aria-label="Copiar dirección"
                >
                  {copiedAddr === w.address ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                {isCurrent ? (
                  <button
                    onClick={() => navigate('dashboard')}
                    className="flex-1 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/15 transition-colors flex items-center justify-center gap-1"
                  >
                    Ver dashboard <ChevronRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSwitch(w.id)}
                    className="flex-1 h-9 rounded-lg qfs-btn-primary text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <ArrowLeftRight size={12} /> Cambiar
                  </button>
                )}
                <button
                  onClick={() => startRename(w)}
                  className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors"
                  aria-label="Renombrar"
                  title="Renombrar"
                >
                  <Pencil size={12} />
                </button>
                {wallets.length > 1 && (
                  <button
                    onClick={() => handleRemove(w)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    aria-label="Eliminar"
                    title="Eliminar wallet"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Add new wallet card */}
        <button
          onClick={handleCreateNew}
          className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center justify-center min-h-[180px] text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-3">
            <Plus size={20} className="text-cyan-400" />
          </div>
          <p className="text-sm font-semibold">Crear nueva wallet</p>
          <p className="text-[11px] text-muted-foreground mt-1">BIP-39 + AES-256-GCM</p>
        </button>
      </div>

      {/* Info card */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
          <QFSLogo size={20} withGlow={false} />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-0.5">Multi-wallet</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Puedes crear múltiples wallets en este dispositivo. Cada wallet tiene su propio PIN
            y su propia frase semilla. Cambiar entre wallets requiere el PIN de la wallet de destino.
          </p>
        </div>
      </div>

      {/* PIN modal for switching wallets */}
      {pinForSwitch && (
        <motion.div
          key="pin-switch-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPinForSwitch(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Cambiar a wallet</h3>
                <button
                  onClick={() => setPinForSwitch(null)}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Ingresa el PIN de la wallet a la que quieres cambiar.
              </p>
              <div className="relative mb-3">
                <input
                  value={pinForSwitch.pin}
                  onChange={(e) =>
                    setPinForSwitch({
                      ...pinForSwitch,
                      pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 8),
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmSwitch();
                  }}
                  type={pinForSwitch.show ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.06] text-lg tracking-widest text-center focus:outline-none focus:border-cyan-500/40"
                  autoFocus
                />
                <button
                  onClick={() =>
                    setPinForSwitch({ ...pinForSwitch, show: !pinForSwitch.show })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400"
                  aria-label={pinForSwitch.show ? 'Ocultar' : 'Mostrar'}
                >
                  {pinForSwitch.show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPinForSwitch(null)}
                  className="flex-1 h-10 rounded-lg qfs-btn-ghost text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSwitch}
                  disabled={pinForSwitch.pin.length < 6}
                  className="flex-1 h-10 rounded-lg qfs-btn-primary text-sm font-semibold disabled:opacity-40"
                >
                  Cambiar
                </button>
              </div>
            </motion.div>
          </motion.div>
      )}

      {/* Remove confirmation modal */}
      {removingId && (
          <motion.div
            key="remove-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setRemovingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl"
                  style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.3)' }}
                >
                  <AlertTriangle size={22} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¿Eliminar wallet?</h3>
                  <p className="text-xs text-muted-foreground">Esta acción es irreversible</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Se borrará la wallet de este dispositivo. Solo podrás recuperar los fondos
                si tienes tu frase semilla guardada. Si es la última wallet, se te enviará
                al onboarding para crear una nueva.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRemovingId(null)}
                  className="flex-1 h-10 rounded-lg qfs-btn-ghost text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 h-10 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-sm font-semibold transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
      )}
    </ScreenShell>
  );
}

// Pencil icon (not in lucide-react's icon export name)
function Pencil({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
