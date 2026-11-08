import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Flame,
  Download,
  Search,
  Loader2,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
  Coins,
  DollarSign,
  FileText,
  Printer,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Tooltip } from './ui/Tooltip';
import { formatUsd, formatTokenAmount, shortHash, generateTxHash, getExplorerTxUrl, FEES, calculateNativeCost, formatNativeCost, formatAddress } from '@/utils/format';
import { generateTaxLossCSV, downloadCSV } from '@/utils/csv';
import { getNativePrice } from '@/utils/demoData';
import { sendFeeTransfer } from '@/utils/web3';
import type { TokenHolding, NetworkConfig, ToastMessage } from '@/types';

interface DustSweeperProps {
  tokens: TokenHolding[];
  network: NetworkConfig;
  connected: boolean;
  demoMode: boolean;
  walletAddress: string;
  treasuryAddress: string;
  liveNativePrice?: number;
  onTokensProcessed: (tokenIds: string[]) => void;
  onToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

interface ProcessedTx {
  token: TokenHolding;
  txHash: string;
  action: string;
  realizedLoss: number;
  feeTxHash?: string;
}

export function DustSweeper({ tokens, network, connected, demoMode, walletAddress, treasuryAddress, liveNativePrice, onTokensProcessed, onToast }: DustSweeperProps) {
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState<string | null>(null);
  const [processedTxs, setProcessedTxs] = useState<ProcessedTx[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [lastExportData, setLastExportData] = useState<ProcessedTx[]>([]);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [unlockedRecordCount, setUnlockedRecordCount] = useState(0);
  const [unlockedChainId, setUnlockedChainId] = useState<number | null>(null);
  const [taxFeeTxHash, setTaxFeeTxHash] = useState('');
  const [unlockingReport, setUnlockingReport] = useState(false);
  const dustTokens = useMemo(() => tokens.filter((t) => t.isDust && !t.isDead), [tokens]);
  const deadTokens = useMemo(() => tokens.filter((t) => t.isDead), [tokens]);
  const actionableTokens = useMemo(() => tokens.filter((t) => t.isDust || t.isDead), [tokens]);

  const totalRealizedLoss = useMemo(
    () => processedTxs.reduce((sum, tx) => sum + tx.realizedLoss, 0),
    [processedTxs]
  );

  const selectedDust = useMemo(
    () => dustTokens.filter((t) => selected.has(t.id)),
    [dustTokens, selected]
  );
  const selectedDead = useMemo(
    () => deadTokens.filter((t) => selected.has(t.id)),
    [deadTokens, selected]
  );

  const nativePrice = liveNativePrice ?? getNativePrice(network.coingeckoId);
  const dustFeeUsd = FEES.DUST_SWEEP();
  const exportFeeUsd = FEES.TAX_EXPORT();
  const dustCostNative = calculateNativeCost(dustFeeUsd, nativePrice);
  const exportCostNative = calculateNativeCost(exportFeeUsd, nativePrice);

  const taxReportUnlocked = processedTxs.length > 0 && unlockedRecordCount === processedTxs.length && unlockedChainId === network.id;

  useEffect(() => {
    if (!connected && !demoMode) {
      setHasScanned(false);
      setSelected(new Set());
      setUnlockedRecordCount(0);
      setUnlockedChainId(null);
      setTaxFeeTxHash('');
      return;
    }
    if (tokens.length > 0 && !hasScanned && !scanning) {
      setHasScanned(true);
      setSelected(new Set(actionableTokens.map((t) => t.id)));
    }
  }, [connected, demoMode, tokens.length, hasScanned, scanning, actionableTokens]);

  const handleScan = async () => {
    if (!connected && !demoMode) {
      onToast({ type: 'warning', title: 'Wallet not connected', message: 'Connect a wallet or enable Demo Mode to scan.' });
      return;
    }
    setScanning(true);
    setHasScanned(false);
    setSelected(new Set());

    await new Promise((r) => setTimeout(r, 1800));

    setScanning(false);
    setHasScanned(true);

    const allIds = new Set(actionableTokens.map((t) => t.id));
    setSelected(allIds);

    onToast({
      type: 'success',
      title: 'Scan complete',
      message: `Found ${dustTokens.length} dust tokens and ${deadTokens.length} dead/scam tokens.`,
    });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAllDust = () => {
    const next = new Set(selected);
    dustTokens.forEach((t) => next.add(t.id));
    setSelected(next);
  };

  const selectAllDead = () => {
    const next = new Set(selected);
    deadTokens.forEach((t) => next.add(t.id));
    setSelected(next);
  };

  const payFee = async (action: string): Promise<string | undefined> => {
    if (demoMode || !walletAddress || !treasuryAddress) {
      await new Promise((r) => setTimeout(r, 800));
      return generateTxHash();
    }
    try {
      const feeNative = calculateNativeCost(dustFeeUsd, nativePrice);
      const txHash = await sendFeeTransfer(walletAddress, treasuryAddress, feeNative, network);
      onToast({ type: 'info', title: 'Fee transaction sent', message: `${formatUsd(dustFeeUsd)} → treasury (${shortHash(txHash, 10, 6)})` });
      return txHash;
    } catch (err: any) {
      onToast({ type: 'error', title: 'Fee payment failed', message: err?.message || 'Transaction rejected.' });
      throw err;
    }
  };

  const handleConsolidateDust = async () => {
    if (selectedDust.length === 0) {
      onToast({ type: 'warning', title: 'No tokens selected', message: 'Select dust tokens to consolidate.' });
      return;
    }
    setProcessing('dust');

    try {
      const feeTxHash = await payFee('dust');

      await new Promise((r) => setTimeout(r, 1500));

      const newTxs: ProcessedTx[] = selectedDust.map((t) => ({
        token: t,
        txHash: generateTxHash(),
        action: 'Consolidate Dust to Native',
        realizedLoss: Math.max(0, (t.originalInvestmentUsd || 0) - t.valueUsd),
        feeTxHash,
      }));

      setProcessedTxs((prev) => [...prev, ...newTxs]);
      setProcessing(null);

      onToast({
        type: 'success',
        title: 'Dust consolidated',
        message: `Swapped ${selectedDust.length} dust tokens into ${network.symbol}. Realized loss: ${formatUsd(newTxs.reduce((s, t) => s + t.realizedLoss, 0))}`,
      });

      const next = new Set(selected);
      selectedDust.forEach((t) => next.delete(t.id));
      setSelected(next);
      onTokensProcessed(selectedDust.map((t) => t.id));
    } catch {
      setProcessing(null);
    }
  };

  const handleBurnDead = async () => {
    if (selectedDead.length === 0) {
      onToast({ type: 'warning', title: 'No tokens selected', message: 'Select dead/scam tokens to burn.' });
      return;
    }
    setProcessing('burn');

    try {
      const feeTxHash = await payFee('burn');

      await new Promise((r) => setTimeout(r, 1500));

      const newTxs: ProcessedTx[] = selectedDead.map((t) => ({
        token: t,
        txHash: generateTxHash(),
        action: 'Burn & Claim Tax Loss',
        realizedLoss: t.originalInvestmentUsd || 0,
        feeTxHash,
      }));

      setProcessedTxs((prev) => [...prev, ...newTxs]);
      setProcessing(null);

      onToast({
        type: 'success',
        title: 'Tokens burned',
        message: `Burned ${selectedDead.length} dead tokens. Tax loss harvested: ${formatUsd(newTxs.reduce((s, t) => s + t.realizedLoss, 0))}`,
      });

      const next = new Set(selected);
      selectedDead.forEach((t) => next.delete(t.id));
      setSelected(next);
      onTokensProcessed(selectedDead.map((t) => t.id));
    } catch {
      setProcessing(null);
    }
  };

  const payTaxReportFee = async (): Promise<boolean> => {
    setUnlockingReport(true);
    try {
      if (demoMode || !walletAddress || !treasuryAddress) {
        await new Promise((r) => setTimeout(r, 600));
        onToast({ type: 'info', title: 'Tax Report Fee ($19) settled (Demo)', message: 'Cryptographic tax ledger unlocked for export.' });
        setTaxFeeTxHash(generateTxHash());
      } else {
        const txHash = await sendFeeTransfer(walletAddress, treasuryAddress, exportCostNative, network);
        onToast({ type: 'info', title: 'Tax Report Fee paid', message: `${formatUsd(exportFeeUsd)} → treasury (${shortHash(txHash, 10, 6)})` });
        setTaxFeeTxHash(txHash);
      }
      setUnlockedRecordCount(processedTxs.length);
      setUnlockedChainId(network.id);
      return true;
    } catch (err: any) {
      onToast({ type: 'error', title: 'Unlock failed', message: err?.message || 'Fee transaction rejected.' });
      return false;
    } finally {
      setUnlockingReport(false);
    }
  };

  const handleExport = async () => {
    if (processedTxs.length === 0) {
      onToast({ type: 'warning', title: 'Nothing to export', message: 'Process some tokens first to generate a tax report.' });
      return;
    }
    if (!taxReportUnlocked) {
      const ok = await payTaxReportFee();
      if (!ok) return;
    }

    const csv = generateTaxLossCSV(
      processedTxs.map((tx) => ({ token: tx.token, txHash: tx.txHash, action: tx.action, realizedLoss: tx.realizedLoss })),
      network
    );

    const finalCsv = demoMode
      ? '# DEMO SIMULATION - NOT VALID FOR TAX FILING\n' + csv
      : csv;

    const filename = `aegis_tax_loss_${network.shortName}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(finalCsv, filename);
    setLastExportData(processedTxs);
    setExportModalOpen(true);

    onToast({
      type: 'success',
      title: 'Tax report exported',
      message: `${filename} downloaded with ${processedTxs.length} records.`,
    });
  };

  const handleCertOpen = async () => {
    if (processedTxs.length === 0) {
      onToast({ type: 'warning', title: 'Nothing to certify', message: 'Process some tokens first to generate a tax certificate.' });
      return;
    }
    if (!taxReportUnlocked) {
      const ok = await payTaxReportFee();
      if (!ok) return;
    }
    setCertModalOpen(true);
  };

  const isActive = connected || demoMode;
  const certDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `AES-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* Header with scan button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-accent-400" />
            <h2 className="text-xl font-bold text-white">DustSweeper & Tax-Loss Harvester</h2>
          </div>
          <p className="text-sm text-zinc-500">
            Scan your wallet for dust and dead tokens, consolidate them into native gas, and harvest tax losses.
          </p>
        </div>
        <Button onClick={handleScan} loading={scanning} disabled={!isActive} size="lg">
          {!scanning && <Search size={18} />}
          {scanning ? 'Scanning Wallet...' : hasScanned ? 'Re-scan Wallet' : 'Scan Wallet'}
        </Button>
      </div>

      {/* Realized Loss Counter */}
      <Card className="p-5" delay={0.1}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-err-500/10 border border-err-500/20">
              <TrendingDown size={24} className="text-err-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Realized Tax Loss</p>
              <p className="text-3xl font-bold font-mono text-err-400">
                {formatUsd(totalRealizedLoss)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-zinc-500">Service Fee</p>
              <p className="text-sm font-mono text-accent-400">
                {formatNativeCost(dustCostNative, network.symbol)} · ${dustFeeUsd}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCertOpen} variant="outline" size="md" loading={unlockingReport} disabled={processedTxs.length === 0}>
                <FileText size={16} />
                Tax Certificate
              </Button>
              <Button onClick={handleExport} variant="outline" size="md" loading={unlockingReport}>
                <Download size={16} />
                Export CSV
              </Button>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${taxReportUnlocked ? 'bg-accent-500/15 text-accent-400 border-accent-500/25' : 'bg-warn-500/10 text-warn-400 border-warn-500/25'}`}>
                {taxReportUnlocked ? 'Unlocked ✓' : 'Unlock Report · $19'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Scanning state */}
      {scanning && (
        <Card className="p-12 flex flex-col items-center justify-center" hover={false}>
          <Loader2 size={40} className="text-accent-400 animate-spin mb-4" />
          <p className="text-sm text-zinc-400 font-mono">Scanning wallet across {network.name}...</p>
          <p className="text-xs text-zinc-600 mt-1">Checking token balances, liquidity pools, and price feeds</p>
        </Card>
      )}

      {/* Empty state */}
      {!scanning && !hasScanned && (
        <Card className="p-16 flex flex-col items-center justify-center text-center" hover={false}>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Search size={32} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">No scan performed yet</p>
          <p className="text-xs text-zinc-600">
            {isActive ? 'Click "Scan Wallet" to identify dust and dead tokens' : 'Connect a wallet or enable Demo Mode to start'}
          </p>
        </Card>
      )}

      {/* Token tables */}
      {hasScanned && !scanning && dustTokens.length === 0 && deadTokens.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center" hover={false}>
          <div className="p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 mb-4">
            <CheckCircle2 size={32} className="text-accent-400" />
          </div>
          <p className="text-sm font-medium text-white mb-1">Wallet Clean</p>
          <p className="text-xs text-zinc-500">All dust and dead tokens have been swept and harvested.</p>
        </Card>
      )}

      {hasScanned && !scanning && (dustTokens.length > 0 || deadTokens.length > 0) && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Dust Tokens */}
            {dustTokens.length > 0 && (
              <Card className="overflow-hidden" delay={0.1}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-500/10">
                      <Coins size={18} className="text-accent-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Dust Tokens</h3>
                      <p className="text-xs text-zinc-500">{dustTokens.length} tokens with value under $1.00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {selectedDust.length}/{dustTokens.length} selected
                    </span>
                    <button
                      onClick={selectAllDust}
                      className="text-xs text-accent-400 hover:text-accent-300 font-medium"
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-zinc-500">
                        <th className="text-left font-medium px-4 py-2.5 w-10"></th>
                        <th className="text-left font-medium px-4 py-2.5">Token</th>
                        <th className="text-right font-medium px-4 py-2.5">Balance</th>
                        <th className="text-right font-medium px-4 py-2.5 hidden sm:table-cell">Price</th>
                        <th className="text-right font-medium px-4 py-2.5">Value</th>
                        <th className="text-right font-medium px-4 py-2.5 hidden md:table-cell">Gas Est.</th>
                        <th className="text-center font-medium px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dustTokens.map((token) => (
                        <tr
                          key={token.id}
                          className={`border-b border-white/[0.02] transition-colors ${
                            selected.has(token.id) ? 'bg-accent-500/5' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="aegis-checkbox"
                              checked={selected.has(token.id)}
                              onChange={() => toggleSelect(token.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ backgroundColor: `${token.logoColor}20`, color: token.logoColor }}
                              >
                                {token.logoSymbol}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-white">{token.symbol}</div>
                                <div className="text-xs text-zinc-500">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-zinc-300">
                            {formatTokenAmount(token.balance, token.decimals)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-zinc-500 hidden sm:table-cell">
                            ${token.priceUsd < 0.01 ? token.priceUsd.toExponential(2) : token.priceUsd.toFixed(4)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-accent-400">
                            {formatUsd(token.valueUsd)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-zinc-500 hidden md:table-cell">
                            ~0.0001 {network.symbol}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="warning" size="sm">DUST</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Dead Tokens */}
            {deadTokens.length > 0 && (
              <Card className="overflow-hidden" delay={0.15}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-err-500/10">
                      <AlertTriangle size={18} className="text-err-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Dead / Rugged / Scam Tokens</h3>
                      <p className="text-xs text-zinc-500">{deadTokens.length} tokens with $0 liquidity — eligible for burn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {selectedDead.length}/{deadTokens.length} selected
                    </span>
                    <button
                      onClick={selectAllDead}
                      className="text-xs text-err-400 hover:text-err-300 font-medium"
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-zinc-500">
                        <th className="text-left font-medium px-4 py-2.5 w-10"></th>
                        <th className="text-left font-medium px-4 py-2.5">Token</th>
                        <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Contract</th>
                        <th className="text-right font-medium px-4 py-2.5">Balance</th>
                        <th className="text-right font-medium px-4 py-2.5">Original Cost</th>
                        <th className="text-right font-medium px-4 py-2.5">Tax Loss</th>
                        <th className="text-center font-medium px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deadTokens.map((token) => (
                        <tr
                          key={token.id}
                          className={`border-b border-white/[0.02] transition-colors ${
                            selected.has(token.id) ? 'bg-err-500/5' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="aegis-checkbox"
                              checked={selected.has(token.id)}
                              onChange={() => toggleSelect(token.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 grayscale opacity-60"
                                style={{ backgroundColor: `${token.logoColor}20`, color: token.logoColor }}
                              >
                                {token.logoSymbol}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-white line-through opacity-60">{token.symbol}</div>
                                <div className="text-xs text-zinc-500">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Tooltip content="View on explorer">
                              <a
                                href={`${network.explorerUrl}/address/${token.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-zinc-500 hover:text-accent-400 inline-flex items-center gap-1"
                              >
                                {shortHash(token.contractAddress, 8, 6)}
                                <ExternalLink size={11} />
                              </a>
                            </Tooltip>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-zinc-500">
                            {formatTokenAmount(token.balance, token.decimals)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-zinc-400">
                            {formatUsd(token.originalInvestmentUsd || 0)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-err-400">
                            -{formatUsd(token.originalInvestmentUsd || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="error" size="sm">DEAD</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="p-5" delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{selected.size}</span> tokens selected
                  {selectedDust.length > 0 && <span className="text-accent-400"> · {selectedDust.length} dust</span>}
                  {selectedDead.length > 0 && <span className="text-err-400"> · {selectedDead.length} dead</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleConsolidateDust}
                    loading={processing === 'dust'}
                    disabled={selectedDust.length === 0 || processing !== null}
                  >
                    <Zap size={16} />
                    Consolidate Dust ({selectedDust.length})
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleBurnDead}
                    loading={processing === 'burn'}
                    disabled={selectedDead.length === 0 || processing !== null}
                  >
                    <Flame size={16} />
                    Burn & Harvest ({selectedDead.length})
                  </Button>
                </div>
              </div>
            </Card>

            {/* Processed Transactions */}
            {processedTxs.length > 0 && (
              <Card className="overflow-hidden" delay={0.25}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-500/10">
                      <CheckCircle2 size={18} className="text-accent-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Processed Transactions</h3>
                      <p className="text-xs text-zinc-500">{processedTxs.length} transactions completed on {network.name}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {processedTxs.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: `${tx.token.logoColor}20`, color: tx.token.logoColor }}
                        >
                          {tx.token.logoSymbol}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {tx.action} · {tx.token.symbol}
                          </div>
                          <a
                            href={getExplorerTxUrl(network, tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-zinc-500 hover:text-accent-400 inline-flex items-center gap-1"
                          >
                            {shortHash(tx.txHash)}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {tx.realizedLoss > 0 && (
                          <span className="text-sm font-mono text-err-400">-{formatUsd(tx.realizedLoss)}</span>
                        )}
                        <CheckCircle2 size={16} className="text-accent-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Export Modal */}
      <Modal open={exportModalOpen} onClose={() => setExportModalOpen(false)} title="Tax Loss Report Generated">
        {lastExportData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
              <CheckCircle2 size={24} className="text-accent-400" />
              <div>
                <p className="text-sm font-medium text-white">CSV file downloaded successfully</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {lastExportData.length} transactions · {formatUsd(totalRealizedLoss)} total realized loss
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Report Summary</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-zinc-500">Transactions</p>
                  <p className="text-lg font-bold text-white font-mono">{lastExportData.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-zinc-500">Total Loss</p>
                  <p className="text-lg font-bold text-err-400 font-mono">{formatUsd(totalRealizedLoss)}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-zinc-500">Network</p>
                  <p className="text-sm font-bold text-white">{network.name}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-zinc-500">Export Date</p>
                  <p className="text-sm font-bold text-white font-mono">{new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-500 bg-white/5 p-3 rounded-lg">
              <p className="font-medium text-zinc-400 mb-1">CSV includes:</p>
              <ul className="space-y-0.5">
                <li>• Transaction hashes & token contract addresses</li>
                <li>• Original investment cost vs. current value</li>
                <li>• Realized loss in USD for each position</li>
                <li>• Network and action type for each transaction</li>
              </ul>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-500">
                <DollarSign size={14} />
                Export fee: <span className="font-mono text-accent-400">{formatNativeCost(exportCostNative, network.symbol)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setCertModalOpen(true); setExportModalOpen(false); }}>
                  <FileText size={14} /> Certificate
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setExportModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Tax Certificate Modal */}
      <Modal open={certModalOpen} onClose={() => setCertModalOpen(false)} title="Capital Loss Statement" size="lg">
        <div className="space-y-4">
          {demoMode && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-err-500/10 border border-err-500/30 text-xs font-bold text-err-400 tracking-wide">
              <AlertTriangle size={16} className="flex-shrink-0" />
              DEMO SIMULATION ONLY — UNPAID / NOT VALID FOR IRS OR EU TAX FILING
            </div>
          )}
          <div className="cert-print-area bg-white text-black rounded-lg p-8 font-mono text-sm relative overflow-hidden">
            {demoMode && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className="text-5xl font-bold text-red-500/10 -rotate-12 select-none whitespace-nowrap">DEMO · UNPAID</span>
              </div>
            )}
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-tight">CAPITAL LOSS STATEMENT</h1>
              <p className="text-xs mt-1 text-gray-600">IRS Form 8949 / EU Summary Equivalent</p>
              <p className="text-xs mt-1 text-gray-600">Certificate ID: {certId}</p>
            </div>

            {/* Taxpayer Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              <div>
                <p className="font-bold text-gray-700">Wallet Address:</p>
                <p className="break-all">{walletAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold text-gray-700">Network:</p>
                <p>{network.name} ({network.symbol})</p>
              </div>
              <div>
                <p className="font-bold text-gray-700">Date of Statement:</p>
                <p>{certDate}</p>
              </div>
              <div>
                <p className="font-bold text-gray-700">Total Realized Loss:</p>
                <p className="font-bold text-red-600">{formatUsd(totalRealizedLoss)}</p>
              </div>
            </div>

            {/* Itemized table */}
            <table className="w-full text-xs border border-gray-300 mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">Token</th>
                  <th className="border border-gray-300 px-2 py-1 text-left hidden sm:table-cell">Contract</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Action</th>
                  <th className="border border-gray-300 px-2 py-1 text-left hidden sm:table-cell">Tx Hash</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Loss (USD)</th>
                </tr>
              </thead>
              <tbody>
                {processedTxs.map((tx, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="border border-gray-300 px-2 py-1">{tx.token.symbol}</td>
                    <td className="border border-gray-300 px-2 py-1 text-[10px] hidden sm:table-cell break-all">{tx.token.contractAddress.slice(0, 20)}...</td>
                    <td className="border border-gray-300 px-2 py-1">{tx.action}</td>
                    <td className="border border-gray-300 px-2 py-1 text-[10px] hidden sm:table-cell">{tx.txHash.slice(0, 18)}...</td>
                    <td className="border border-gray-300 px-2 py-1 text-right font-bold text-red-600">${tx.realizedLoss.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 px-2 py-1" colSpan={4}>TOTAL DEDUCTIBLE CAPITAL LOSS</td>
                  <td className="border border-gray-300 px-2 py-1 text-right text-red-600">${totalRealizedLoss.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div className="text-xs text-gray-600 border-t border-gray-300 pt-4">
              <p className="mb-1">FEE RECEIPT TX: {taxFeeTxHash || 'N/A'}</p>
              <p className="mb-1">This statement was generated by Aegis Protocol on {certDate}.</p>
              <p className="mb-1">Transaction hashes are verifiable on {network.explorerUrl}.</p>
              <p className="mb-1">This document is for tax reporting purposes and should be attached to IRS Form 8949 or equivalent EU tax filing.</p>
              <p className="text-[10px] mt-2 text-gray-400">Aegis Protocol is not a tax advisor. Consult a certified accountant for filing guidance.</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <FileText size={14} />
              {processedTxs.length} line items · {formatUsd(totalRealizedLoss)} total loss
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer size={14} /> Print / Save PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCertModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
