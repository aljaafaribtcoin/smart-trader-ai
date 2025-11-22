import { apiClient } from './apiClient';
import { Pattern, PatternRecognitionResult, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '../constants';

export const patternService = {
  /**
   * Scan for patterns on a symbol
   */
  async scanPatterns(symbol: string, timeframes: string[]): Promise<ApiResponse<PatternRecognitionResult>> {
    return apiClient.post<PatternRecognitionResult>(API_ENDPOINTS.PATTERNS_SCAN, {
      symbol,
      timeframes,
    });
  },

  /**
   * Get detected patterns for a symbol
   */
  async getDetectedPatterns(symbol: string): Promise<ApiResponse<Pattern[]>> {
    return apiClient.get<Pattern[]>(API_ENDPOINTS.PATTERNS_DETECTED, { symbol });
  },

  /**
   * Get all patterns for a user's watchlist
   */
  async getWatchlistPatterns(userId: string): Promise<ApiResponse<Pattern[]>> {
    return apiClient.get<Pattern[]>(`${API_ENDPOINTS.PATTERNS_DETECTED}/watchlist/${userId}`);
  },
};