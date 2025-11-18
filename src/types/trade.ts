// Trade Types
export type TradeType = 'long' | 'short';
export type TradeStatus = 'open' | 'closed' | 'pending' | 'cancelled';
export type TradeStyle = 'scalping' | 'day' | 'swing' | 'position';

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  style: TradeStyle;
  
  // Entry
  entryPrice: number;
  entryZoneMin?: number;
  entryZoneMax?: number;
  entryTime: Date;
  
  // Exit
  stopLoss: number;
  takeProfits: TakeProfit[];
  exitPrice?: number;
  exitTime?: Date;
  
  // Position
  quantity: number;
  leverage: number;
  positionSize: number;
  
  // Performance
  pnl?: number;
  pnlPercentage?: number;
  fees: number;
  
  // AI Analysis
  confidenceScore: number;
  aiReason: string;
  riskReward: number;
  
  // Metadata
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TakeProfit {
  level: number;
  price: number;
  percentage: number; // percentage of position to close
  hit: boolean;
  hitTime?: Date;
}

export interface TradeSignal {
  symbol: string;
  type: TradeType;
  timeframe: string;
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfits: number[];
  confidenceScore: number;
  riskReward: number;
  signalStrength: 'weak' | 'medium' | 'strong';
  reason: string;
  validUntil: Date;
}

export interface TradeExecution {
  tradeId: string;
  executionPrice: number;
  executionTime: Date;
  slippage: number;
  fees: number;
  success: boolean;
  errorMessage?: string;
}
