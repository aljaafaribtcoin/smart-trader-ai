import { Timeframe, MarketSnapshot } from '@/core/types';
import { getCandles } from '@/data/marketDataService';

/**
 * Load all timeframes for a symbol in parallel
 */
export async function loadAllTimeframesForSymbol(
  symbol: string,
  timeframes: Timeframe[] = ['1D', '4H', '1H', '15m', '5m', '3m']
): Promise<Record<Timeframe, MarketSnapshot | null>> {
  console.log(`[MarketController] Loading all timeframes for ${symbol}:`, timeframes);

  try {
    // Fetch all timeframes in parallel for maximum efficiency
    const promises = timeframes.map(timeframe =>
      getCandles({ symbol, timeframe, useCache: true })
        .then(snapshot => ({ timeframe, snapshot, error: null }))
        .catch(error => {
          console.error(`[MarketController] Failed to load ${timeframe}:`, {
            error: error.message,
            symbol,
            timeframe,
            timestamp: new Date().toISOString()
          });
          return { timeframe, snapshot: null, error: error.message };
        })
    );

    const results = await Promise.all(promises);

    // Build result object
    const snapshots: Record<string, MarketSnapshot | null> = {};
    let successCount = 0;
    const failures: Array<{ timeframe: Timeframe; error: string }> = [];

    for (const { timeframe, snapshot, error } of results) {
      snapshots[timeframe] = snapshot;
      if (snapshot) {
        successCount++;
      } else {
        failures.push({ timeframe, error: error || 'Unknown error' });
      }
    }

    console.log(
      `[MarketController] Loaded ${successCount}/${timeframes.length} timeframes for ${symbol}`,
      failures.length > 0 ? { failures } : ''
    );

    // Only throw if ALL timeframes failed
    if (successCount === 0) {
      throw new Error(
        `Failed to load all timeframes for ${symbol}. Failures: ${JSON.stringify(failures)}`
      );
    }

    return snapshots as Record<Timeframe, MarketSnapshot | null>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MarketController] Error loading timeframes:`, message);
    throw new Error(`Failed to load market data for ${symbol}: ${message}`);
  }
}

/**
 * Load single timeframe with detailed error info
 */
export async function loadSingleTimeframe(
  symbol: string,
  timeframe: Timeframe,
  preferredSource?: 'binance' | 'bybit' | 'livecoinwatch' | 'coinmarketcap'
): Promise<MarketSnapshot> {
  console.log(`[MarketController] Loading ${symbol} ${timeframe}`);

  try {
    const snapshot = await getCandles({
      symbol,
      timeframe,
      preferredSource,
      useCache: true,
    });

    console.log(
      `[MarketController] Successfully loaded ${symbol} ${timeframe} from ${snapshot.source}`
    );

    return snapshot;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MarketController] Failed to load ${symbol} ${timeframe}:`, message);
    throw error;
  }
}

/**
 * Refresh data for specific timeframes (bypass cache)
 */
export async function refreshTimeframes(
  symbol: string,
  timeframes: Timeframe[]
): Promise<Record<Timeframe, MarketSnapshot>> {
  console.log(`[MarketController] Refreshing timeframes for ${symbol}:`, timeframes);

  const promises = timeframes.map(timeframe =>
    getCandles({ symbol, timeframe, useCache: false })
      .then(snapshot => ({ timeframe, snapshot }))
  );

  const results = await Promise.all(promises);

  const snapshots: Record<string, MarketSnapshot> = {};
  for (const { timeframe, snapshot } of results) {
    snapshots[timeframe] = snapshot;
  }

  return snapshots as Record<Timeframe, MarketSnapshot>;
}

/**
 * Check data freshness for all timeframes
 */
export function checkDataFreshness(
  snapshots: Record<Timeframe, MarketSnapshot>
): Record<Timeframe, { isFresh: boolean; age: number }> {
  const now = Date.now();
  const result: Record<string, { isFresh: boolean; age: number }> = {};

  for (const [timeframe, snapshot] of Object.entries(snapshots)) {
    const age = now - snapshot.lastUpdated;
    const maxAge = {
      '3m': 30 * 1000,
      '5m': 30 * 1000,
      '15m': 60 * 1000,
      '1H': 2 * 60 * 1000,
      '4H': 10 * 60 * 1000,
      '1D': 30 * 60 * 1000,
    }[timeframe as Timeframe] || 60 * 1000;

    result[timeframe] = {
      isFresh: age < maxAge,
      age,
    };
  }

  return result as Record<Timeframe, { isFresh: boolean; age: number }>;
}
