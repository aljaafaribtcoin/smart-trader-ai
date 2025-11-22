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

};
