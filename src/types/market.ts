// Market Data Types
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
export type TrendDirection = 'bullish' | 'bearish' | 'neutral' | 'ranging';

export interface MarketData {
  symbol: string;
  timeframe: Timeframe;
  price: number;
  change24h: number;
  changePercentage: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  timeframe: Timeframe;
  price: string;
  change: string;
  changePercentage: number;
  positive: boolean;
  isFavorite: boolean;
  alerts?: PriceAlert[];
  createdAt: Date;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  triggered: boolean;
  message: string;
  createdAt: Date;
}

export interface TrendAnalysis {
  timeframe: Timeframe;
  direction: TrendDirection;
  strength: 'weak' | 'medium' | 'strong';
  signal: string;
  signalColor: string;
}

export interface SupportResistance {
  type: 'support' | 'resistance';
  price: number;
  strength: 'weak' | 'medium' | 'strong';
  touches: number;
  timeframe: Timeframe;
}

export interface MarketInsight {
  title: string;
  description: string;
  value: string | number;
  status: 'positive' | 'negative' | 'neutral';
  importance: 'low' | 'medium' | 'high';
}

export interface VolumeAnalysis {
  current: number;
  average30d: number;
  percentageChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  buyPressure: number; // 0-100
  sellPressure: number; // 0-100
}

export interface MomentumIndicators {
  rsi: number;
  rsiSignal: 'overbought' | 'oversold' | 'neutral';
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish';
  };
  stochastic: {
    k: number;
    d: number;
    signal: 'overbought' | 'oversold' | 'neutral';
  };
}
