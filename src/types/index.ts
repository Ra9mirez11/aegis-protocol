export interface NetworkConfig {
  id: number;
  name: string;
  shortName: string;
  symbol: string;
  nativeName: string;
  coingeckoId: string;
  logoColor: string;
  logoSymbol: string;
  rpcUrl: string;
  explorerUrl: string;
  isEvm: boolean;
  treasuryEnvKey: string;
}

export interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  balance: number;
  decimals: number;
  priceUsd: number;
  valueUsd: number;
  logoColor: string;
  isDust: boolean;
  isDead: boolean;
  hasLiquidity: boolean;
  originalInvestmentUsd?: number;
  logoSymbol: string;
}

export interface WalletState {
  address: string;
  connected: boolean;
  isDemo: boolean;
  nativeBalance: number;
  chainId: number;
}

export interface VaultData {
  id: string;
  label: string;
  encryptedPayload: string;
  iv: string;
  salt: string;
  createdAt: number;
  inactivityDays: number;
  lastHeartbeat: number;
  shareA: string;
  shareB: string;
  beneficiaryAddress: string;
}

export interface PriceData {
  [key: string]: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface TokenApproval {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenContract: string;
  tokenLogoColor: string;
  tokenLogoSymbol: string;
  tokenPriceUsd: number;
  tokenBalance: number;
  tokenDecimals: number;
  spenderAddress: string;
  spenderName: string;
  spenderType: 'dex' | 'bridge' | 'staking' | 'unknown' | 'phishing';
  allowance: number; // -1 = unlimited, else capped amount
  allowanceRaw: string;
  valueAtRiskUsd: number;
  riskLevel: 'critical' | 'high' | 'medium';
  lastApproved: number;
  revoked: boolean;
}
