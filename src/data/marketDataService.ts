import { 
  Candle, 
  DataSource, 
  GetCandlesOptions, 
  MarketSnapshot,
  Timeframe,
  TIMEFRAME_MS 
} from '@/core/types';
import {
  fetchBinanceCandles,
  fetchBybitCandles,
  fetchLcwCandles,
  fetchCmcCandles,
} from './adapters';
import {
  getMarketSnapshot,
  setMarketSnapshot,
  clearExpiredEntries,
} from '@/cache/marketCache';

/**
 * Fallback order for data sources
 */
const SOURCE_FALLBACK_ORDER: DataSource[] = [
  'binance',
  'bybit',
  'livecoinwatch',
  'coinmarketcap',
];

/**
 * Map data source to adapter function
 */
const SOURCE_ADAPTERS: Record<DataSource, (params: any) => Promise<Candle[]>> = {
  binance: fetchBinanceCandles,
  bybit: fetchBybitCandles,
  livecoinwatch: fetchLcwCandles,
  coinmarketcap: fetchCmcCandles,
};

/**
 * Aggregate 1m candles into 3m candles
 */
export function aggregateTo3m(candles1m: Candle[]): Candle[] {
  if (candles1m.length === 0) return [];

  const candles3m: Candle[] = [];
  
  for (let i = 0; i < candles1m.length; i += 3) {
    const chunk = candles1m.slice(i, i + 3);
    if (chunk.length === 0) continue;

    const aggregated: Candle = {
      timestamp: chunk[0].timestamp,
      open: chunk[0].open,
      close: chunk[chunk.length - 1].close,
      high: Math.max(...chunk.map(c => c.high)),
      low: Math.min(...chunk.map(c => c.low)),
      volume: chunk.reduce((sum, c) => sum + c.volume, 0),
    };

    candles3m.push(aggregated);
  }

  console.log(`[Aggregation] Converted ${candles1m.length} x 1m candles → ${candles3m.length} x 3m candles`);
  return candles3m;
}

/**
 * Fetch candles from a specific source
 */
async function fetchFromSource(
  source: DataSource,
  params: GetCandlesOptions
): Promise<Candle[]> {
  const adapter = SOURCE_ADAPTERS[source];
  
  if (!adapter) {
    throw new Error(`Unknown data source: ${source}`);
  }

  console.log(`[Service] Fetching from ${source}: ${params.symbol} ${params.timeframe}`);
  
  // Special handling for 3m timeframe
  if (params.timeframe === '3m') {
    // Binance and Bybit support 3m directly
    if (source === 'binance' || source === 'bybit') {
      return adapter(params);
    }
    
    // Other sources: fetch 1m and aggregate
    console.log(`[Service] ${source} doesn't support 3m, fetching 1m for aggregation`);
    const candles1m = await adapter({
      ...params,
      timeframe: '5m' as Timeframe, // Fallback to 5m as closest
      limit: (params.limit || 500) * 3,
    });
    return aggregateTo3m(candles1m);
  }

  return adapter(params);
}

/**
 * Get candles with cache support and fallback between sources
 */
export async function getCandles(
  options: GetCandlesOptions
): Promise<MarketSnapshot> {
  const {
    symbol,
    timeframe,
    preferredSource = 'binance',
    useCache = true,
    limit = 500,
  } = options;

  // Cleanup expired cache entries periodically
  clearExpiredEntries();

  // 1. Check cache first
  if (useCache) {
    const cached = getMarketSnapshot(symbol, timeframe);
    if (cached) {
      console.log(`[Service] Returning cached data for ${symbol} ${timeframe}`);
      return cached;
    }
  }

  // 2. Prepare source order (preferred first, then fallback)
  const sourceOrder = [
    preferredSource,
    ...SOURCE_FALLBACK_ORDER.filter(s => s !== preferredSource),
  ];

  // 3. Try each source until success
  let lastError: Error | null = null;

  for (const source of sourceOrder) {
    try {
      const candles = await fetchFromSource(source, { symbol, timeframe, limit });

      if (!candles || candles.length === 0) {
        console.warn(`[Service] ${source} returned empty candles`);
        continue;
      }

      // Create snapshot
      const snapshot: MarketSnapshot = {
        symbol,
        timeframe,
        candles,
        lastUpdated: Date.now(),
        source,
      };

      // Store in cache
      setMarketSnapshot(snapshot);

      console.log(`[Service] Successfully fetched ${candles.length} candles from ${source}`);
      return snapshot;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`[Service] Failed to fetch from ${source}:`, lastError.message);
      // Continue to next source
    }
  }

  // 4. All sources failed
  throw new Error(
    `Failed to fetch candles for ${symbol} on ${timeframe} from all sources. Last error: ${lastError?.message}`
  );
}

/**
 * Auto-sync configuration
 */
export interface AutoSyncConfig {
  symbol: string;
  timeframes: Timeframe[];
  onUpdate?: (snapshot: MarketSnapshot) => void;
  onError?: (error: Error, symbol: string, timeframe: Timeframe) => void;
}

/**
 * Get appropriate sync interval for timeframe (in milliseconds)
 */
function getSyncInterval(timeframe: Timeframe): number {
  const intervals: Record<Timeframe, number> = {
    '3m': 5 * 1000,      // 5 seconds
    '5m': 10 * 1000,     // 10 seconds
    '15m': 30 * 1000,    // 30 seconds
    '1H': 60 * 1000,     // 1 minute
    '4H': 5 * 60 * 1000, // 5 minutes
    '1D': 15 * 60 * 1000,// 15 minutes
  };
  return intervals[timeframe];
}

/**
 * Start automatic synchronization for multiple timeframes
 */
export function startAutoSync(config: AutoSyncConfig): () => void {
  const { symbol, timeframes, onUpdate, onError } = config;
  const intervals: NodeJS.Timeout[] = [];

  console.log(`[AutoSync] Starting for ${symbol} on timeframes:`, timeframes);

  // Set up interval for each timeframe
  for (const timeframe of timeframes) {
    const interval = getSyncInterval(timeframe);
    
    // Initial fetch
    getCandles({ symbol, timeframe, useCache: false })
      .then(snapshot => {
        console.log(`[AutoSync] Initial fetch completed: ${symbol} ${timeframe}`);
        onUpdate?.(snapshot);
      })
      .catch(error => {
        console.error(`[AutoSync] Initial fetch failed: ${symbol} ${timeframe}`, error);
        onError?.(error, symbol, timeframe);
      });

    // Periodic updates
    const timer = setInterval(async () => {
      try {
        const snapshot = await getCandles({ symbol, timeframe, useCache: false });
        console.log(`[AutoSync] Update fetched: ${symbol} ${timeframe}`);
        onUpdate?.(snapshot);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        console.error(`[AutoSync] Update failed: ${symbol} ${timeframe}`, err);
        onError?.(err, symbol, timeframe);
      }
    }, interval);

    intervals.push(timer);
  }

  // Return stop function
  return () => {
    console.log(`[AutoSync] Stopping for ${symbol}`);
    intervals.forEach(timer => clearInterval(timer));
  };
}
