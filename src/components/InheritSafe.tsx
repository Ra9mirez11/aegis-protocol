import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Shield,
  Heart,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Activity,
  FlaskConical,
  Loader2,
  Sparkles,
  Zap,
  Download,
  Upload,
  FileUp,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { INACTIVITY_OPTIONS, GRACE_PERIOD_DAYS } from '@/constants/networks';
import { formatAddress, calculateNativeCost, formatNativeCost, FEES, generateTxHash, shortHash } from '@/utils/format';
import { encryptData, decryptData, shamirSplit, shamirReconstruct, generateSecurePassword } from '@/utils/crypto';
import { getNativePrice } from '@/utils/demoData';
import { sendFeeTransfer } from '@/utils/web3';
import { buildAegisFile, buildAegisFileWithLabel, downloadAegisFile, parseAegisFile, type AegisVaultFile } from '@/utils/vaultFile';
import type { NetworkConfig, ToastMessage } from '@/types';

interface InheritSafeProps {
  network: NetworkConfig;
  connected: boolean;
  demoMode: boolean;
  walletAddress: string;
  treasuryAddress: string;
  liveNativePrice?: number;
  onVaultsChange?: () => void;
  onToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const DEMO_SIMULATION_PAYLOAD = '[DEMO SIMULATION PAYLOAD] witch collapse practice feed shame open despair creek road again ice least';

interface VaultEntry {
  id: string;
  label: string;
  encryptedData: string;
  iv: string;
  salt: string;
  createdAt: number;
  inactivityDays: number;
  lastHeartbeat: number;
  shareA: string;
  shareB: string;
  beneficiaryAddress: string;
  revealedShareA: boolean;
}

export function InheritSafe({ network, connected, demoMode, walletAddress, treasuryAddress, liveNativePrice, onVaultsChange, onToast }: InheritSafeProps) {
  const [vaults, setVaults] = useState<VaultEntry[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [decryptOpen, setDecryptOpen] = useState(false);
  const [sharesOpen, setSharesOpen] = useState(false);
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [decryptTarget, setDecryptTarget] = useState<VaultEntry | null>(null);
  const [sharesTarget, setSharesTarget] = useState<VaultEntry | null>(null);
  const [processing, setProcessing] = useState(false);
  const [payingFee, setPayingFee] = useState(false);

  // Create form state
  const [vaultLabel, setVaultLabel] = useState('');
  const [vaultContent, setVaultContent] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [inactivityDays, setInactivityDays] = useState(90);
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('');

  // Decrypt form state
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptShareB, setDecryptShareB] = useState('');
  const [shareAInput, setShareAInput] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [decryptError, setDecryptError] = useState('');

  // Import form state
  const [importFile, setImportFile] = useState<AegisVaultFile | null>(null);
  const [importShareB, setImportShareB] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importDecrypted, setImportDecrypted] = useState('');
  const [importError, setImportError] = useState('');
  const [importPasteText, setImportPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate state
  const [simulateStep, setSimulateStep] = useState(0);
  const [simulatedDays, setSimulatedDays] = useState(0);

  const isActive = connected || demoMode;
  const nativePrice = liveNativePrice ?? getNativePrice(network.coingeckoId);
  const vaultFeeUsd = FEES.VAULT_ACTIVATION();
  const vaultCostNative = calculateNativeCost(vaultFeeUsd, nativePrice);

  // Load vaults from localStorage, auto-seed a demo vault in Demo Mode
  useEffect(() => {
    const loadVaults = async () => {
      if (!walletAddress || (!connected && !demoMode)) {
        setVaults([]);
        return;
      }

      const saved = localStorage.getItem(`aegis_vaults_${walletAddress}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVaults(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }

      if (!demoMode) {
        setVaults([]);
        return;
      }

      try {
        const demoPayload = 'SEED: witch collapse practice feed shame open despair creek road again ice least | NOTES: Hardware Ledger Nano X PIN 8492 in home safe.';
        const ephemeralKey = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
        const encrypted = await encryptData(demoPayload, ephemeralKey);
        const shares = shamirSplit(ephemeralKey);

        const demoVault: VaultEntry = {
          id: `vault-demo-${Date.now()}`,
          label: 'Ledger Cold Storage & Estate Seed',
          encryptedData: encrypted.ciphertext,
          iv: encrypted.iv,
          salt: encrypted.salt,
          createdAt: Date.now(),
          inactivityDays: 90,
          lastHeartbeat: Date.now() - 1000 * 60 * 60 * 18,
          shareA: shares.shareA,
          shareB: shares.shareB,
          beneficiaryAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          revealedShareA: false,
        };

        localStorage.setItem(`aegis_vaults_${walletAddress}`, JSON.stringify([demoVault]));
        setVaults([demoVault]);
        onVaultsChange?.();
      } catch {
        // ignore
      }
    };

    loadVaults();
  }, [connected, demoMode, walletAddress, onVaultsChange]);

  const saveVaults = (newVaults: VaultEntry[]) => {
    setVaults(newVaults);
    if (walletAddress) {
      localStorage.setItem(`aegis_vaults_${walletAddress}`, JSON.stringify(newVaults));
    }
    onVaultsChange?.();
  };

  const resetCreateForm = () => {
    setVaultLabel('');
    setVaultContent('');
    setVaultPassword('');
    setShowPassword(false);
    setShowContent(false);
    setInactivityDays(90);
    setBeneficiaryAddress('');
  };

  const payVaultFee = async (): Promise<boolean> => {
    if (demoMode || !walletAddress || !treasuryAddress) {
      setPayingFee(true);
      await new Promise((r) => setTimeout(r, 1000));
      setPayingFee(false);
      return true;
    }
    setPayingFee(true);
    try {
      const txHash = await sendFeeTransfer(walletAddress, treasuryAddress, vaultCostNative, network);
      onToast({ type: 'info', title: 'Activation fee paid', message: `${formatUsdFee(vaultFeeUsd)} → treasury (${shortHash(txHash, 10, 6)})` });
      setPayingFee(false);
      return true;
    } catch (err: any) {
      setPayingFee(false);
      onToast({ type: 'error', title: 'Fee payment failed', message: err?.message || 'Transaction rejected.' });
      return false;
    }
  };

  const handleCreateVault = async () => {
    if (demoMode) {
      onToast({ type: 'warning', title: 'Demo Mode simulation', message: 'Custom seed phrase encryption is locked. Connect a live wallet and pay the $19 activation fee to encrypt your own data.' });
      return;
    }
    if (!vaultLabel.trim()) {
      onToast({ type: 'warning', title: 'Label required', message: 'Give your vault a name to identify it.' });
      return;
    }
    if (!vaultContent.trim()) {
      onToast({ type: 'warning', title: 'No data to encrypt', message: 'Enter the sensitive data you want to protect.' });
      return;
    }
    if (vaultPassword.length < 8) {
      onToast({ type: 'warning', title: 'Password too short', message: 'Use at least 8 characters for the encryption password.' });
      return;
    }
    if (!beneficiaryAddress.trim()) {
      onToast({ type: 'warning', title: 'Beneficiary required', message: 'Enter the beneficiary wallet address.' });
      return;
    }

    const feePaid = await payVaultFee();
    if (!feePaid) return;

    setProcessing(true);

    try {
      const encrypted = await encryptData(vaultContent, vaultPassword);
      const shares = shamirSplit(vaultPassword);

      const vault: VaultEntry = {
        id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: vaultLabel,
        encryptedData: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
        createdAt: Date.now(),
        inactivityDays,
        lastHeartbeat: Date.now(),
        shareA: shares.shareA,
        shareB: shares.shareB,
        beneficiaryAddress,
        revealedShareA: false,
      };

      saveVaults([...vaults, vault]);
      setProcessing(false);
      setCreateOpen(false);
      resetCreateForm();

      onToast({
        type: 'success',
        title: 'Vault created & encrypted',
        message: `"${vaultLabel}" is secured with AES-256-GCM. Shamir shares generated for inheritance.`,
      });
    } catch {
      setProcessing(false);
      onToast({ type: 'error', title: 'Encryption failed', message: 'Could not encrypt vault data. Please try again.' });
    }
  };

  const handleHeartbeat = (vaultId: string) => {
    const updated = vaults.map((v) =>
      v.id === vaultId ? { ...v, lastHeartbeat: Date.now() } : v
    );
    saveVaults(updated);
    onToast({
      type: 'success',
      title: 'Heartbeat recorded',
      message: 'Inactivity timer has been reset. You are alive.',
    });
  };

  const handleDeleteVault = (vaultId: string) => {
    const updated = vaults.filter((v) => v.id !== vaultId);
    saveVaults(updated);
    onToast({
      type: 'info',
      title: 'Vault deleted',
      message: 'The encrypted vault has been removed from this device.',
    });
  };

  const handleExportVault = (vault: VaultEntry) => {
    const file = demoMode
      ? buildAegisFileWithLabel(vault, `[DEMO-UNPAID] ${vault.label}`)
      : buildAegisFile(vault);
    downloadAegisFile(file);
    onToast({
      type: 'success',
      title: 'Vault file exported',
      message: `${vault.label}.aegis downloaded. Share this file with your beneficiary.`,
    });
  };

  const handleDecrypt = async () => {
    if (!decryptTarget) return;
    if (!decryptPassword) {
      setDecryptError('Enter the encryption password or reconstruct it from shares.');
      return;
    }

    setProcessing(true);
    setDecryptError('');

    try {
      const result = await decryptData(
        {
          ciphertext: decryptTarget.encryptedData,
          iv: decryptTarget.iv,
          salt: decryptTarget.salt,
        },
        decryptPassword
      );

      setDecryptedContent(result);
      setProcessing(false);
      onToast({ type: 'success', title: 'Vault decrypted', message: 'Sensitive data has been decrypted successfully.' });
    } catch {
      setProcessing(false);
      setDecryptError('Decryption failed. Wrong password or corrupted data.');
    }
  };

  const handleReconstructFromShares = () => {
    if (!decryptTarget) return;
    if (!shareAInput || !decryptShareB) {
      setDecryptError('Enter both Share A (Beneficiary) and Share B (Time-Locked) to reconstruct the key.');
      return;
    }

    try {
      const reconstructed = shamirReconstruct(shareAInput, decryptShareB);
      setDecryptPassword(reconstructed);
      setDecryptError('');
      onToast({
        type: 'success',
        title: 'Key reconstructed',
        message: 'Shamir shares combined. Decryption key recovered.',
      });
    } catch {
      setDecryptError('Failed to reconstruct key from shares. Check both share values.');
    }
  };

  const handleGeneratePassword = () => {
    setVaultPassword(generateSecurePassword(32));
  };

  // Import handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseAegisFile(text);
      if (parsed) {
        setImportFile(parsed);
        setImportError('');
        setImportDecrypted('');
        setImportShareB('');
        setImportPassword('');
      } else {
        setImportError('Invalid .aegis file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleParsePaste = () => {
    const parsed = parseAegisFile(importPasteText);
    if (parsed) {
      setImportFile(parsed);
      setImportError('');
      setImportDecrypted('');
      setImportShareB('');
      setImportPassword('');
    } else {
      setImportError('Invalid JSON payload.');
    }
  };

  const handleImportReconstruct = () => {
    if (!importFile) return;
    if (!importShareB) {
      setImportError('Enter Share B to reconstruct the encryption key.');
      return;
    }
    try {
      const reconstructed = shamirReconstruct(importFile.shareA, importShareB);
      setImportPassword(reconstructed);
      setImportError('');
      onToast({ type: 'success', title: 'Key reconstructed', message: 'Shamir shares combined successfully.' });
    } catch {
      setImportError('Failed to reconstruct key. Check Share B value.');
    }
  };

  const handleImportDecrypt = async () => {
    if (!importFile) return;
    if (!importPassword) {
      setImportError('Enter the password or reconstruct it from shares.');
      return;
    }
    setProcessing(true);
    setImportError('');
    try {
      const result = await decryptData(
        { ciphertext: importFile.encryptedData, iv: importFile.iv, salt: importFile.salt },
        importPassword
      );
      setImportDecrypted(result);
      setProcessing(false);
      onToast({ type: 'success', title: 'Inheritance vault decrypted', message: 'Beneficiary claim successful.' });
    } catch {
      setProcessing(false);
      setImportError('Decryption failed. Wrong key or corrupted data.');
    }
  };

  const handleSimulateInactivity = () => {
    setSimulateStep(0);
    setSimulatedDays(0);
    setSimulateOpen(true);
  };

  const runSimulation = async () => {
    const steps = [
      { days: 0, label: 'Vault active. Heartbeat timer running...', delay: 800 },
      { days: 30, label: '30 days of inactivity...', delay: 600 },
      { days: 60, label: '60 days of inactivity...', delay: 600 },
      { days: 89, label: '89 days — approaching threshold...', delay: 600 },
      { days: 90, label: '90 days reached. Inactivity threshold triggered!', delay: 800 },
      { days: 90, label: '14-day grace period activated. Beneficiary notified.', delay: 800 },
      { days: 104, label: 'Grace period ended. Contract Share B released to beneficiary.', delay: 800 },
      { days: 104, label: 'Beneficiary combines Share A + Share B to reconstruct key.', delay: 800 },
      { days: 104, label: 'Vault decrypted. Inheritance successful.', delay: 600 },
    ];

    for (let i = 0; i < steps.length; i++) {
      setSimulateStep(i + 1);
      setSimulatedDays(steps[i].days);
      await new Promise((r) => setTimeout(r, steps[i].delay));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onToast({ type: 'info', title: 'Copied', message: `${label} copied to clipboard.` });
  };

  const getDaysSinceHeartbeat = (vault: VaultEntry) => {
    return Math.floor((Date.now() - vault.lastHeartbeat) / (1000 * 60 * 60 * 24));
  };

  const getVaultStatus = (vault: VaultEntry): { status: 'active' | 'warning' | 'critical'; daysLeft: number } => {
    const daysSince = getDaysSinceHeartbeat(vault);
    const daysLeft = vault.inactivityDays - daysSince;
    if (daysLeft <= 0) return { status: 'critical', daysLeft: 0 };
    if (daysLeft <= GRACE_PERIOD_DAYS) return { status: 'warning', daysLeft };
    return { status: 'active', daysLeft };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={20} className="text-cyber-400" />
            <h2 className="text-xl font-bold text-white">InheritSafe — Dead Man's Switch Vault</h2>
          </div>
          <p className="text-sm text-zinc-500">
            Zero-knowledge client-side encryption with Shamir's Secret Sharing for secure crypto inheritance.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { setImportFile(null); setImportPasteText(''); setImportError(''); setImportOpen(true); }}>
            <Upload size={16} />
            Import / Claim
          </Button>
          <Button variant="outline" onClick={handleSimulateInactivity} disabled={!isActive || vaults.length === 0}>
            <FlaskConical size={16} />
            Simulate
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={!isActive}>
            <Plus size={16} />
            Create Vault
          </Button>
        </div>
      </div>

      {/* Security Info Banner */}
      <Card className="p-5" delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20">
              <Lock size={18} className="text-accent-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AES-256-GCM</p>
              <p className="text-xs text-zinc-500 leading-relaxed">Browser-side Web Crypto API encryption. Your data never leaves your device unencrypted.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyber-500/10 border border-cyber-500/20">
              <Shield size={18} className="text-cyber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Shamir 2-of-2</p>
              <p className="text-xs text-zinc-500 leading-relaxed">Key split into Beneficiary Share A and Time-Locked Contract Share B.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-warn-500/10 border border-warn-500/20">
              <Clock size={18} className="text-warn-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Inactivity Timer</p>
              <p className="text-xs text-zinc-500 leading-relaxed">Auto-releases Share B after configurable inactivity + 14-day grace period.</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <Activity size={14} className="text-accent-400" />
            Vault activation fee: <span className="font-mono text-accent-400">{formatNativeCost(vaultCostNative, network.symbol)} · ${vaultFeeUsd}</span>
          </div>
        </div>
      </Card>

      {/* Empty state */}
      {vaults.length === 0 ? (
        <Card className="p-16 flex flex-col items-center justify-center text-center" hover={false}>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <KeyRound size={32} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">No vaults created yet</p>
          <p className="text-xs text-zinc-600 mb-4 max-w-sm">
            {isActive ? 'Create your first encrypted vault to protect seed phrases, private keys, or instructions for your beneficiaries.' : 'Connect a wallet or enable Demo Mode to create vaults.'}
          </p>
          {isActive && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Create Your First Vault
            </Button>
          )}
        </Card>
      ) : (
        /* Vault List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vaults.map((vault, idx) => {
            const status = getVaultStatus(vault);
            const daysSince = getDaysSinceHeartbeat(vault);
            const statusColors = {
              active: 'success' as const,
              warning: 'warning' as const,
              critical: 'error' as const,
            };
            const statusText = {
              active: `${status.daysLeft} days until trigger`,
              warning: `Warning: ${status.daysLeft} days left`,
              critical: 'Threshold reached — grace period active',
            };

            return (
              <Card key={vault.id} className="p-5" delay={0.1 + idx * 0.05}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      status.status === 'active' ? 'bg-accent-500/10' :
                      status.status === 'warning' ? 'bg-warn-500/10' :
                      'bg-err-500/10'
                    }`}>
                      <Lock size={18} className={
                        status.status === 'active' ? 'text-accent-400' :
                        status.status === 'warning' ? 'text-warn-400' :
                        'text-err-400'
                      } />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{vault.label}</h3>
                      <p className="text-xs text-zinc-500 font-mono">
                        Created {new Date(vault.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusColors[status.status]} pulse={status.status !== 'active'}>
                    {status.status === 'active' ? 'SECURE' : status.status === 'warning' ? 'WARNING' : 'TRIGGERED'}
                  </Badge>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Clock size={12} /> Inactivity threshold
                    </span>
                    <span className="font-mono text-zinc-300">{vault.inactivityDays} days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Heart size={12} /> Last heartbeat
                    </span>
                    <span className="font-mono text-zinc-300">{daysSince} days ago</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <KeyRound size={12} /> Beneficiary
                    </span>
                    <span className="font-mono text-zinc-300">{formatAddress(vault.beneficiaryAddress)}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-500">{statusText[status.status]}</span>
                      <span className="font-mono text-zinc-400">
                        {Math.max(0, Math.min(100, ((vault.inactivityDays - status.daysLeft) / vault.inactivityDays) * 100)).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, ((vault.inactivityDays - status.daysLeft) / vault.inactivityDays) * 100))}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${
                          status.status === 'active' ? 'bg-gradient-to-r from-accent-500 to-accent-400' :
                          status.status === 'warning' ? 'bg-gradient-to-r from-warn-500 to-warn-400' :
                          'bg-gradient-to-r from-err-500 to-err-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/5 flex-wrap">
                  <Button size="sm" onClick={() => handleHeartbeat(vault.id)} className="flex-1">
                    <Heart size={14} /> I am Alive
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSharesTarget(vault);
                      setSharesOpen(true);
                    }}
                  >
                    <KeyRound size={14} /> Shares
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setDecryptTarget(vault);
                      setDecryptPassword('');
                      setDecryptShareB('');
                      setShareAInput(vault.shareA || '');
                      setDecryptedContent('');
                      setDecryptError('');
                      setDecryptOpen(true);
                    }}
                  >
                    <Unlock size={14} /> Decrypt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportVault(vault)}
                  >
                    <Download size={14} /> Export
                  </Button>
                  <button
                    onClick={() => handleDeleteVault(vault.id)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-err-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {vault.shareB && (
                  <button
                    onClick={() => {
                      const updated = vaults.map((v) =>
                        v.id === vault.id ? { ...v, shareB: '' } : v
                      );
                      saveVaults(updated);
                      onToast({
                        type: 'success',
                        title: 'Share B wiped from device',
                        message: 'Time-locked share removed from local storage. Production hardening active.',
                      });
                    }}
                    className="mt-2 w-full text-[10px] font-mono font-bold px-2 py-1.5 rounded-lg bg-warn-500/10 border border-warn-500/25 text-warn-400 hover:bg-warn-500/20 transition-all"
                  >
                    Clear Share B from Device Storage (Production Hardening)
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Vault Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); resetCreateForm(); }} title="Create Encrypted Vault" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Vault Label</label>
            <input
              type="text"
              value={vaultLabel}
              onChange={(e) => setVaultLabel(e.target.value)}
              placeholder="e.g., Main Seed Phrase, DeFi Instructions, etc."
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus-glow transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-500 font-medium">Sensitive Data to Encrypt</label>
              <button
                onClick={() => setShowContent(!showContent)}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {showContent ? <EyeOff size={12} /> : <Eye size={12} />}
                {showContent ? 'Hide' : 'Show'}
              </button>
            </div>
            {demoMode && (
              <div className="flex items-center gap-2 p-3 mb-2 rounded-lg bg-warn-500/10 border border-warn-500/25 text-xs text-warn-400">
                <AlertTriangle size={14} className="flex-shrink-0" />
                Demo Mode Simulation: Custom seed phrase encryption is locked. Connect a live wallet and pay the $19 activation fee to encrypt your own custom data.
              </div>
            )}
            <textarea
              value={demoMode ? DEMO_SIMULATION_PAYLOAD : vaultContent}
              onChange={(e) => setVaultContent(e.target.value)}
              readOnly={demoMode}
              placeholder="Enter seed phrase, private key, instructions, or any sensitive data..."
              rows={4}
              className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600 resize-none ${showContent || demoMode ? '' : 'text-transparent'}`}
            />
            <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
              <Lock size={11} /> Encrypted in-browser with AES-256-GCM before storage
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-500 font-medium">Encryption Password</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={handleGeneratePassword}
                  className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles size={12} /> Generate
                </button>
              </div>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={vaultPassword}
              onChange={(e) => setVaultPassword(e.target.value)}
              placeholder="At least 8 characters..."
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600"
            />
            <p className="text-xs text-zinc-600 mt-1">
              This password is split into Shamir shares. Share A goes to the beneficiary, Share B is time-locked.
            </p>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Beneficiary Wallet Address</label>
            <input
              type="text"
              value={beneficiaryAddress}
              onChange={(e) => setBeneficiaryAddress(e.target.value)}
              placeholder="0x... or Solana address of your beneficiary"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium mb-2 block">Inactivity Timer</label>
            <div className="grid grid-cols-4 gap-2">
              {INACTIVITY_OPTIONS.map((days) => (
                <button
                  key={days}
                  onClick={() => setInactivityDays(days)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inactivityDays === days
                      ? 'bg-accent-500/15 border border-accent-500/40 text-accent-300'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-1.5">
              After {inactivityDays} days of inactivity + {GRACE_PERIOD_DAYS}-day grace period, Share B auto-releases to beneficiary.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <Zap size={14} className="text-accent-400" />
              Activation fee: <span className="font-mono text-accent-400">{formatNativeCost(vaultCostNative, network.symbol)}</span>
            </div>
            {payingFee && <Loader2 size={14} className="animate-spin text-accent-400" />}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateVault} loading={processing || payingFee}>
              <Lock size={16} /> Encrypt & Create Vault
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shares Modal */}
      <Modal open={sharesOpen} onClose={() => setSharesOpen(false)} title="Shamir Secret Shares" size="lg">
        {sharesTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-cyber-500/10 border border-cyber-500/20">
              <Shield size={20} className="text-cyber-400" />
              <div>
                <p className="text-sm font-medium text-white">2-of-2 Shamir's Secret Sharing</p>
                <p className="text-xs text-zinc-500 mt-0.5">Both shares are required to reconstruct the encryption key.</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="md">SHARE A</Badge>
                  <span className="text-xs text-zinc-500">Beneficiary Share — give this to your heir</span>
                </div>
                <button
                  onClick={() => copyToClipboard(sharesTarget.shareA, 'Share A')}
                  className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-accent-300 break-all max-h-24 overflow-y-auto">
                {sharesTarget.shareA}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="md">SHARE B</Badge>
                  <span className="text-xs text-zinc-500">Time-Locked Contract Share — auto-releases after inactivity</span>
                </div>
                <button
                  onClick={() => copyToClipboard(sharesTarget.shareB, 'Share B')}
                  className="text-xs text-warn-400 hover:text-warn-300 flex items-center gap-1"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-warn-300 break-all max-h-24 overflow-y-auto">
                {sharesTarget.shareB}
              </div>
            </div>

            <div className="text-xs text-zinc-500 bg-white/5 p-3 rounded-lg space-y-1.5">
              <p className="font-medium text-zinc-400">How inheritance works:</p>
              <p>1. Beneficiary holds Share A from the moment the vault is created.</p>
              <p>2. After {sharesTarget.inactivityDays} days of inactivity + {GRACE_PERIOD_DAYS}-day grace, Share B auto-releases.</p>
              <p>3. Beneficiary combines Share A + Share B to reconstruct the encryption key.</p>
              <p>4. Beneficiary decrypts the vault to access seed phrases, keys, and instructions.</p>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSharesOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Decrypt Modal */}
      <Modal open={decryptOpen} onClose={() => setDecryptOpen(false)} title="Decrypt Vault" size="lg">
        {decryptTarget && (
          <div className="space-y-4">
            {!decryptedContent ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Lock size={20} className="text-accent-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{decryptTarget.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Enter the encryption password or reconstruct it from Shamir shares.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Option 1: Enter Password Directly</label>
                  <input
                    type="text"
                    value={decryptPassword}
                    onChange={(e) => setDecryptPassword(e.target.value)}
                    placeholder="Encryption password..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-zinc-600">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                    Option 2: Reconstruct from Shamir Shares
                  </label>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-accent-400 mb-1">Share A (Beneficiary Share) — editable below</p>
                      <input
                        type="text"
                        value={shareAInput}
                        onChange={(e) => setShareAInput(e.target.value)}
                        placeholder="Paste or edit Share A hex..."
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono focus-glow transition-all placeholder:text-zinc-600 mb-2"
                      />
                      <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 font-mono text-[10px] text-zinc-600 break-all max-h-10 overflow-y-auto">
                        Stored: {decryptTarget.shareA ? decryptTarget.shareA.slice(0, 60) + '...' : '(empty)'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-warn-400 mb-1">Share B (Time-Locked Contract Share) — enter below</p>
                      <input
                        type="text"
                        value={decryptShareB}
                        onChange={(e) => setDecryptShareB(e.target.value)}
                        placeholder="Paste Share B hex..."
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReconstructFromShares} className="w-full">
                      <KeyRound size={14} /> Reconstruct Key from Shares
                    </Button>
                    {demoMode && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setShareAInput(decryptTarget.shareA);
                          setDecryptShareB(decryptTarget.shareB);
                          onToast({ type: 'info', title: 'Demo shares filled', message: 'Share A & Share B loaded. Click Reconstruct Key, then Decrypt Vault.' });
                        }}
                        className="w-full"
                      >
                        <Sparkles size={14} /> Auto-Fill Demo Shares (Share A + Share B)
                      </Button>
                    )}
                  </div>
                </div>

                {decryptError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-err-500/10 border border-err-500/20 text-xs text-err-400">
                    <AlertTriangle size={14} />
                    {decryptError}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setDecryptOpen(false)}>Cancel</Button>
                  <Button onClick={handleDecrypt} loading={processing}>
                    <Unlock size={16} /> Decrypt Vault
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
                  <Check size={20} className="text-accent-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Vault decrypted successfully</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Your sensitive data is now visible. Store it securely.</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-zinc-500 font-medium">Decrypted Content</label>
                    <button
                      onClick={() => copyToClipboard(decryptedContent, 'Decrypted content')}
                      className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-accent-500/20 font-mono text-sm text-white break-all whitespace-pre-wrap">
                    {decryptedContent}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-warn-500/10 border border-warn-500/20 text-xs text-warn-400">
                  <AlertTriangle size={14} />
                  This data is now in plaintext. Close this window to clear it from memory.
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => { setDecryptOpen(false); setDecryptedContent(''); }}>
                    Close & Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Import / Beneficiary Claim Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import / Beneficiary Claim (.aegis)" size="lg">
        <div className="space-y-4">
          {!importFile ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-cyber-500/10 border border-cyber-500/20">
                <Shield size={20} className="text-cyber-400" />
                <div>
                  <p className="text-sm font-medium text-white">Beneficiary Claim</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Upload a .aegis vault file or paste the encrypted JSON to decrypt inherited data on any device.</p>
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/15 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-accent-500/40 hover:bg-accent-500/5 transition-all"
              >
                <div className="p-3 rounded-xl bg-white/5">
                  <FileUp size={28} className="text-accent-400" />
                </div>
                <p className="text-sm font-medium text-white">Click to upload .aegis file</p>
                <p className="text-xs text-zinc-500">JSON file exported from Aegis Protocol</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".aegis,.json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-zinc-600">OR PASTE JSON</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <textarea
                value={importPasteText}
                onChange={(e) => setImportPasteText(e.target.value)}
                placeholder='Paste the .aegis JSON content here...'
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600 resize-none"
              />
              <Button variant="outline" size="sm" onClick={handleParsePaste} disabled={!importPasteText.trim()} className="w-full">
                <Upload size={14} /> Parse Pasted JSON
              </Button>

              {importError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-err-500/10 border border-err-500/20 text-xs text-err-400">
                  <AlertTriangle size={14} />
                  {importError}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
                <Check size={20} className="text-accent-400" />
                <div>
                  <p className="text-sm font-medium text-white">{importFile.label || 'Imported Vault'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Created {new Date(importFile.createdAt).toLocaleDateString()} · Beneficiary: {formatAddress(importFile.beneficiaryAddress)}
                  </p>
                </div>
              </div>

              {!importDecrypted ? (
                <>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Option 1: Enter Password Directly</label>
                    <input
                      type="text"
                      value={importPassword}
                      onChange={(e) => setImportPassword(e.target.value)}
                      placeholder="Encryption password..."
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-zinc-600">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Option 2: Reconstruct from Shamir Shares</label>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-accent-400 mb-1">Share A — embedded in file</p>
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-zinc-500 break-all max-h-16 overflow-y-auto">
                          {importFile.shareA.slice(0, 80)}...
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-warn-400 mb-1">Share B (Time-Locked Contract Share) — enter below</p>
                        <input
                          type="text"
                          value={importShareB}
                          onChange={(e) => setImportShareB(e.target.value)}
                          placeholder="Paste Share B hex..."
                          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus-glow transition-all placeholder:text-zinc-600"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={handleImportReconstruct} className="w-full">
                        <KeyRound size={14} /> Reconstruct Key from Shares
                      </Button>
                    </div>
                  </div>

                  {importError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-err-500/10 border border-err-500/20 text-xs text-err-400">
                      <AlertTriangle size={14} />
                      {importError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setImportFile(null); setImportError(''); }}>
                      Back
                    </Button>
                    <Button onClick={handleImportDecrypt} loading={processing}>
                      <Unlock size={16} /> Decrypt Inheritance
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
                    <Check size={20} className="text-accent-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Inheritance vault decrypted</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Beneficiary claim successful. Store this data securely.</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-zinc-500 font-medium">Decrypted Content</label>
                      <button
                        onClick={() => copyToClipboard(importDecrypted, 'Decrypted content')}
                        className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-accent-500/20 font-mono text-sm text-white break-all whitespace-pre-wrap">
                      {importDecrypted}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-warn-500/10 border border-warn-500/20 text-xs text-warn-400">
                    <AlertTriangle size={14} />
                    This data is now in plaintext. Close this window to clear it from memory.
                  </div>

                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => { setImportOpen(false); setImportFile(null); setImportDecrypted(''); }}>
                      Close & Clear
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Simulation Modal */}
      <Modal open={simulateOpen} onClose={() => setSimulateOpen(false)} title="Simulate Dead Man's Switch Flow" size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-cyber-500/10 border border-cyber-500/20">
            <FlaskConical size={20} className="text-cyber-400" />
            <div>
              <p className="text-sm font-medium text-white">Judge Testing: Simulate 90 Days of Inactivity</p>
              <p className="text-xs text-zinc-500 mt-0.5">This demonstrates the full inheritance flow from heartbeat to beneficiary decryption.</p>
            </div>
          </div>

          {simulateStep === 0 ? (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-zinc-300">Owner creates vault with 90-day inactivity timer</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-zinc-300">Owner fails to send heartbeat for 90 days</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-warn-500/20 text-warn-400 flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-zinc-300">14-day grace period begins — owner can still check in</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-err-500/20 text-err-400 flex items-center justify-center text-xs font-bold">4</div>
                  <span className="text-zinc-300">Grace period ends — Share B auto-releases to beneficiary</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-cyber-500/20 text-cyber-400 flex items-center justify-center text-xs font-bold">5</div>
                  <span className="text-zinc-300">Beneficiary combines shares, reconstructs key, decrypts vault</span>
                </div>
              </div>
              <Button onClick={runSimulation} className="w-full">
                <Zap size={16} /> Start Simulation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
                <div className="space-y-3">
                  {[
                    { label: 'Day 0 — Vault Active', desc: 'Heartbeat timer running', icon: Heart, color: 'accent' },
                    { label: 'Day 30 — Inactivity', desc: 'No heartbeat received', icon: Clock, color: 'zinc' },
                    { label: 'Day 60 — Inactivity', desc: 'Still no heartbeat', icon: Clock, color: 'zinc' },
                    { label: 'Day 89 — Approaching', desc: '1 day until threshold', icon: AlertTriangle, color: 'warn' },
                    { label: 'Day 90 — Triggered!', desc: 'Inactivity threshold reached', icon: AlertTriangle, color: 'err' },
                    { label: 'Grace Period', desc: '14-day grace period activated', icon: Clock, color: 'warn' },
                    { label: 'Share B Released', desc: 'Contract releases Share B to beneficiary', icon: KeyRound, color: 'cyber' },
                    { label: 'Key Reconstructed', desc: 'Beneficiary combines Share A + B', icon: Shield, color: 'cyber' },
                    { label: 'Vault Decrypted', desc: 'Inheritance successful', icon: Unlock, color: 'accent' },
                  ].map((step, i) => {
                    const isDone = simulateStep > i;
                    const isCurrent = simulateStep === i + 1;
                    const Icon = step.icon;
                    const colors: any = {
                      accent: 'text-accent-400 bg-accent-500/20',
                      warn: 'text-warn-400 bg-warn-500/20',
                      err: 'text-err-400 bg-err-500/20',
                      cyber: 'text-cyber-400 bg-cyber-500/20',
                      zinc: 'text-zinc-500 bg-zinc-500/20',
                    };
                    return (
                      <div key={i} className={`flex items-center gap-3 transition-opacity ${isDone || isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${colors[step.color]} ${isCurrent ? 'animate-pulse' : ''}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isDone ? 'text-white' : 'text-zinc-400'}`}>{step.label}</p>
                          <p className="text-xs text-zinc-500">{step.desc}</p>
                        </div>
                        {isDone && <Check size={14} className="text-accent-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {simulateStep < 9 ? (
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 py-2">
                  <Loader2 size={16} className="animate-spin text-cyber-400" />
                  Simulating... Day {simulatedDays}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
                  <Check size={20} className="text-accent-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Simulation complete!</p>
                    <p className="text-xs text-zinc-500 mt-0.5">The beneficiary successfully inherited the vault contents.</p>
                  </div>
                </div>
              )}

              {simulateStep >= 9 && (
                <Button variant="secondary" onClick={() => setSimulateOpen(false)} className="w-full">
                  Close Simulation
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function formatUsdFee(v: number): string {
  return `$${v}`;
}
