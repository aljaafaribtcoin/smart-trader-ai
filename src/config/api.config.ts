/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const WS_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;

export const BINANCE_CONFIG = {
  API_URL: 'https://api.binance.com/api/v3',
  WS_URL: 'wss://stream.binance.com:9443/ws',
  API_KEY: import.meta.env.VITE_BINANCE_API_KEY || '',
} as const;

/**
 * Feature flags for gradual rollout
 */
export const FEATURE_FLAGS = {
  ENABLE_AI_CHAT: true,
  ENABLE_PATTERN_SCANNER: true,
  ENABLE_AUTO_TRADING: false, // Will be enabled after backend is ready
  ENABLE_WEBSOCKET: false, // Will be enabled after backend is ready
  ENABLE_REAL_TRADING: false, // Paper trading only for now
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  ACCOUNT: 30000, // 30 seconds
  WATCHLIST: 60000, // 1 minute
  TRADES: 10000, // 10 seconds
  MARKET_DATA: 5000, // 5 seconds
  PATTERNS: 30000, // 30 seconds
  AI_ANALYSIS: 120000, // 2 minutes
} as const;
