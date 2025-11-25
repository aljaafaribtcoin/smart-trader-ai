// API Constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
  // Account
  ACCOUNT: '/account',
  ACCOUNT_STATS: '/account/stats',
  ACCOUNT_BALANCE: '/account/balance',
  
  // Trades
  TRADES: '/trades',
  TRADES_OPEN: '/trades/open',
  TRADES_CLOSED: '/trades/closed',
  TRADE_EXECUTE: '/trades/execute',
  TRADE_CLOSE: '/trades/close',
  
  // Market
  MARKET_DATA: '/market/data',
  WATCHLIST: '/watchlist',
  PRICE_ALERTS: '/alerts',
  TRENDS: '/market/trends',
  INDICATORS: '/market/indicators',
  
  // AI
  AI_ANALYZE: '/ai/analyze',
  AI_CONFLUENCE: '/ai/confluence',
  AI_RECOMMENDATION: '/ai/recommendation',
  
  // Chat
  CHAT_MESSAGES: '/chat/messages',
  CHAT_SEND: '/chat/send',
  CHAT_CONVERSATIONS: '/chat/conversations',
  
  // Patterns
  PATTERNS_SCAN: '/patterns/scan',
  PATTERNS_DETECTED: '/patterns/detected',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  TIMEOUT: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
  UNAUTHORIZED: 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.',
  FORBIDDEN: 'ليس لديك صلاحية للوصول لهذا المورد.',
  NOT_FOUND: 'المورد المطلوب غير موجود.',
  SERVER_ERROR: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
  UNKNOWN: 'حدث خطأ غير متوقع.',
} as const;

export const CACHE_KEYS = {
  ACCOUNT: 'account',
  WATCHLIST: 'watchlist',
  TRADES: 'trades',
  PATTERNS: 'patterns',
  MARKET_DATA: 'market-data',
} as const;

export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 10 * 60 * 1000,      // 10 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const;
