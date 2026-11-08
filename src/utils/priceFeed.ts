import { NATIVE_PRICES } from './demoData';

let cachedPrices: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;
let inFlight: Promise<Record<string, number>> | null = null;

const COINGECKO_IDS = [
  'ethereum',
  'polygon-ecosystem-token',
  'solana',
  'avalanche-2',
  'binancecoin',
  'mantle',
  'sonic-3',
  'berachain',
];

export function isLivePrice(): boolean {
  return cachedPrices !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

export async function fetchLivePrices(): Promise<Record<string, number>> {
  if (cachedPrices && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedPrices;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const ids = COINGECKO_IDS.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) throw new Error('rate limited');
      const data = await resp.json();
      const prices: Record<string, number> = {};
      for (const id of COINGECKO_IDS) {
        if (data[id]?.usd) {
          prices[id] = data[id].usd;
        }
      }
      if (Object.keys(prices).length > 0) {
        cachedPrices = prices;
        cacheTimestamp = Date.now();
        return prices;
      }
      throw new Error('no data');
    } catch {
      // Silent fallback to built-in defaults
      cachedPrices = null;
      return { ...NATIVE_PRICES };
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function getLivePrice(coingeckoId: string, livePrices: Record<string, number> | null): { price: number; isLive: boolean } {
  if (livePrices && livePrices[coingeckoId] && Date.now() - cacheTimestamp < CACHE_TTL) {
    return { price: livePrices[coingeckoId], isLive: true };
  }
  return { price: NATIVE_PRICES[coingeckoId] || 3450.0, isLive: false };
}
