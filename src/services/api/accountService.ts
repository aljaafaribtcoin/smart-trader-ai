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
};