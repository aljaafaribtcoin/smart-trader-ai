import { apiClient } from './apiClient';
import { AIAnalysis, AIConfluence, AIRecommendation, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '../constants';

export const aiService = {
  /**
   * Analyze a symbol with AI
   */
  async analyzeSymbol(
    symbol: string,
    timeframe: string,
    analysisType: string = 'confluence'
  ): Promise<ApiResponse<AIAnalysis>> {
    return apiClient.post<AIAnalysis>(API_ENDPOINTS.AI_ANALYZE, {
      symbol,
      timeframe,
      analysisType,
    });
  },

  /**
   * Get confluence analysis for a symbol
   */
  async getConfluence(symbol: string, timeframe: string): Promise<ApiResponse<AIConfluence>> {
    return apiClient.get<AIConfluence>(API_ENDPOINTS.AI_CONFLUENCE, { symbol, timeframe });
  },

  /**
   * Get AI recommendation for a trade
   */
  async getRecommendation(
    symbol: string,
    tradeType: 'long' | 'short'
  ): Promise<ApiResponse<AIRecommendation>> {
    return apiClient.post<AIRecommendation>(API_ENDPOINTS.AI_RECOMMENDATION, {
      symbol,
      tradeType,
    });
  },
};