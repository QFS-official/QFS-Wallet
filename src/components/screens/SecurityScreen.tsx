'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Fingerprint, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle,
  KeyRound, RefreshCw, Download, ChevronRight, Lock as LockIcon,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';

export function SecurityScreen() {
  const biometricEnabled = useWalletStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useWalletStore((s) => s.setBiometricEnabled);
  const autoLockTimer = useWalletStore((s) => s.autoLockTimer);
  const setAutoLockTimer = useWalletStore((s) => s.setAutoLockTimer);
  const hideBalances = useWalletStore((s) => s.hideBalances);
  const toggleHideBalances = useWalletStore((s) => s.toggleHideBalances);
  const addToast = useWalletStore((s) => s.addToast);
  const resetWallet = useWalletStore((s) => s.resetWallet);
  const lockWallet = useWalletStore((s) => s.lockWallet);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <ScreenShell title="Seguridad" subtitle="Protege tu wallet y configuración de acceso">
      {/* Lock now button — prominent action */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 mb-5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <LockIcon size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Bloqueo manual</p>
            <p className="text-xs text-muted-foreground">Bloquea la app inmediatamente</p>
          </div>
        </div>
        <button
          onClick={() => {
            lockWallet();
            addToast('Billetera bloqueada', 'info');
          }}
          className="px-5 h-10 rounded-xl qfs-btn-primary text-sm font-semibold flex items-center gap-2"
        >
          <Lock size={14} /> Bloquear ahora
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {/* Security score */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))', border: '1px solid rgba(6,182,212,0.3)' }}
              >
                <ShieldCheck size={26} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Puntuación de Seguridad</h3>
                <p className="text-xs text-muted-foreground">Basado en tus configuraciones activas</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-emerald-400 tabular-nums">85</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Excelente</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: '85%',
                  background: 'linear-gradient(90deg, #10B981, #06B6D4)',
                }}
              />
            </div>
          </motion.div>

          {/* Authentication */}
          <Section title="Autenticación" icon={Fingerprint}>
            <ToggleRow
              icon={Fingerprint}
              color="#06B6D4"
              title="Biométricos"
              subtitle="Huella dactilar / Face ID"
              checked={biometricEnabled}
              onChange={(v) => {
                setBiometricEnabled(v);
                addToast(v ? 'Biométricos activados' : 'Biométricos desactivados', v ? 'success' : 'info');
              }}
            />
            <ToggleRow
              icon={Eye}
              color="#3B82F6"
              title="Ocultar saldos automáticamente"
              subtitle="Al abrir la app"
              checked={hideBalances}
              onChange={toggleHideBalances}
            />
            <SelectRow
              icon={Lock}
              color="#8B5CF6"
              title="Bloqueo automático"
              subtitle="Bloquear tras inactividad"
              value={`${autoLockTimer / 60} min`}
              options={[
                { label: '1 min', value: 60 },
                { label: '5 min', value: 300 },
                { label: '15 min', value: 900 },
                { label: '30 min', value: 1800 },
                { label: 'Nunca', value: 0 },
              ]}
              onChange={(v) => setAutoLockTimer(v)}
            />
          </Section>

          {/* Keys & Backup */}
          <Section title="Claves y Respaldo" icon={KeyRound}>
            <ActionRow
              icon={Eye}
              color="#10B981"
              title="Ver frase semilla"
              subtitle="Las 12 palabras maestras"
              onClick={() => addToast('Ingresa tu contraseña para ver la frase semilla', 'info')}
            />
            <ActionRow
              icon={Download}
              color="#06B6D4"
              title="Exportar keystore"
              subtitle="Archivo JSON encriptado"
              onClick={() => addToast('Descargando keystore...', 'info')}
            />
            <ActionRow
              icon={RefreshCw}
              color="#3B82F6"
              title="Rotar clave pública"
              subtitle="Generar nueva dirección derivada"
              onClick={() => addToast('Rotando clave... esto requiere firmar', 'info')}
            />
          </Section>

          {/* Danger zone */}
          <Section title="Zona de Peligro" icon={AlertTriangle} danger>
            <ActionRow
              icon={AlertTriangle}
              color="#F6465D"
              title="Eliminar wallet"
              subtitle="Borra todos los datos locales"
              onClick={() => setShowResetConfirm(true)}
            />
          </Section>
        </div>

        {/* Right column: tips */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Consejos de Seguridad</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Nunca compartas tu frase semilla con nadie</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Verifica siempre URLs antes de conectar tu wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Activa el bloqueo automático cuando uses dispositivos compartidos</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Haz backup offline de tu frase en lugar seguro</span>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-4 border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/90 leading-relaxed">
                <strong className="text-amber-300">15%</strong> de seguridad pendiente: activa biométricos y exporta tu keystore para completar el 100%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
                <h3 className="text-lg font-bold text-white">¿Eliminar Wallet?</h3>
                <p className="text-xs text-muted-foreground">Esta acción es irreversible</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Se borrarán todos los datos locales: dirección, transacciones y configuraciones. Asegúrate de tener respaldada tu frase semilla.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-10 rounded-lg qfs-btn-ghost text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetWallet();
                  setShowResetConfirm(false);
                  addToast('Wallet eliminada', 'info');
                }}
                className="flex-1 h-10 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-sm font-semibold transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </ScreenShell>
  );
}

function Section({ title, icon: Icon, children, danger }: { title: string; icon: React.ComponentType<{ size?: number; color?: string }>; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${danger ? 'border-red-500/15' : ''}`}>
      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${danger ? 'text-red-400' : 'text-foreground'}`}>
        <Icon size={14} color={danger ? '#F6465D' : '#06B6D4'} /> {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ToggleRow({ icon: Icon, color, title, subtitle, checked, onChange }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: `${color}14`, border: `1px solid ${color}26` }}>
        <Icon size={14} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

function SelectRow({ icon: Icon, color, title, subtitle, value, options, onChange }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  title: string;
  subtitle: string;
  value: string;
  options: { label: string; value: number }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: `${color}14`, border: `1px solid ${color}26` }}>
        <Icon size={14} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <select
        value={options.find(o => o.label === value)?.value ?? 300}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="h-8 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-cyan-500/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function ActionRow({ icon: Icon, color, title, subtitle, onClick }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors text-left"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: `${color}14`, border: `1px solid ${color}26` }}>
        <Icon size={14} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight size={14} className="text-muted-foreground/40" />
    </button>
  );
}
