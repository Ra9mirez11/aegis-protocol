import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Globe } from 'lucide-react';
import type { NetworkConfig } from '@/types';
import { NETWORKS } from '@/constants/networks';
import { NetworkLogo } from './ui/NetworkLogo';

interface NetworkSwitcherProps {
  selected: NetworkConfig;
  onSelect: (network: NetworkConfig) => void;
  disabled?: boolean;
}

export function NetworkSwitcher({ selected, onSelect, disabled }: NetworkSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${selected.logoColor}18` }}>
          <NetworkLogo network={selected} size={18} />
        </span>
        <span className="text-sm font-medium text-white hidden sm:block">{selected.name}</span>
        <span className="text-xs font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-white/5">{selected.symbol}</span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.12)] z-50 max-h-[380px] overflow-y-auto"
            >
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 font-medium">
                  <Globe size={14} />
                  Select Network
                </div>
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => {
                      onSelect(net);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      selected.id === net.id
                        ? 'bg-accent-500/10 text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${net.logoColor}18` }}>
                      <NetworkLogo network={net} size={20} />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{net.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{net.symbol}</div>
                    </div>
                    {selected.id === net.id && (
                      <Check size={16} className="text-accent-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
