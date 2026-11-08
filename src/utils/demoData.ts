import type { TokenHolding } from '@/types';
import { generateContractAddress } from './format';

interface DemoTokenTemplate {
  symbol: string;
  name: string;
  logoColor: string;
  logoSymbol: string;
  basePrice: number;
  isDust: boolean;
  isDead: boolean;
  hasLiquidity: boolean;
  originalInvestment: number;
}

const DUST_TOKENS: DemoTokenTemplate[] = [
  { symbol: 'SHIB', name: 'Shiba Inu', logoColor: '#f7a30a', logoSymbol: 'SHB', basePrice: 0.0000089, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 50 },
  { symbol: 'PEPE', name: 'Pepe', logoColor: '#3d8c40', logoSymbol: 'PEP', basePrice: 0.00000089, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 30 },
  { symbol: 'DOGE2', name: 'Doge Killer 2.0', logoColor: '#c2a633', logoSymbol: 'DG2', basePrice: 0.0000023, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 25 },
  { symbol: 'FLOKI', name: 'Floki Inu', logoColor: '#f2a900', logoSymbol: 'FLK', basePrice: 0.0000156, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 15 },
  { symbol: 'BONK', name: 'Bonk', logoColor: '#f59e0b', logoSymbol: 'BNK', basePrice: 0.0000028, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 20 },
  { symbol: 'WOJAK', name: 'Wojak Finance', logoColor: '#8b8b8b', logoSymbol: 'WJK', basePrice: 0.00041, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 10 },
  { symbol: 'TURBO', name: 'Turbo', logoColor: '#22d3ee', logoSymbol: 'TRB', basePrice: 0.00028, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 12 },
  { symbol: 'CULT', name: 'Cult DAO', logoColor: '#e11d48', logoSymbol: 'CLT', basePrice: 0.0000042, isDust: true, isDead: false, hasLiquidity: true, originalInvestment: 8 },
];

const DEAD_TOKENS: DemoTokenTemplate[] = [
  { symbol: 'SCAMX', name: 'SafeMoon Classic', logoColor: '#ff4444', logoSymbol: 'SCM', basePrice: 0, isDust: false, isDead: true, hasLiquidity: false, originalInvestment: 500 },
  { symbol: 'RUGZ', name: 'RugPull Token', logoColor: '#aa00ff', logoSymbol: 'RUG', basePrice: 0, isDust: false, isDead: true, hasLiquidity: false, originalInvestment: 1200 },
  { symbol: 'HONEY', name: 'HoneyTrap Bee', logoColor: '#ffaa00', logoSymbol: 'HNY', basePrice: 0, isDust: false, isDead: true, hasLiquidity: false, originalInvestment: 75 },
  { symbol: 'MOONX', name: 'MoonShotX', logoColor: '#666666', logoSymbol: 'MNX', basePrice: 0, isDust: false, isDead: true, hasLiquidity: false, originalInvestment: 300 },
  { symbol: 'ELONX', name: 'ElonCash', logoColor: '#1d9bf0', logoSymbol: 'ELN', basePrice: 0, isDust: false, isDead: true, hasLiquidity: false, originalInvestment: 150 },
  { symbol: 'BABYDOGE', name: 'Baby Doge Coin (Rugged)', logoColor: '#ff6b6b', logoSymbol: 'BDG', basePrice: 0, isDust: false, isDead: true, hasLiquidity: false, originalInvestment: 80 },
];

const ACTIVE_TOKENS: DemoTokenTemplate[] = [
  { symbol: 'USDC', name: 'USD Coin', logoColor: '#2775ca', logoSymbol: 'USC', basePrice: 1.0, isDust: false, isDead: false, hasLiquidity: true, originalInvestment: 500 },
  { symbol: 'LINK', name: 'Chainlink', logoColor: '#2a5ada', logoSymbol: 'LNK', basePrice: 14.5, isDust: false, isDead: false, hasLiquidity: true, originalInvestment: 200 },
  { symbol: 'UNI', name: 'Uniswap', logoColor: '#ff007a', logoSymbol: 'UNI', basePrice: 7.8, isDust: false, isDead: false, hasLiquidity: true, originalInvestment: 150 },
];

function randomBalance(isDust: boolean, isDead: boolean, price: number): number {
  if (isDead) {
    // Dead tokens have large bags worth nothing
    return Math.random() * 1e9 + 1e6;
  }
  if (isDust) {
    // Dust: value < $1
    const targetValue = Math.random() * 0.99;
    return targetValue / Math.max(price, 0.0000001);
  }
  // Active
  return Math.random() * 500 + 10;
}

export function generateDemoTokens(): TokenHolding[] {
  const all: TokenHolding[] = [];
  const templates = [...DUST_TOKENS, ...DEAD_TOKENS, ...ACTIVE_TOKENS];

  for (const tpl of templates) {
    const balance = randomBalance(tpl.isDust, tpl.isDead, tpl.basePrice);
    const valueUsd = tpl.isDead ? 0 : balance * tpl.basePrice;

    all.push({
      id: `${tpl.symbol}-${Math.random().toString(36).slice(2, 8)}`,
      symbol: tpl.symbol,
      name: tpl.name,
      contractAddress: generateContractAddress(),
      balance,
      decimals: 18,
      priceUsd: tpl.basePrice,
      valueUsd: tpl.isDead ? 0 : Math.min(valueUsd, 0.99),
      logoColor: tpl.logoColor,
      logoSymbol: tpl.logoSymbol,
      isDust: tpl.isDust,
      isDead: tpl.isDead,
      hasLiquidity: tpl.hasLiquidity,
      originalInvestmentUsd: tpl.originalInvestment,
    });
  }

  // Sort: dead first, then dust, then active
  return all.sort((a, b) => {
    if (a.isDead && !b.isDead) return -1;
    if (!a.isDead && b.isDead) return 1;
    if (a.isDust && !b.isDust) return -1;
    if (!a.isDust && b.isDust) return 1;
    return (b.originalInvestmentUsd || 0) - (a.originalInvestmentUsd || 0);
  });
}

// Native token prices (simplified - in production would use CoinGecko API)
export const NATIVE_PRICES: { [key: string]: number } = {
  ethereum: 3450.0,
  'polygon-ecosystem-token': 0.72,
  solana: 168.0,
  'avalanche-2': 38.0,
  binancecoin: 612.0,
  mantle: 0.82,
  'sonic-3': 1.1,
  berachain: 7.5,
};

export function getNativePrice(coingeckoId: string): number {
  return NATIVE_PRICES[coingeckoId] || 3450.0; // fallback to ETH price
}
