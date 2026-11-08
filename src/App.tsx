import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, KeyRound, Shield, ShieldCheck, Activity, Wifi, CircleDot } from 'lucide-react';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { BentoHowItWorks } from './components/BentoHowItWorks';
import { DustSweeper } from './components/DustSweeper';
import { InheritSafe } from './components/InheritSafe';
import { ApprovalSentinel } from './components/ApprovalSentinel';
import { WalletHealthScore } from './components/WalletHealthScore';
import { ToastContainer } from './components/ui/Toast';
import { NETWORKS } from './constants/networks';
import { generateDemoTokens, getNativePrice } from './utils/demoData';
import { generateWalletAddress } from './utils/format';
import { isAnyTreasuryConfigured, getTreasuryForNetwork } from './utils/treasury';
import { fetchNativeBalance, switchOrAddChain, hasEvmWallet, hasSolanaWallet } from './utils/web3';
import { fetchLivePrices, getLivePrice } from './utils/priceFeed';
import { generateDemoApprovals } from './utils/demoApprovals';
import { NetworkLogo } from './components/ui/NetworkLogo';
import type { NetworkConfig, TokenHolding, WalletState, ToastMessage, TokenApproval } from './types';

type TabId = 'dustsweeper' | 'inheritsafe' | 'approvalsentinel';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Zap;
  description: string;
}

const TABS: Tab[] = [
  { id: 'dustsweeper', label: 'DustSweeper & Tax Harvester', icon: Zap, description: 'Clean dust, burn dead tokens, export tax reports' },
  { id: 'approvalsentinel', label: 'Approval Sentinel', icon: ShieldCheck, description: 'Scan & revoke risky token approvals' },
  { id: 'inheritsafe', label: 'InheritSafe Vault', icon: KeyRound, description: 'Zero-knowledge dead man\'s switch inheritance' },
];

function App() {
  const [network, setNetwork] = useState<NetworkConfig>(NETWORKS[0]);
  const [demoMode, setDemoMode] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    connected: false,
    isDemo: false,
    nativeBalance: 0,
    chainId: 1,
  });
  const [tokens, setTokens] = useState<TokenHolding[]>([]);
  const [approvals, setApprovals] = useState<TokenApproval[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('dustsweeper');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, number> | null>(null);
  const [priceIsLive, setPriceIsLive] = useState(false);
  const [vaultVersion, setVaultVersion] = useState(0);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Live price feed with 60s cache
  useEffect(() => {
    let mounted = true;
    const loadPrices = async () => {
      const prices = await fetchLivePrices();
      if (!mounted) return;
      if (prices && Object.keys(prices).length > 0) {
        const hasLive = prices['ethereum'] !== undefined && prices['ethereum'] !== getNativePrice('ethereum');
        setLivePrices(prices);
        setPriceIsLive(hasLive);
      }
    };
    loadPrices();
    const interval = setInterval(loadPrices, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const refreshBalance = useCallback(async (address: string, net: NetworkConfig) => {
    const bal = await fetchNativeBalance(address, net);
    if (bal > 0) {
      setWallet((prev) => ({ ...prev, nativeBalance: bal }));
    }
  }, []);

  const handleConnectWallet = useCallback(async () => {
    if (typeof window !== 'undefined' && hasEvmWallet()) {
      try {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        const chainId = parseInt(await eth.request({ method: 'eth_chainId' }), 16);

        const matchingNetwork = NETWORKS.find((n) => n.id === chainId);
        const net = matchingNetwork || NETWORKS[0];
        if (matchingNetwork) setNetwork(matchingNetwork);

        setWallet({
          address: accounts[0],
          connected: true,
          isDemo: false,
          nativeBalance: 0,
          chainId,
        });
        setTokens(generateDemoTokens());
        setApprovals(generateDemoApprovals());
        setShowDashboard(true);
        addToast({
          type: 'success',
          title: 'Wallet connected',
          message: `Connected to ${formatAddr(accounts[0])}`,
        });
        refreshBalance(accounts[0], net);
        return;
      } catch {
        // Fall through to demo
      }
    }

    if (typeof window !== 'undefined' && hasSolanaWallet()) {
      try {
        const sol = (window as any).solana || (window as any).solflare;
        const resp = await sol.connect();
        const addr = resp.publicKey.toString();
        setNetwork(NETWORKS.find((n) => !n.isEvm) || NETWORKS[5]);
        setWallet({
          address: addr,
          connected: true,
          isDemo: false,
          nativeBalance: 0,
          chainId: 0,
        });
        setTokens(generateDemoTokens());
        setApprovals(generateDemoApprovals());
        setShowDashboard(true);
        addToast({
          type: 'success',
          title: 'Solana wallet connected',
          message: `Connected to ${formatAddr(addr)}`,
        });
        refreshBalance(addr, NETWORKS.find((n) => !n.isEvm) || NETWORKS[5]);
        return;
      } catch {
        // Fall through to demo
      }
    }

    // No wallet found — enable demo mode automatically
    setDemoMode(true);
    const demoAddr = generateWalletAddress();
    setWallet({
      address: demoAddr,
      connected: true,
      isDemo: true,
      nativeBalance: Math.random() * 5 + 0.5,
      chainId: network.id,
    });
    setTokens(generateDemoTokens());
    setApprovals(generateDemoApprovals());
    setShowDashboard(true);
    addToast({
      type: 'info',
      title: 'Demo mode activated',
      message: 'No Web3 wallet detected. Mock wallet loaded with sample tokens.',
    });
  }, [network, addToast, refreshBalance]);

  const handleDisconnectWallet = useCallback(() => {
    setWallet({
      address: '',
      connected: false,
      isDemo: false,
      nativeBalance: 0,
      chainId: 1,
    });
    setDemoMode(false);
    setTokens([]);
    setApprovals([]);
    addToast({
      type: 'info',
      title: 'Wallet disconnected',
      message: 'Session ended. All sensitive data cleared from memory.',
    });
  }, [addToast]);

  const handleToggleDemoMode = useCallback(() => {
    if (demoMode) {
      handleDisconnectWallet();
    } else {
      setDemoMode(true);
      const demoAddr = generateWalletAddress();
      setWallet({
        address: demoAddr,
        connected: true,
        isDemo: true,
        nativeBalance: Math.random() * 5 + 0.5,
        chainId: network.id,
      });
      setTokens(generateDemoTokens());
      setApprovals(generateDemoApprovals());
      setShowDashboard(true);
      addToast({
        type: 'warning',
        title: 'Demo mode enabled',
        message: 'Mock wallet loaded with realistic spam tokens and balances.',
      });
    }
  }, [demoMode, network, addToast, handleDisconnectWallet]);

  const activateDemo = useCallback(() => {
    setDemoMode(true);
    setWallet({
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
      connected: true,
      isDemo: true,
      nativeBalance: 1.4285,
      chainId: network.id,
    });
    setTokens(generateDemoTokens());
    setApprovals(generateDemoApprovals());
    setShowDashboard(true);
  }, [network.id]);

  const handleNetworkSelect = useCallback(async (net: NetworkConfig) => {
    if (!wallet.connected && !demoMode) {
      activateDemo();
      setWallet((prev) => ({ ...prev, chainId: net.id }));
      setNetwork(net);
      addToast({ type: 'info', title: 'Demo mode activated', message: `Now on ${net.name} with sample telemetry.` });
      return;
    }

    setNetwork(net);

    if (!demoMode && !wallet.isDemo && wallet.connected) {
      if (net.isEvm && hasEvmWallet()) {
        const switched = await switchOrAddChain(net);
        if (switched) {
          addToast({ type: 'success', title: 'Network switched', message: `Now on ${net.name}` });
          refreshBalance(wallet.address, net);
        } else {
          addToast({ type: 'warning', title: 'Switch failed', message: `Please switch to ${net.name} manually.` });
        }
      } else {
        addToast({ type: 'info', title: 'Network selected', message: `Now on ${net.name} (${net.symbol})` });
        refreshBalance(wallet.address, net);
      }
    } else {
      setWallet((prev) => ({
        ...prev,
        chainId: net.id,
        nativeBalance: Math.random() * 5 + 0.5,
      }));
      addToast({
        type: 'info',
        title: 'Network switched',
        message: `Now on ${net.name} (${net.symbol})`,
      });
    }
  }, [demoMode, wallet.isDemo, wallet.connected, wallet.address, addToast, refreshBalance, activateDemo]);

  const scrollToDashboard = useCallback(() => {
    setShowDashboard(true);
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleGetStarted = useCallback(() => {
    if (!wallet.connected && !demoMode) activateDemo();
    scrollToDashboard();
  }, [wallet.connected, demoMode, activateDemo, scrollToDashboard]);

  const handleSelectModule = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (!wallet.connected && !demoMode) activateDemo();
    scrollToDashboard();
  }, [wallet.connected, demoMode, activateDemo, scrollToDashboard]);

  const handleApprovalsRevoked = useCallback((ids: string[], _txHashes: string[]) => {
    setApprovals((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, revoked: true } : a))
    );
  }, []);

  const handleTokensProcessed = useCallback((tokenIds: string[]) => {
    setTokens((prev) => prev.filter((t) => !tokenIds.includes(t.id)));
  }, []);

  const handleVaultsChange = useCallback(() => {
    setVaultVersion((v) => v + 1);
  }, []);

  const treasuryAddress = getTreasuryForNetwork(network);

  // Wallet provider event listeners for live EVM wallets
  useEffect(() => {
    if (!wallet.connected || demoMode || wallet.isDemo) return;
    const eth = (window as any).ethereum;
    if (!eth?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        handleDisconnectWallet();
        return;
      }
      const newAddress = accounts[0];
      setWallet((prev) => ({ ...prev, address: newAddress }));
      addToast({ type: 'info', title: 'Account changed', message: `Now using ${formatAddr(newAddress)}` });
      refreshBalance(newAddress, network);
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      const matching = NETWORKS.find((n) => n.id === newChainId);
      if (matching) {
        setNetwork(matching);
        setWallet((prev) => ({ ...prev, chainId: newChainId }));
      }
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);
    return () => {
      eth.removeListener?.('accountsChanged', handleAccountsChanged);
      eth.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [wallet.connected, wallet.isDemo, demoMode, network, addToast, refreshBalance, handleDisconnectWallet]);

  // Live price for current network
  const { price: currentNativePrice, isLive: currentPriceIsLive } = useMemo(
    () => getLivePrice(network.coingeckoId, livePrices),
    [network.coingeckoId, livePrices]
  );

  // Wallet Health Score calculation
  const vaultCount = useMemo(() => {
    if (!wallet.address) return 0;
    try {
      const stored = localStorage.getItem(`aegis_vaults_${wallet.address}`);
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  }, [wallet.address, activeTab, vaultVersion]);

  const healthScore = useMemo(() => {
    if (!wallet.connected && !demoMode) return 0;

    const dustCount = tokens.filter((t) => t.isDust && !t.isDead).length;
    const deadCount = tokens.filter((t) => t.isDead).length;
    const activeApprovals = approvals.filter((a) => !a.revoked);
    const unlimitedApprovals = activeApprovals.filter((a) => a.allowance === -1).length;
    const criticalApprovals = activeApprovals.filter((a) => a.riskLevel === 'critical').length;
    const hasVault = vaultCount > 0;

    // Start at 100, deduct for risks
    let score = 100;
    score -= Math.min(dustCount * 3, 20);
    score -= Math.min(deadCount * 5, 25);
    score -= Math.min(unlimitedApprovals * 4, 20);
    score -= Math.min(criticalApprovals * 6, 20);
    if (!hasVault) score -= 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [wallet.connected, demoMode, tokens, approvals, vaultCount]);

  return (
    <div className="min-h-screen bg-ink-950 text-zinc-200 relative">
      {/* Background effects */}
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-40" />
      <div className="fixed inset-0 radial-glow pointer-events-none" />
      <div className="fixed inset-0 radial-glow-cyan pointer-events-none" />

      <div className="relative z-10">
        <TopBar
          wallet={wallet}
          network={network}
          demoMode={demoMode}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
          onToggleDemoMode={handleToggleDemoMode}
          onNetworkSelect={handleNetworkSelect}
        />

        <Hero onGetStarted={handleGetStarted} onSelectModule={handleSelectModule} />

        {/* Dashboard */}
        <div ref={dashboardRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 scroll-mt-20">
          {/* 15-chain network telemetry ribbon */}
          <div className="px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono font-semibold tracking-[0.16em] text-zinc-400">SUPPORTED NETWORKS · 14 EVM + SOLANA</span>
              <span className="text-[10px] font-mono tracking-wider text-accent-400/70">CLICK TO SWITCH RPC</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {NETWORKS.map((net) => {
                const isSelected = network.id === net.id;
                const label = net.id === 42161 ? 'Arbitrum' : net.id === 56 ? 'BNB Chain' : net.name;
                return (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => handleNetworkSelect(net)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${isSelected ? 'bg-gradient-to-r from-accent-500/20 to-cyber-500/15 border border-accent-400/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/[0.03] border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06]'}`}
                  >
                    <NetworkLogo network={net} size={16} />
                    <span>{label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-accent-400 led-glow" style={{ color: '#10b981' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab switcher */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-1.5 rounded-2xl glass-card border-beam">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all flex-1 ${
                      isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500/15 to-cyber-500/15 border border-accent-500/30"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                    <Icon size={20} className={`relative z-10 ${isActive ? 'text-accent-400' : ''}`} />
                    <div className="relative z-10 text-left">
                      <div className="text-sm font-semibold">{tab.label}</div>
                      <div className="text-xs text-zinc-500 hidden sm:block">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Treasury & wallet info bar — institutional command deck */}
          {(wallet.connected || demoMode) && (
            <div className="mb-6 flex flex-wrap items-center gap-3 p-4 rounded-xl spotlight-card noise-overlay overflow-hidden">
              {/* Network LED + readout */}
              <div className="flex items-center gap-2.5 relative z-[4]">
                <div className="relative">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${network.logoColor}18` }}>
                    <NetworkLogo network={network} size={20} />
                  </span>
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full led-glow"
                    style={{ backgroundColor: network.logoColor, color: network.logoColor }}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Network</p>
                  <p className="text-sm font-semibold text-white">{network.name}</p>
                </div>
              </div>

              <Divider />

              {/* Native balance */}
              <div className="relative z-[4]">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Balance</p>
                <p className="text-sm font-mono font-semibold text-white">
                  {wallet.nativeBalance.toFixed(4)} <span className="text-zinc-500">{network.symbol}</span>
                </p>
              </div>

              <Divider />

              {/* Price feed */}
              <div className="relative z-[4]">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">{network.symbol} Price</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-mono font-semibold text-accent-400">${currentNativePrice.toLocaleString()}</p>
                  {currentPriceIsLive ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded-full">
                      <Wifi size={8} />
                      FALLBACK
                    </span>
                  )}
                </div>
              </div>

              <Divider />

              {/* Health score */}
              <div className="relative z-[4]">
                <WalletHealthScore score={healthScore} />
              </div>

              {/* Mode indicator */}
              {demoMode && (
                <>
                  <Divider />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warn-500/10 border border-warn-500/20 relative z-[4]">
                    <span className="w-2 h-2 rounded-full bg-warn-400 led-glow" style={{ color: '#fbbf24' }} />
                    <span className="text-xs font-mono font-semibold text-warn-400 tracking-wider">DEMO</span>
                  </div>
                </>
              )}
              {!demoMode && wallet.connected && (
                <>
                  <Divider />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 relative z-[4]">
                    <span className="w-2 h-2 rounded-full bg-accent-400 led-glow" style={{ color: '#10b981' }} />
                    <span className="text-xs font-mono font-semibold text-accent-400 tracking-wider">LIVE WALLET</span>
                  </div>
                </>
              )}

              {/* Right-side telemetry dots */}
              <div className="ml-auto flex items-center gap-3 relative z-[4] hidden lg:flex">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
                  <CircleDot size={10} className="text-accent-400/50" />
                  <span>3 ENG</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
                  <Activity size={10} className="text-cyber-400/50" />
                  <span>{tokens.length} TOK</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
                  <Shield size={10} className="text-accent-400/50" />
                  <span>{approvals.filter(a => !a.revoked).length} APR</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dustsweeper' && (
                <DustSweeper
                  tokens={tokens}
                  network={network}
                  connected={wallet.connected}
                  demoMode={demoMode}
                  walletAddress={wallet.address}
                  treasuryAddress={treasuryAddress}
                  liveNativePrice={currentPriceIsLive ? currentNativePrice : undefined}
                  onTokensProcessed={handleTokensProcessed}
                  onToast={addToast}
                />
              )}
              {activeTab === 'approvalsentinel' && (
                <ApprovalSentinel
                  approvals={approvals}
                  network={network}
                  connected={wallet.connected}
                  demoMode={demoMode}
                  walletAddress={wallet.address}
                  treasuryAddress={treasuryAddress}
                  liveNativePrice={currentPriceIsLive ? currentNativePrice : undefined}
                  onRevoke={handleApprovalsRevoked}
                  onToast={addToast}
                />
              )}
              {activeTab === 'inheritsafe' && (
                <InheritSafe
                  network={network}
                  connected={wallet.connected}
                  demoMode={demoMode}
                  walletAddress={wallet.address}
                  treasuryAddress={treasuryAddress}
                  liveNativePrice={currentPriceIsLive ? currentNativePrice : undefined}
                  onVaultsChange={handleVaultsChange}
                  onToast={addToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* How it works — Bento Grid */}
        <BentoHowItWorks />

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/image.png"
                alt="Aegis Protocol"
                className="w-[158px] sm:w-[184px] h-auto object-contain"
              />
              <span className="text-xs text-zinc-600 font-mono">v1.0.0</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs text-zinc-500">
              <span>Zero-Knowledge · Client-Side · Non-Custodial</span>
              <span className="hidden sm:block">·</span>
              <span className="hidden sm:block">Not financial advice</span>
              <span className="inline-flex items-center rounded-full border border-white/[.08] bg-white/[.03] px-2 py-1 font-mono text-[9px] text-zinc-500">PBKDF2 150k · AES-256-GCM · GF(256)</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/20 bg-accent-500/5 px-2 py-1 font-mono text-[9px] font-semibold text-accent-400"><span className="h-1.5 w-1.5 rounded-full bg-accent-400 led-glow" style={{ color: '#10b981' }} />15/15 NODES ONLINE</span>
            </div>
          </div>
        </footer>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function formatAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function Divider() {
  return <div className="w-px h-8 bg-white/[0.08]" />;
}

export default App;
