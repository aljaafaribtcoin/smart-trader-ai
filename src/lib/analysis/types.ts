/**
 * Smart Trader AI - Market Analyst Engine
 * Core Type Definitions
 */

// ============================================================================
// Basic Types
// ============================================================================

export type TimeframeId = '1d' | '4h' | '1h' | '15m' | '5m' | '3m' | '1m';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TimeframeData {
  timeframe: TimeframeId;
  candles: Candle[];
}

export interface SymbolMarketData {
  symbol: string;
  timeframes: TimeframeData[];
}

export interface AnalysisConfig {
  maxLookbackCandles?: number;
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  minConfidenceForSignal?: number;
  enableOrderBlocks?: boolean;
  enableLiquidityZones?: boolean;
}

// ============================================================================
// Market Structure Types
// ============================================================================

export type SwingPointType = 'HH' | 'HL' | 'LH' | 'LL';
export type StructureBreak = 'BOS' | 'CHOCH';

export interface SwingPoint {
  type: SwingPointType;
  price: number;
  timestamp: number;
  candleIndex: number;
  isHigh: boolean;
}

export interface StructureSummary {
  timeframe: TimeframeId;
  trend: 'bullish' | 'bearish' | 'range' | 'choppy';
  lastSwingHigh: number;
  lastSwingLow: number;
  swingPoints: SwingPoint[];
  recentBreak?: {
    type: StructureBreak;
    price: number;
    timestamp: number;
  };
  isNearKeySwing: boolean;
  structureStrength: number; // 0-100
}

// ============================================================================
// Order Block Types
// ============================================================================

export interface OrderBlock {
  id: string;
  direction: 'bullish' | 'bearish';
  timeframe: TimeframeId;
  priceFrom: number;
  priceTo: number;
  timestamp: number;
  strength: number; // 0-100
  volume: number;
  brokeStructure: boolean;
  clearedLiquidity: boolean;
  tested: number;
  status: 'valid' | 'tested' | 'broken';
}

// ============================================================================
// Liquidity Types
// ============================================================================

export interface LiquidityZone {
  id: string;
  type: 'equal_highs' | 'equal_lows' | 'swing_high' | 'swing_low';
  price: number;
  timeframe: TimeframeId;
  timestamp: number;
  strength: number; // 0-100
  touched: number;
  swept: boolean;
  significance: 'minor' | 'moderate' | 'major';
}

// ============================================================================
// Fakeout Types
// ============================================================================

export interface Fakeout {
  type: 'high' | 'low' | 'resistance' | 'support';
  price: number;
  timestamp: number;
  timeframe: TimeframeId;
  wickSize: number;
  bodySize: number;
  reversal: boolean;
  liquiditySwept: boolean;
  confidence: number; // 0-100
}

// ============================================================================
// Momentum Types
// ============================================================================

export interface MomentumAnalysis {
  rsi: number;
  rsiSignal: 'overbought' | 'oversold' | 'neutral';
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  divergence?: 'bullish' | 'bearish' | null;
}

// ============================================================================
// Signal Types
// ============================================================================

export interface Signal {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  confidence: number; // 0-100
  timestamp: number;
  
  entryZone: { from: number; to: number };
  stopLoss: number;
  targets: { tp1: number; tp2: number; tp3: number };
  riskReward: number;
  
  originatingTimeframe: TimeframeId;
  alignedTimeframes: TimeframeId[];
  conflictingTimeframes: TimeframeId[];
  
  supportingFactors: string[];
  tags: string[];
  
  mainScenario: string;
  alternativeScenario: string;
  invalidationPrice: number;
  invalidationReason: string;
}

// ============================================================================
// Multi-Timeframe Types
// ============================================================================

export interface MultiTimeframeSummary {
  globalBias: 'long' | 'short' | 'neutral';
  alignedTimeframes: TimeframeId[];
  conflictingTimeframes: TimeframeId[];
  dominantTimeframe: TimeframeId;
  confluenceScore: number; // 0-100
  comment: string;
}

// ============================================================================
// Key Level Types
// ============================================================================

export interface KeyLevel {
  type: 'support' | 'resistance' | 'liquidity' | 'order_block';
  price: number;
  timeframe: TimeframeId;
  strength: number; // 0-100
}

// ============================================================================
// Narrative Types
// ============================================================================

export interface Narrative {
  overview: string;
  strengthPoints: string[];
  weakPoints: string[];
  warnings: string[];
}

// ============================================================================
// Analysis Result (Main Output)
// ============================================================================

export interface TimeframeAnalysisData {
  structure: StructureSummary;
  orderBlocks: OrderBlock[];
  liquidityZones: LiquidityZone[];
  fakeouts: Fakeout[];
  momentum: MomentumAnalysis;
}

export interface AnalysisResult {
  symbol: string;
  generatedAt: number;
  
  bias: 'long' | 'short' | 'neutral';
  confidence: number; // 0-100
  marketCondition: 'trending' | 'ranging' | 'choppy' | 'high_volatility';
  
  timeframeAnalysis: {
    [K in TimeframeId]?: TimeframeAnalysisData;
  };
  
  multiTimeframe: MultiTimeframeSummary;
  keyLevels: KeyLevel[];
  signals: Signal[];
  narrative: Narrative;
  telegramSummary: string;
}

// ============================================================================
// Scoring Factor Types
// ============================================================================

export interface ScoringFactors {
  multiTimeframeAlignment: number;
  orderBlockPresence: boolean;
  liquiditySweep: boolean;
  momentumConfirmation: boolean;
  structureBreak: boolean;
  volumeConfirmation: boolean;
  nearKeyLevel: boolean;
  fakeoutDetected: boolean;
  trendStrength: number;
  rsiConfirmation: boolean;
}
