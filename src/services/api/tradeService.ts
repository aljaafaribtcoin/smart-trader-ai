import { apiClient } from './apiClient';
import { Trade, TradeSignal, TradeExecution, ApiResponse, PaginatedResponse } from '@/types';
import { API_ENDPOINTS } from '../constants';

export const tradeService = {
  /**
   * Get all trades for a user
   */
  async getTrades(
    userId: string,
    status?: 'open' | 'closed',
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Trade>>> {
    const params = { status, page, pageSize };
    return apiClient.get<PaginatedResponse<Trade>>(
      `${API_ENDPOINTS.TRADES}/${userId}`,
      params
    );
  },

  /**
   * Get open trades
   */
  async getOpenTrades(userId: string): Promise<ApiResponse<Trade[]>> {
    return apiClient.get<Trade[]>(`${API_ENDPOINTS.TRADES_OPEN}/${userId}`);
  },

  /**
   * Get closed trades
   */
  async getClosedTrades(userId: string): Promise<ApiResponse<Trade[]>> {
    return apiClient.get<Trade[]>(`${API_ENDPOINTS.TRADES_CLOSED}/${userId}`);
  },

  /**
   * Get a specific trade
   */
  async getTrade(tradeId: string): Promise<ApiResponse<Trade>> {
    return apiClient.get<Trade>(`${API_ENDPOINTS.TRADES}/${tradeId}`);
  },

  /**
   * Execute a new trade
   */
  async executeTrade(tradeData: Partial<Trade>): Promise<ApiResponse<TradeExecution>> {
    return apiClient.post<TradeExecution>(API_ENDPOINTS.TRADE_EXECUTE, tradeData);
  },

  /**
   * Close an existing trade
   */
  async closeTrade(tradeId: string, exitPrice: number): Promise<ApiResponse<Trade>> {
    return apiClient.post<Trade>(`${API_ENDPOINTS.TRADE_CLOSE}/${tradeId}`, {
      exitPrice,
      exitTime: new Date(),
    });
  },

  /**
   * Update trade (modify stop loss or take profit)
   */
  async updateTrade(tradeId: string, data: Partial<Trade>): Promise<ApiResponse<Trade>> {
    return apiClient.put<Trade>(`${API_ENDPOINTS.TRADES}/${tradeId}`, data);
  },

  /**
   * Mock function - returns hardcoded trades for development
   */
  getMockTrades(): Trade[] {
    return [
      {
        id: '1',
        userId: 'user-1',
        symbol: 'AVAXUSDT',
        type: 'long',
        status: 'open',
        style: 'swing',
        entryPrice: 14.45,
        entryZoneMin: 14.40,
        entryZoneMax: 14.55,
        entryTime: new Date(),
        stopLoss: 14.18,
        takeProfits: [
          { level: 1, price: 14.90, percentage: 30, hit: false },
          { level: 2, price: 15.30, percentage: 40, hit: false },
          { level: 3, price: 15.80, percentage: 30, hit: false },
        ],
        quantity: 100,
        leverage: 10,
        positionSize: 1445,
        pnl: 32.50,
        pnlPercentage: 3.2,
        fees: 2.15,
        confidenceScore: 84,
        aiReason: 'ارتداد من منطقة طلب + خروج RSI من التشبع البيعي + زيادة الفوليوم.',
        riskReward: 3.1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        userId: 'user-1',
        symbol: 'BTCUSDT',
        type: 'short',
        status: 'closed',
        style: 'day',
        entryPrice: 69500,
        entryTime: new Date(Date.now() - 86400000),
        stopLoss: 70200,
        takeProfits: [
          { level: 1, price: 68800, percentage: 50, hit: true, hitTime: new Date() },
          { level: 2, price: 67800, percentage: 50, hit: false },
        ],
        exitPrice: 68300,
        exitTime: new Date(),
        quantity: 0.1,
        leverage: 10,
        positionSize: 6950,
        pnl: -75.50,
        pnlPercentage: -1.1,
        fees: 10.45,
        confidenceScore: 76,
        aiReason: 'رفض قوي عند مقاومة أسبوعية مع دايفرجنس سلبي في MACD.',
        riskReward: 2.4,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
      },
    ];
  },
};
