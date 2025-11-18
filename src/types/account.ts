// Account Types
export interface Account {
  id: string;
  userId: string;
  equity: number;
  openTrades: number;
  winRate: number;
  exchange: string;
  leverage: number;
  balance: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  totalPnL: number;
  todayPnL: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio?: number;
  maxDrawdown: number;
}

export interface AccountBalance {
  equity: number;
  balance: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
}

export type ExchangeType = 'Binance Futures' | 'Binance Spot' | 'ByBit' | 'OKX';
