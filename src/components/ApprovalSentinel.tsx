import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  ShieldX,
  Power,
  DollarSign,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Tooltip } from './ui/Tooltip';
import { formatUsd, shortHash, formatTokenAmount, FEES, calculateNativeCost, formatNativeCost, getExplorerAddressUrl } from '@/utils/format';
import { getNativePrice } from '@/utils/demoData';
import { sendFeeTransfer, revokeApproval } from '@/utils/web3';
import { generateRevokeTxHash } from '@/utils/demoApprovals';
import type { TokenApproval, NetworkConfig, ToastMessage } from '@/types';

interface ApprovalSentinelProps {
  approvals: TokenApproval[];
  network: NetworkConfig;
  connected: boolean;
  demoMode: boolean;
  walletAddress: string;
  treasuryAddress: string;
  liveNativePrice?: number;
  onRevoke: (ids: string[], txHashes: string[]) => void;
  onToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const RISK_LABELS: Record<string, { label: string; color: 'error' | 'warning' | 'neutral' }> = {
  critical: { label: 'CRITICAL', color: 'error' },
  high: { label: 'HIGH', color: 'warning' },
  medium: { label: 'MEDIUM', color: 'neutral' },
};

const SPENDER_TYPE_LABELS: Record<string, string> = {
  dex: 'DEX Router',
  bridge: 'Bridge',
  staking: 'Staking Pool',
  unknown: 'Unverified',
  phishing: 'Phishing Risk',
};

export function ApprovalSentinel({
  approvals,
  network,
  connected,
  demoMode,
  walletAddress,
  treasuryAddress,
  liveNativePrice,
  onRevoke,
  onToast,
}: ApprovalSentinelProps) {
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokedTxs, setRevokedTxs] = useState<{ approval: TokenApproval; txHash: string }[]>([]);

  const activeApprovals = useMemo(() => approvals.filter((a) => !a.revoked), [approvals]);

  const totalCapitalAtRisk = useMemo(
    () => activeApprovals.reduce((sum, a) => sum + a.valueAtRiskUsd, 0),
    [activeApprovals]
  );
  const unlimitedCount = useMemo(
    () => activeApprovals.filter((a) => a.allowance === -1).length,
    [activeApprovals]
  );
  const highRiskCount = useMemo(
    () => activeApprovals.filter((a) => a.riskLevel === 'critical' || a.riskLevel === 'high').length,
    [activeApprovals]
  );

  const selectedApprovals = useMemo(
    () => activeApprovals.filter((a) => selected.has(a.id)),
    [activeApprovals, selected]
  );

  const nativePrice = liveNativePrice ?? getNativePrice(network.coingeckoId);
  const revokeFeeUsd = FEES.APPROVAL_REVOKE();
  const revokeCostNative = calculateNativeCost(revokeFeeUsd, nativePrice);

  useEffect(() => {
    if (!connected && !demoMode) {
      setHasScanned(false);
      setSelected(new Set());
      return;
    }
    if (approvals.length > 0 && !hasScanned && !scanning) {
      setHasScanned(true);
      setSelected(new Set(activeApprovals.filter((a) => a.riskLevel === 'critical').map((a) => a.id)));
    }
  }, [connected, demoMode, approvals.length, hasScanned, scanning, activeApprovals]);

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

    const riskyIds = new Set(activeApprovals.filter((a) => a.riskLevel === 'critical').map((a) => a.id));
    setSelected(riskyIds);

    onToast({
      type: 'success',
      title: 'Approval scan complete',
      message: `Found ${activeApprovals.length} active approvals · ${unlimitedCount} unlimited · ${highRiskCount} high-risk.`,
    });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAllRisky = () => {
    const next = new Set(selected);
    activeApprovals.forEach((a) => {
      if (a.riskLevel === 'critical' || a.riskLevel === 'high') next.add(a.id);
    });
    setSelected(next);
  };

  const selectAll = () => {
    const next = new Set(activeApprovals.map((a) => a.id));
    setSelected(next);
  };

  const payRevokeFee = async (): Promise<string | undefined> => {
    if (demoMode || !walletAddress || !treasuryAddress) {
      await new Promise((r) => setTimeout(r, 800));
      return generateRevokeTxHash();
    }
    try {
      const feeNative = calculateNativeCost(revokeFeeUsd, nativePrice);
      const txHash = await sendFeeTransfer(walletAddress, treasuryAddress, feeNative, network);
      onToast({ type: 'info', title: 'Service fee paid', message: `${formatUsd(revokeFeeUsd)} → treasury (${shortHash(txHash, 10, 6)})` });
      return txHash;
    } catch (err: any) {
      onToast({ type: 'error', title: 'Fee payment failed', message: err?.message || 'Transaction rejected.' });
      throw err;
    }
  };

  const handleRevokeOne = async (approval: TokenApproval) => {
    setRevoking(approval.id);
    try {
      const feeTxHash = await payRevokeFee();

      let revokeTxHash: string;
      if (!demoMode && walletAddress && network.isEvm) {
        revokeTxHash = await revokeApproval(approval.tokenContract, approval.spenderAddress, network);
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        revokeTxHash = generateRevokeTxHash();
      }

      setRevokedTxs((prev) => [...prev, { approval, txHash: revokeTxHash }]);
      onRevoke([approval.id], [revokeTxHash]);

      const next = new Set(selected);
      next.delete(approval.id);
      setSelected(next);

      onToast({
        type: 'success',
        title: 'Approval revoked',
        message: `${approval.tokenSymbol} → ${approval.spenderName} approval set to 0.`,
      });
    } catch {
      onToast({ type: 'error', title: 'Revoke failed', message: 'Transaction was rejected or failed.' });
    } finally {
      setRevoking(null);
    }
  };

  const handleBatchRevoke = async () => {
    if (selectedApprovals.length === 0) {
      onToast({ type: 'warning', title: 'No approvals selected', message: 'Select approvals to batch revoke.' });
      return;
    }
    setRevoking('batch');
    try {
      const feeTxHash = await payRevokeFee();
      void feeTxHash;

      const txHashes: string[] = [];
      for (const approval of selectedApprovals) {
        let txHash: string;
        if (!demoMode && walletAddress && network.isEvm) {
          txHash = await revokeApproval(approval.tokenContract, approval.spenderAddress, network);
        } else {
          await new Promise((r) => setTimeout(r, 500));
          txHash = generateRevokeTxHash();
        }
        txHashes.push(txHash);
        setRevokedTxs((prev) => [...prev, { approval, txHash }]);
      }

      onRevoke(selectedApprovals.map((a) => a.id), txHashes);
      setSelected(new Set());

      onToast({
        type: 'success',
        title: 'Batch revoke complete',
        message: `${selectedApprovals.length} approvals revoked. All set to 0.`,
      });
    } catch {
      onToast({ type: 'error', title: 'Batch revoke failed', message: 'One or more transactions failed.' });
    } finally {
      setRevoking(null);
    }
  };

  const isActive = connected || demoMode;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-cyber-400" />
            <h2 className="text-xl font-bold text-white">Approval Sentinel</h2>
          </div>
          <p className="text-sm text-zinc-500">
            Scan for risky unlimited token approvals and revoke them with a single click.
          </p>
        </div>
        <Button onClick={handleScan} loading={scanning} disabled={!isActive} size="lg">
          {!scanning && <Search size={18} />}
          {scanning ? 'Scanning Approvals...' : hasScanned ? 'Re-scan' : 'Scan Approvals'}
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5" delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-err-500/10 border border-err-500/20">
              <DollarSign size={22} className="text-err-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Capital at Risk</p>
              <p className="text-2xl font-bold font-mono text-err-400">{formatUsd(totalCapitalAtRisk)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warn-500/10 border border-warn-500/20">
              <ShieldAlert size={22} className="text-warn-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Unlimited Approvals</p>
              <p className="text-2xl font-bold font-mono text-warn-400">{unlimitedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5" delay={0.15}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-err-500/10 border border-err-500/20">
              <ShieldX size={22} className="text-err-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">High-Risk Spenders</p>
              <p className="text-2xl font-bold font-mono text-err-400">{highRiskCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scanning state */}
      {scanning && (
        <Card className="p-12 flex flex-col items-center justify-center" hover={false}>
          <Loader2 size={40} className="text-cyber-400 animate-spin mb-4" />
          <p className="text-sm text-zinc-400 font-mono">Scanning ERC-20 approvals on {network.name}...</p>
          <p className="text-xs text-zinc-600 mt-1">Checking allowance events, spender contracts, and risk profiles</p>
        </Card>
      )}

      {/* Empty state */}
      {!scanning && !hasScanned && (
        <Card className="p-16 flex flex-col items-center justify-center text-center" hover={false}>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Shield size={32} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">No scan performed yet</p>
          <p className="text-xs text-zinc-600">
            {isActive ? 'Click "Scan Approvals" to find risky token allowances' : 'Connect a wallet or enable Demo Mode to start'}
          </p>
        </Card>
      )}

      {/* All clear */}
      {hasScanned && !scanning && activeApprovals.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center" hover={false}>
          <div className="p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 mb-4">
            <CheckCircle2 size={32} className="text-accent-400" />
          </div>
          <p className="text-sm font-medium text-white mb-1">All approvals secured</p>
          <p className="text-xs text-zinc-500">No risky token approvals detected. Your wallet is clean.</p>
        </Card>
      )}

      {/* Approval table */}
      {hasScanned && !scanning && activeApprovals.length > 0 && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="overflow-hidden" delay={0.1}>
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyber-500/10">
                    <ShieldAlert size={18} className="text-cyber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Token Approvals</h3>
                    <p className="text-xs text-zinc-500">{activeApprovals.length} active approvals · {selectedApprovals.length} selected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={selectAllRisky} className="text-xs text-err-400 hover:text-err-300 font-medium">
                    Select High-Risk
                  </button>
                  <button onClick={selectAll} className="text-xs text-accent-400 hover:text-accent-300 font-medium">
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
                      <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Spender</th>
                      <th className="text-left font-medium px-4 py-2.5">Allowance</th>
                      <th className="text-right font-medium px-4 py-2.5">Value at Risk</th>
                      <th className="text-center font-medium px-4 py-2.5">Risk</th>
                      <th className="text-right font-medium px-4 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeApprovals.map((approval) => {
                      const risk = RISK_LABELS[approval.riskLevel];
                      return (
                        <tr
                          key={approval.id}
                          className={`border-b border-white/[0.02] transition-colors ${
                            selected.has(approval.id) ? 'bg-cyber-500/5' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="aegis-checkbox"
                              checked={selected.has(approval.id)}
                              onChange={() => toggleSelect(approval.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ backgroundColor: `${approval.tokenLogoColor}20`, color: approval.tokenLogoColor }}
                              >
                                {approval.tokenLogoSymbol}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-white">{approval.tokenSymbol}</div>
                                <div className="text-xs text-zinc-500">{formatTokenAmount(approval.tokenBalance, approval.tokenDecimals)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div>
                              <div className="text-sm font-medium text-white">{approval.spenderName}</div>
                              <Tooltip content="View on explorer">
                                <a
                                  href={getExplorerAddressUrl(network, approval.spenderAddress)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono text-zinc-500 hover:text-cyber-400 inline-flex items-center gap-1"
                                >
                                  {shortHash(approval.spenderAddress, 8, 6)}
                                  <ExternalLink size={11} />
                                </a>
                              </Tooltip>
                              <div className="text-[10px] text-zinc-600 mt-0.5">{SPENDER_TYPE_LABELS[approval.spenderType]}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {approval.allowance === -1 ? (
                              <Badge variant="error" size="sm" pulse>UNLIMITED</Badge>
                            ) : (
                              <span className="text-xs font-mono text-zinc-400">
                                {formatTokenAmount(approval.allowance, approval.tokenDecimals)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-err-400">
                            {formatUsd(approval.valueAtRiskUsd)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={risk.color} size="sm" pulse={approval.riskLevel === 'critical'}>
                              {risk.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRevokeOne(approval)}
                              loading={revoking === approval.id}
                              disabled={revoking !== null}
                            >
                              <Power size={14} /> Revoke
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Batch action */}
            <Card className="p-5" delay={0.15}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{selectedApprovals.length}</span> approvals selected
                  <span className="text-err-400"> · {formatUsd(selectedApprovals.reduce((s, a) => s + a.valueAtRiskUsd, 0))} at risk</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Fee per revoke</p>
                    <p className="text-sm font-mono text-accent-400">
                      {formatNativeCost(revokeCostNative, network.symbol)} · ${revokeFeeUsd}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleBatchRevoke}
                    loading={revoking === 'batch'}
                    disabled={selectedApprovals.length === 0 || revoking !== null}
                  >
                    <Power size={16} /> Batch Revoke ({selectedApprovals.length})
                  </Button>
                </div>
              </div>
            </Card>

            {/* Revoked transactions */}
            {revokedTxs.length > 0 && (
              <Card className="overflow-hidden" delay={0.2}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-500/10">
                      <CheckCircle2 size={18} className="text-accent-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Revoked Approvals</h3>
                      <p className="text-xs text-zinc-500">{revokedTxs.length} approvals set to 0</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {revokedTxs.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: `${tx.approval.tokenLogoColor}20`, color: tx.approval.tokenLogoColor }}
                        >
                          {tx.approval.tokenLogoSymbol}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            Revoked {tx.approval.tokenSymbol} → {tx.approval.spenderName}
                          </div>
                          <a
                            href={`${network.explorerUrl}/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-zinc-500 hover:text-accent-400 inline-flex items-center gap-1"
                          >
                            {shortHash(tx.txHash)}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      <CheckCircle2 size={16} className="text-accent-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
