'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';

export function ToastContainer() {
  const toasts = useWalletStore((s) => s.toasts);
  const removeToast = useWalletStore((s) => s.removeToast);

  const ICONS = {
    success: { icon: CheckCircle2, color: '#10B981' },
    error: { icon: AlertCircle, color: '#F6465D' },
    info: { icon: Info, color: '#06B6D4' },
  } as const;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => {
          const cfg = ICONS[t.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-xl px-4 py-3 flex items-start gap-3 shadow-2xl"
              style={{ minWidth: 280 }}
            >
              <Icon size={18} color={cfg.color} className="shrink-0 mt-0.5" />
              <p className="text-sm text-foreground flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
