import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Power, Copy, Check, FlaskConical } from 'lucide-react';
import { AegisLogo } from './Logo';
import { NetworkSwitcher } from './NetworkSwitcher';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatAddress } from '@/utils/format';
import type { NetworkConfig, WalletState } from '@/types';

interface TopBarProps {
  wallet: WalletState;
  network: NetworkConfig;
  demoMode: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onToggleDemoMode: () => void;
  onNetworkSelect: (net: NetworkConfig) => void;
}

export function TopBar({
  wallet,
  network,
  demoMode,
  onConnectWallet,
  onDisconnectWallet,
  onToggleDemoMode,
  onNetworkSelect,
}: TopBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <AegisLogo size="md" />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDemoMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              demoMode
                ? 'bg-warn-500/10 border-warn-500/30 text-warn-400'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <FlaskConical size={16} />
            <span className="text-sm font-medium hidden sm:block">Demo</span>
            <span
              className={`w-2 h-2 rounded-full ${demoMode ? 'bg-warn-400 animate-pulse' : 'bg-zinc-600'}`}
            />
          </motion.button>

          <NetworkSwitcher
            selected={network}
            onSelect={onNetworkSelect}
            disabled={!wallet.connected && !demoMode}
          />

          {/* Wallet Connection */}
          {wallet.connected || demoMode ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {formatAddress(wallet.address)}
                  </span>
                  {demoMode && <Badge variant="warning" size="sm">DEMO</Badge>}
                </div>
                <button
                  onClick={handleCopy}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  {copied ? <Check size={14} className="text-accent-400" /> : <Copy size={14} />}
                </button>
              </div>
              <button
                onClick={onDisconnectWallet}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-err-400 transition-all"
                title="Disconnect"
              >
                <Power size={16} />
              </button>
            </div>
          ) : (
            <Button onClick={onConnectWallet} size="md">
              <Wallet size={16} />
              <span className="hidden sm:block">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
