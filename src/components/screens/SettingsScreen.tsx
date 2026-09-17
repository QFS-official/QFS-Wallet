'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Moon, Sun, Bell, LogOut, ChevronRight, Info, HelpCircle, FileText, Github,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { ScreenShell } from './ScreenShell';
import { QFSLogo } from '@/components/dashboard/QFSLogo';

export function SettingsScreen() {
  const addToast = useWalletStore((s) => s.addToast);
  const autoLockTimer = useWalletStore((s) => s.autoLockTimer);
  const address = useWalletStore((s) => s.address);
  const lockWallet = useWalletStore((s) => s.lockWallet);
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <ScreenShell title="Ajustes" subtitle="Personaliza tu experiencia QFS Wallet">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {/* General */}
          <Section title="General" icon={Globe}>
            <SelectRow
              icon={Globe}
              color="#06B6D4"
              title="Idioma"
              subtitle="Idioma de la interfaz"
              value={lang}
              options={[
                { label: 'Español', value: 'ES' },
                { label: 'English', value: 'EN' },
              ]}
              onChange={(v) => {
                setLang(v as 'ES' | 'EN');
                addToast(`Idioma: ${v === 'ES' ? 'Español' : 'English'}`, 'success');
              }}
            />
            <ToggleRow
              icon={darkMode ? Moon : Sun}
              color="#8B5CF6"
              title="Modo Oscuro"
              subtitle="Tema visual de la app"
              checked={darkMode}
              onChange={(v) => {
                setDarkMode(v);
                addToast(v ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
              }}
            />
          </Section>

          {/* Notifications */}
          <Section title="Notificaciones" icon={Bell}>
            <ToggleRow
              icon={Bell}
              color="#F59E0B"
              title="Notificaciones push"
              subtitle="Transacciones y alertas"
              checked={notifications}
              onChange={(v) => {
                setNotifications(v);
                addToast(v ? 'Notificaciones activadas' : 'Notificaciones desactivadas', 'info');
              }}
            />
            <ActionRow
              icon={Bell}
              color="#10B981"
              title="Configurar notificaciones"
              subtitle="Personaliza qué recibir"
              onClick={() => addToast('Personalización próximamente', 'info')}
            />
          </Section>

          {/* About */}
          <Section title="Acerca de" icon={Info}>
            <ActionRow
              icon={HelpCircle}
              color="#3B82F6"
              title="Centro de ayuda"
              subtitle="Preguntas frecuentes y soporte"
              onClick={() => addToast('Abriendo centro de ayuda...', 'info')}
            />
            <ActionRow
              icon={FileText}
              color="#06B6D4"
              title="Términos y condiciones"
              subtitle="Legal y políticas"
              onClick={() => addToast('Abriendo términos...', 'info')}
            />
            <ActionRow
              icon={Github}
              color="#8B5CF6"
              title="Repositorio GitHub"
              subtitle="Código abierto y contribución"
              onClick={() => addToast('https://github.com/QFS-official/QFS-Wallet', 'info')}
            />
          </Section>

          {/* Sign out — locks the wallet and returns to unlock screen */}
          <button
            onClick={() => {
              lockWallet();
              addToast('Sesión cerrada. Ingresa tu PIN para volver a entrar.', 'info');
            }}
            className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-semibold text-red-400 hover:bg-red-500/5 hover:border-red-500/30 transition-colors"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* Right column: app info */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 text-center">
            <QFSLogo size={72} withGlow className="mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">QFS Wallet</h3>
            <p className="text-xs text-muted-foreground mb-3">Tu mundo cripto, en tus manos</p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              <span>Seguro</span>
              <span>·</span>
              <span>Rápido</span>
              <span>·</span>
              <span>Global</span>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground/40">v0.2.1 · Quantum Financial System</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              QFS Wallet es no-custodial: <span className="text-cyan-400 font-medium">tus claves, tus cripto.</span> Todas las operaciones se ejecutan localmente en tu dispositivo.
            </p>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number; color?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
        <Icon size={14} color="#06B6D4" /> {title}
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
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
