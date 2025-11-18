// Pattern Recognition Types
export type PatternType = 
  | 'double_bottom'
  | 'double_top'
  | 'head_shoulders'
  | 'inverse_head_shoulders'
  | 'triangle_ascending'
  | 'triangle_descending'
  | 'triangle_symmetrical'
  | 'wedge_rising'
  | 'wedge_falling'
  | 'channel_ascending'
  | 'channel_descending'
  | 'flag_bullish'
  | 'flag_bearish'
  | 'pennant'
  | 'cup_handle'
  | 'rounding_bottom'
  | 'rounding_top';

export type PatternStatus = 'forming' | 'confirmed' | 'broken' | 'completed';
export type PatternSignal = 'bullish' | 'bearish' | 'neutral';

export interface Pattern {
  id: string;
  symbol: string;
  timeframe: string;
  type: PatternType;
  name: string;
  nameArabic: string;
  
  // Pattern Details
  status: PatternStatus;
  signal: PatternSignal;
  strength: 'weak' | 'medium' | 'strong';
  reliability: number; // 0-100
  
  // Price Levels
  formationStart: number;
  formationEnd?: number;
  breakoutLevel?: number;
  targetPrice?: number;
  
  // Pattern Metrics
  duration: number; // in candles
  priceRange: {
    high: number;
    low: number;
  };
  volume: {
    average: number;
    onBreakout?: number;
  };
  
  // Confluence
  supportingFactors: string[];
  confluenceScore: number; // 0-100
  
  // Description
  description: string;
  tradingImplication: string;
  
  // Metadata
  detectedAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface PatternRecognitionResult {
  symbol: string;
  timeframe: string;
  patterns: Pattern[];
  totalCount: number;
  bullishCount: number;
  bearishCount: number;
  scannedAt: Date;
}

export interface CandlestickPattern {
  type: 'doji' | 'hammer' | 'shooting_star' | 'engulfing' | 'morning_star' | 'evening_star';
  signal: PatternSignal;
  reliability: number;
  location: 'support' | 'resistance' | 'middle';
  description: string;
}
