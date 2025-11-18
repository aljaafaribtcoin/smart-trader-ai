import { apiClient } from './apiClient';
import { Account, AccountStats, AccountBalance, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '../constants';

export const accountService = {
  /**
   * Get current account details
   */
  async getAccount(userId: string): Promise<ApiResponse<Account>> {
    return apiClient.get<Account>(`${API_ENDPOINTS.ACCOUNT}/${userId}`);
  },

  /**
   * Get account statistics
   */
  async getAccountStats(userId: string): Promise<ApiResponse<AccountStats>> {
    return apiClient.get<AccountStats>(`${API_ENDPOINTS.ACCOUNT_STATS}/${userId}`);
  },

  /**
   * Get account balance
   */
  async getAccountBalance(userId: string): Promise<ApiResponse<AccountBalance>> {
    return apiClient.get<AccountBalance>(`${API_ENDPOINTS.ACCOUNT_BALANCE}/${userId}`);
  },

  /**
   * Update account settings
   */
  async updateAccount(userId: string, data: Partial<Account>): Promise<ApiResponse<Account>> {
    return apiClient.put<Account>(`${API_ENDPOINTS.ACCOUNT}/${userId}`, data);
  },

  /**
   * Mock function - returns hardcoded data for development
   */
  getMockAccount(): Account {
    return {
      id: '1',
      userId: 'user-1',
      equity: 12540.23,
      openTrades: 3,
      winRate: 68,
      exchange: 'Binance Futures',
      leverage: 10,
      balance: 12000,
      margin: 540.23,
      freeMargin: 11459.77,
      marginLevel: 2300,
      totalPnL: 540.23,
      todayPnL: 85.50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Mock function - returns hardcoded stats for development
   */
  getMockAccountStats(): AccountStats {
    return {
      totalTrades: 124,
      winningTrades: 84,
      losingTrades: 40,
      winRate: 67.74,
      totalProfit: 2540.50,
      totalLoss: -980.30,
      netProfit: 1560.20,
      averageWin: 30.24,
      averageLoss: -24.51,
      profitFactor: 2.59,
      maxDrawdown: 320.50,
    };
  },
};
