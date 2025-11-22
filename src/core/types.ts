// Core Market Data Types - Unified Standard Format

export type Timeframe = '1D' | '4H' | '1H' | '15m' | '5m' | '3m';

export interface Candle {
  timestamp: number;   // Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;      // e.g., BTCUSDT
  base: string;        // e.g., BTC
  quote: string;       // e.g., USDT
}

export interface FetchCandlesParams {
  symbol: string;
  timeframe: Timeframe;
  limit?: number;      // Default: 500
}

export type DataSource = 'binance' | 'coinmarketcap' | 'livecoinwatch' | 'bybit';

export interface MarketSnapshot {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  lastUpdated: number;  // Unix timestamp in milliseconds
  source: DataSource;
}

export interface GetCandlesOptions extends FetchCandlesParams {
  preferredSource?: DataSource;   // Default: binance
  useCache?: boolean;             // Default: true
}

// Helper type for timeframe intervals (in milliseconds)
export const TIMEFRAME_MS: Record<Timeframe, number> = {
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1H': 60 * 60 * 1000,
  '4H': 4 * 60 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
};

// Helper type for cache TTL (in milliseconds)
export const CACHE_TTL: Record<Timeframe, number> = {
  '3m': 10 * 1000,      // 10 seconds
  '5m': 10 * 1000,      // 10 seconds
  '15m': 30 * 1000,     // 30 seconds
  '1H': 60 * 1000,      // 1 minute
  '4H': 5 * 60 * 1000,  // 5 minutes
  '1D': 15 * 60 * 1000, // 15 minutes
};
