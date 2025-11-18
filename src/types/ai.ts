// AI Analysis Types
export interface AIAnalysis {
  id: string;
  symbol: string;
  timeframe: string;
  analysisType: 'confluence' | 'technical' | 'sentiment' | 'pattern';
  
  // Signal
  signalType: 'long' | 'short' | 'neutral';
  signalStrength: 'weak' | 'medium' | 'strong';
  confidenceScore: number; // 0-100
  
  // Analysis Details
  summary: string;
  detailedAnalysis: string;
  keyPoints: string[];
  warnings?: string[];
  
  // Price Levels
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfits: number[];
  
  // Risk Management
  riskReward: string;
  positionSizing: number;
  maxLoss: number;
  
  // Market Context
  trendAnalysis: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  volumeAnalysis: string;
  momentum: string;
  
  // Supporting Data
  supportingIndicators: string[];
  conflictingIndicators: string[];
  
  // Metadata
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConfluence {
  symbol: string;
  totalScore: number; // 0-100
  factors: ConfluenceFactor[];
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  timeframe: string;
}

export interface ConfluenceFactor {
  name: string;
  category: 'technical' | 'volume' | 'pattern' | 'momentum' | 'sentiment';
  score: number; // 0-100
  weight: number; // importance weight
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface AIRecommendation {
  action: 'enter' | 'exit' | 'hold' | 'wait';
  reason: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  conditions?: string[];
}

export interface MarketCondition {
  volatility: 'low' | 'medium' | 'high';
  liquidity: 'low' | 'medium' | 'high';
  trendStrength: number; // 0-100
  marketPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  sentiment: 'extremely_bearish' | 'bearish' | 'neutral' | 'bullish' | 'extremely_bullish';
}
