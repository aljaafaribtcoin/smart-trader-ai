import { MarketSnapshot, Timeframe, CACHE_TTL } from '@/core/types';

type CacheKey = `${string}_${Timeframe}`;

interface CacheEntry {
  snapshot: MarketSnapshot;
  expiresAt: number;
}

// In-memory cache store
const cache = new Map<CacheKey, CacheEntry>();

/**
 * Generate cache key from symbol and timeframe
 */
function getCacheKey(symbol: string, timeframe: Timeframe): CacheKey {
  return `${symbol}_${timeframe}`;
}

/**
 * Store market snapshot in cache with automatic TTL
 */
export function setMarketSnapshot(
  snapshot: MarketSnapshot,
  customTtlMs?: number
): void {
  const key = getCacheKey(snapshot.symbol, snapshot.timeframe);
  const ttl = customTtlMs || CACHE_TTL[snapshot.timeframe];
  const expiresAt = Date.now() + ttl;

  cache.set(key, {
    snapshot,
    expiresAt,
  });

  console.log(`[Cache] Stored ${key} (TTL: ${ttl}ms, expires at: ${new Date(expiresAt).toLocaleTimeString()})`);
}

/**
 * Retrieve market snapshot from cache if not expired
 */
export function getMarketSnapshot(
  symbol: string,
  timeframe: Timeframe
): MarketSnapshot | null {
  const key = getCacheKey(symbol, timeframe);
  const entry = cache.get(key);

  if (!entry) {
    console.log(`[Cache] Miss: ${key}`);
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    console.log(`[Cache] Expired: ${key}`);
    cache.delete(key);
    return null;
  }

  console.log(`[Cache] Hit: ${key}`);
  return entry.snapshot;
}

/**
 * Clear all cached snapshots
 */
export function clearCache(): void {
  const size = cache.size;
  cache.clear();
  console.log(`[Cache] Cleared ${size} entries`);
}

/**
 * Clear expired entries (cleanup utility)
 */
export function clearExpiredEntries(): void {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`[Cache] Cleared ${cleared} expired entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; expiresIn: number }>;
} {
  const now = Date.now();
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    expiresIn: Math.max(0, entry.expiresAt - now),
  }));

  return {
    size: cache.size,
    entries,
  };
}
