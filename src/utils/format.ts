import type { NetworkConfig, TokenHolding } from '@/types';

export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatUsd(value: number): string {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  if (value < 1) return `$${value.toFixed(4)}`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatTokenAmount(value: number, decimals: number = 18): string {
  if (value === 0) return '0';
  if (value < 0.0001) return '<0.0001';
  if (value < 1) return value.toFixed(6);
  return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

// ─── Dynamic service fees ───

function env(key: string): string {
  return ((import.meta.env as Record<string, string | undefined>)[key] || '').trim();
}

function parseFee(key: string, fallback: number): number {
  const raw = env(key);
  if (!raw) return fallback;
  const n = parseFloat(raw);
  return isNaN(n) || n < 0 ? fallback : n;
}

export const FEES = {
  DUST_SWEEP: () => parseFee('VITE_FEE_DUST_SWEEP_USD', 2),
  TAX_EXPORT: () => parseFee('VITE_FEE_TAX_EXPORT_USD', 19),
  VAULT_ACTIVATION: () => parseFee('VITE_FEE_VAULT_ACTIVATION_USD', 19),
  APPROVAL_REVOKE: () => parseFee('VITE_FEE_APPROVAL_REVOKE_USD', 1),
};

// ─── Formatting helpers ───

export function calculateNativeCost(usdAmount: number, nativePriceUsd: number): number {
  if (nativePriceUsd <= 0) return 0;
  return usdAmount / nativePriceUsd;
}

export function formatNativeCost(nativeAmount: number, symbol: string): string {
  if (nativeAmount === 0) return '—';
  return `${nativeAmount.toFixed(6)} ${symbol}`;
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export function generateContractAddress(): string {
  return generateWalletAddress();
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getExplorerTxUrl(network: NetworkConfig, txHash: string): string {
  return `${network.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(network: NetworkConfig, address: string): string {
  return `${network.explorerUrl}/address/${address}`;
}

export function shortHash(hash: string, prefixLen: number = 10, suffixLen: number = 8): string {
  if (!hash || hash.length < prefixLen + suffixLen) return hash;
  return `${hash.slice(0, prefixLen)}...${hash.slice(-suffixLen)}`;
}

export function getTokenType(token: TokenHolding): 'dust' | 'dead' | 'active' {
  if (token.isDead) return 'dead';
  if (token.isDust) return 'dust';
  return 'active';
}
