import type { TokenApproval } from '@/types';
import { generateContractAddress, generateTxHash } from './format';

interface ApprovalTemplate {
  tokenSymbol: string;
  tokenName: string;
  tokenLogoColor: string;
  tokenLogoSymbol: string;
  tokenPriceUsd: number;
  tokenBalance: number;
  tokenDecimals: number;
  spenderName: string;
  spenderType: 'dex' | 'bridge' | 'staking' | 'unknown' | 'phishing';
  unlimited: boolean;
  riskLevel: 'critical' | 'high' | 'medium';
  daysAgo: number;
}

const TEMPLATES: ApprovalTemplate[] = [
  {
    tokenSymbol: 'USDC',
    tokenName: 'USD Coin',
    tokenLogoColor: '#2775ca',
    tokenLogoSymbol: 'USC',
    tokenPriceUsd: 1.0,
    tokenBalance: 12500,
    tokenDecimals: 6,
    spenderName: 'Uniswap V2 Router',
    spenderType: 'dex',
    unlimited: true,
    riskLevel: 'high',
    daysAgo: 120,
  },
  {
    tokenSymbol: 'USDC',
    tokenName: 'USD Coin',
    tokenLogoColor: '#2775ca',
    tokenLogoSymbol: 'USC',
    tokenPriceUsd: 1.0,
    tokenBalance: 12500,
    tokenDecimals: 6,
    spenderName: 'Unknown Bridge',
    spenderType: 'bridge',
    unlimited: true,
    riskLevel: 'critical',
    daysAgo: 45,
  },
  {
    tokenSymbol: 'LINK',
    tokenName: 'Chainlink',
    tokenLogoColor: '#2a5ada',
    tokenLogoSymbol: 'LNK',
    tokenPriceUsd: 14.5,
    tokenBalance: 850,
    tokenDecimals: 18,
    spenderName: 'Legacy DEX Router',
    spenderType: 'dex',
    unlimited: true,
    riskLevel: 'high',
    daysAgo: 200,
  },
  {
    tokenSymbol: 'UNI',
    tokenName: 'Uniswap',
    tokenLogoColor: '#ff007a',
    tokenLogoSymbol: 'UNI',
    tokenPriceUsd: 7.8,
    tokenBalance: 320,
    tokenDecimals: 18,
    spenderName: 'Unverified Contract 0x4a..8f',
    spenderType: 'phishing',
    unlimited: true,
    riskLevel: 'critical',
    daysAgo: 12,
  },
  {
    tokenSymbol: 'SHIB',
    tokenName: 'Shiba Inu',
    tokenLogoColor: '#f7a30a',
    tokenLogoSymbol: 'SHB',
    tokenPriceUsd: 0.0000089,
    tokenBalance: 50000000,
    tokenDecimals: 18,
    spenderName: 'SushiSwap Router',
    spenderType: 'dex',
    unlimited: true,
    riskLevel: 'medium',
    daysAgo: 90,
  },
  {
    tokenSymbol: 'UNI',
    tokenName: 'Uniswap',
    tokenLogoColor: '#ff007a',
    tokenLogoSymbol: 'UNI',
    tokenPriceUsd: 7.8,
    tokenBalance: 320,
    tokenDecimals: 18,
    spenderName: 'Staking Pool 0x7b..2c',
    spenderType: 'staking',
    unlimited: false,
    riskLevel: 'medium',
    daysAgo: 30,
  },
  {
    tokenSymbol: 'PEPE',
    tokenName: 'Pepe',
    tokenLogoColor: '#3d8c40',
    tokenLogoSymbol: 'PEP',
    tokenPriceUsd: 0.00000089,
    tokenBalance: 800000000,
    tokenDecimals: 18,
    spenderName: '0x9f..1a (Unverified)',
    spenderType: 'unknown',
    unlimited: true,
    riskLevel: 'critical',
    daysAgo: 5,
  },
  {
    tokenSymbol: 'LINK',
    tokenName: 'Chainlink',
    tokenLogoColor: '#2a5ada',
    tokenLogoSymbol: 'LNK',
    tokenPriceUsd: 14.5,
    tokenBalance: 850,
    tokenDecimals: 18,
    spenderName: '1inch Aggregation Router',
    spenderType: 'dex',
    unlimited: false,
    riskLevel: 'medium',
    daysAgo: 60,
  },
];

export function generateDemoApprovals(): TokenApproval[] {
  return TEMPLATES.map((tpl, i) => {
    const valueAtRiskUsd = tpl.unlimited
      ? tpl.tokenBalance * tpl.tokenPriceUsd
      : (tpl.tokenBalance * tpl.tokenPriceUsd) * 0.1;

    return {
      id: `approval-${i}-${Math.random().toString(36).slice(2, 8)}`,
      tokenSymbol: tpl.tokenSymbol,
      tokenName: tpl.tokenName,
      tokenContract: generateContractAddress(),
      tokenLogoColor: tpl.tokenLogoColor,
      tokenLogoSymbol: tpl.tokenLogoSymbol,
      tokenPriceUsd: tpl.tokenPriceUsd,
      tokenBalance: tpl.tokenBalance,
      tokenDecimals: tpl.tokenDecimals,
      spenderAddress: generateContractAddress(),
      spenderName: tpl.spenderName,
      spenderType: tpl.spenderType,
      allowance: tpl.unlimited ? -1 : tpl.tokenBalance * 0.1,
      allowanceRaw: tpl.unlimited ? 'Max(uint256)' : (tpl.tokenBalance * 0.1).toFixed(0),
      valueAtRiskUsd,
      riskLevel: tpl.riskLevel,
      lastApproved: Date.now() - tpl.daysAgo * 24 * 60 * 60 * 1000,
      revoked: false,
    };
  });
}

export function generateRevokeTxHash(): string {
  return generateTxHash();
}
