import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 size={20} className="text-accent-400" />,
            error: <AlertCircle size={20} className="text-err-400" />,
            info: <Info size={20} className="text-cyber-400" />,
            warning: <AlertTriangle size={20} className="text-warn-400" />,
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className="glass-card rounded-xl border border-white/10 p-4 flex items-start gap-3 shadow-xl"
            >
              <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-zinc-400 mt-1">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-zinc-600 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
