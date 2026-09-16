'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Share2, ChevronDown, Search, AlertTriangle, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { TokenIcon } from '@/components/dashboard/TokenIcon';
import {
  RECEIVE_ASSETS,
  buildPaymentURI,
  truncate,
  type ReceiveAsset,
} from '@/lib/wallet/receive';

const CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: '#627EEA', explorer: 'https://etherscan.io' },
  { id: 137, name: 'Polygon', symbol: 'POL', icon: '⬡', color: '#8247E5', explorer: 'https://polygonscan.com' },
  { id: 56, name: 'BNB Smart Chain', symbol: 'BNB', icon: '◆', color: '#F3BA2F', explorer: 'https://bscscan.com' },
];

export function ReceiveScreen() {
  const address = useWalletStore((s) => s.address);
  const addToast = useWalletStore((s) => s.addToast);

  // Default to QFS on Ethereum
  const [selectedKey, setSelectedKey] = useState<string>('QFS:1');
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showChainPicker, setShowChainPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedField, setCopiedField] = useState<'address' | 'contract' | null>(null);

  const selectedAsset = useMemo(
    () => RECEIVE_ASSETS.find((a) => a.key === selectedKey) || RECEIVE_ASSETS[0],
    [selectedKey]
  );

  const selectedChain = useMemo(
    () => CHAINS.find((c) => c.id === selectedAsset.chainId) || CHAINS[0],
    [selectedAsset]
  );

  // Assets filtered by current chain for the chain view
  const assetsOnSelectedChain = useMemo(
    () => RECEIVE_ASSETS.filter((a) => a.chainId === selectedAsset.chainId),
    [selectedAsset.chainId]
  );

  // Assets filtered by search
  const filteredAssets = useMemo(() => {
    if (!search) return RECEIVE_ASSETS;
    const q = search.toLowerCase();
    return RECEIVE_ASSETS.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.chainName.toLowerCase().includes(q)
    );
  }, [search]);

  // QR value depends on whether it's native or ERC-20
  // For ERC-20 tokens without contract deployed on this chain, fall back to wallet address
  const qrValue = selectedAsset.available
    ? buildPaymentURI(address, selectedAsset)
    : address;

  const copyValue = async (value: string, field: 'address' | 'contract') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      addToast(
        field === 'address' ? 'Dirección copiada' : 'Contrato copiado',
        'success'
      );
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      addToast('No se pudo copiar', 'error');
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Recibir ${selectedAsset.symbol} en ${selectedAsset.chainName}`,
          text: `Mi dirección ${selectedAsset.chainName}: ${address}\n\nContrato ${selectedAsset.symbol}: ${selectedAsset.contractAddress}`,
        });
      } catch {}
    } else {
      copyValue(address, 'address');
    }
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qfs-receive-qr') as SVGSVGElement | null;
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qfs-receive-${selectedAsset.symbol}-${selectedAsset.chainName.replace(/\s/g, '').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('QR descargado', 'success');
  };

  return (
    <ScreenShell
      title="Recibir"
      subtitle={`Recibe ${selectedAsset.name} (${selectedAsset.symbol}) en ${selectedAsset.chainName}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 max-w-5xl"
      >
        {/* Main card */}
        <div className="glass-card rounded-2xl p-6 lg:p-8">
          {/* Asset selector */}
          <div className="relative mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Activo
            </label>
            <button
              onClick={() => {
                setShowAssetPicker(!showAssetPicker);
                setShowChainPicker(false);
              }}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TokenIcon symbol={selectedAsset.symbol} size={36} color={selectedAsset.tokenColor} />
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-[#0B1120]"
                    style={{ background: selectedChain.color, color: '#0B1120' }}
                    title={selectedAsset.chainName}
                  >
                    {selectedChain.icon}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedAsset.symbol}
                    <span className="text-muted-foreground font-normal ml-2">· {selectedAsset.name}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedAsset.isNative ? 'Nativo' : 'ERC-20'} · {selectedAsset.chainName}
                  </p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showAssetPicker ? 'rotate-180' : ''}`} />
            </button>

            {showAssetPicker && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-white/[0.04]">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar token o red..."
                      className="w-full h-9 pl-8 pr-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs focus:outline-none focus:border-cyan-500/40"
                      autoFocus
                    />
                  </div>
                </div>
                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredAssets.map((a) => (
                    <button
                      key={a.key}
                      onClick={() => {
                        setSelectedKey(a.key);
                        setShowAssetPicker(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors text-left ${
                        a.key === selectedKey ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <div className="relative">
                        <TokenIcon symbol={a.symbol} size={32} color={a.tokenColor} />
                        <div
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold border-2 border-[#0B1120]"
                          style={{ background: a.chainColor, color: '#0B1120' }}
                        >
                          {a.chainIcon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {a.symbol}
                          <span className="text-muted-foreground font-normal ml-1.5">· {a.chainName}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {a.isNative
                            ? 'Token nativo'
                            : a.available
                              ? truncate(a.contractAddress, 6)
                              : 'No disponible en esta red'}
                        </p>
                      </div>
                      {!a.available && !a.isNative && (
                        <span className="text-[9px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 shrink-0">
                          N/A
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chain quick-switcher (only show 3 chains, disabled on non-available) */}
          <div className="relative mb-6">
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Red
            </label>
            <div className="flex gap-2">
              {CHAINS.map((c) => {
                const assetOnChain = RECEIVE_ASSETS.find(
                  (a) => a.symbol === selectedAsset.symbol && a.chainId === c.id
                );
                const isAvailable = assetOnChain?.available;
                const isActive = c.id === selectedAsset.chainId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (assetOnChain) {
                        setSelectedKey(assetOnChain.key);
                      } else {
                        addToast(`${selectedAsset.symbol} no está en ${c.name}`, 'info');
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                        : isAvailable
                          ? 'bg-white/[0.04] border-white/[0.06] text-muted-foreground hover:text-foreground hover:border-cyan-500/30'
                          : 'bg-white/[0.02] border-white/[0.04] text-muted-foreground/40 cursor-not-allowed'
                    }`}
                    disabled={!assetOnChain}
                  >
                    <span style={{ color: c.color, fontSize: 14 }}>{c.icon}</span>
                    {c.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="rounded-3xl p-6 mb-4"
              style={{
                background: `linear-gradient(135deg, ${selectedChain.color}14 0%, ${selectedAsset.tokenColor}14 100%)`,
                border: `1px solid ${selectedAsset.tokenColor}33`,
                boxShadow: `0 0 40px ${selectedAsset.tokenColor}22`,
              }}
            >
              <div className="bg-white p-4 rounded-2xl">
                <QRCodeSVG
                  id="qfs-receive-qr"
                  value={qrValue}
                  size={200}
                  level="H"
                  fgColor="#0B1120"
                  bgColor="#FFFFFF"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyValue(address, 'address')}
                className="flex items-center gap-2 px-4 h-10 rounded-lg qfs-btn-ghost text-sm"
              >
                {copiedField === 'address' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedField === 'address' ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={share}
                className="flex items-center gap-2 px-4 h-10 rounded-lg qfs-btn-ghost text-sm"
              >
                <Share2 size={14} /> Compartir
              </button>
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 px-4 h-10 rounded-lg qfs-btn-ghost text-sm"
              >
                <Download size={14} /> QR
              </button>
            </div>
          </div>

          {/* Wallet address */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Tu Dirección de Billetera
            </label>
            <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-foreground break-all flex-1">{address}</code>
              <button
                onClick={() => copyValue(address, 'address')}
                className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors shrink-0"
                aria-label="Copiar dirección"
              >
                {copiedField === 'address' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Token contract (only for ERC-20) */}
          {!selectedAsset.isNative && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Contrato {selectedAsset.symbol} ({selectedAsset.chainName})
                </label>
                <a
                  href={`${selectedChain.explorer}/address/${selectedAsset.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast('Abriendo explorador...', 'info');
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                >
                  <ExternalLink size={10} /> Explorar
                </a>
              </div>
              <div
                className={`p-3 rounded-lg bg-white/[0.04] border flex items-center justify-between gap-2 transition-colors ${
                  selectedAsset.available ? 'border-white/[0.06]' : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <code className="text-xs font-mono text-foreground break-all flex-1">
                  {selectedAsset.contractAddress}
                </code>
                <button
                  onClick={() => copyValue(selectedAsset.contractAddress, 'contract')}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-cyan-400 transition-colors shrink-0"
                  aria-label="Copiar contrato"
                >
                  {copiedField === 'contract' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              {!selectedAsset.available && (
                <p className="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={11} /> El contrato no está desplegado en {selectedAsset.chainName}. El token solo se puede recibir en Ethereum mainnet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right info */}
        <div className="space-y-4">
          {/* Available assets summary */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Activos Disponibles
            </h3>
            <div className="space-y-2.5">
              {(['QFS', 'GCRM', 'AlA', 'TRAEX'] as const).map((symbol) => (
                <div key={symbol} className="flex items-center gap-2.5 text-xs">
                  <TokenIcon symbol={symbol} size={24} />
                  <span className="text-foreground font-semibold">{symbol}</span>
                  <div className="flex gap-1 ml-auto">
                    {CHAINS.map((c) => {
                      const asset = RECEIVE_ASSETS.find(
                        (a) => a.symbol === symbol && a.chainId === c.id
                      );
                      const ok = asset?.available;
                      return (
                        <span
                          key={c.id}
                          title={`${symbol} en ${c.name}: ${ok ? 'Disponible' : 'No disponible'}`}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border"
                          style={{
                            background: ok ? c.color : 'rgba(255,255,255,0.04)',
                            color: ok ? '#0B1120' : 'rgba(156,163,175,0.4)',
                            borderColor: ok ? c.color : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          {c.icon}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              3 redes soportadas: Ethereum, Polygon y BNB Smart Chain
            </p>
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Instrucciones</h3>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-cyan-400 font-semibold">1.</span>
                <span>Selecciona el activo y la red donde recibirás</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-semibold">2.</span>
                <span>
                  {selectedAsset.isNative
                    ? 'Comparte tu dirección (misma para ETH/POL/BNB nativos)'
                    : 'Comparte tu dirección + el contrato del token'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-semibold">3.</span>
                <span>El emisor debe enviar desde la misma red</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-semibold">4.</span>
                <span>Verás la transacción confirmarse en segundos</span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="glass-card rounded-2xl p-4 border-amber-500/20">
            <p className="text-xs text-amber-300/90 leading-relaxed">
              <strong className="text-amber-300">⚠ Atención:</strong> Solo envía activos desde la misma red. Enviar tokens de otra red a un contrato incorrecto puede resultar en pérdida permanente de fondos.
            </p>
          </div>
        </div>
      </motion.div>
    </ScreenShell>
  );
}
