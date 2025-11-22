import { apiClient } from './apiClient';
import {
  MarketData,
  WatchlistItem,
  TrendAnalysis,
  VolumeAnalysis,
  MomentumIndicators,
  ApiResponse,
} from '@/types';
import { API_ENDPOINTS } from '../constants';
import { supabaseMarketService } from './supabaseMarketService';

export const marketService = {
  /**
   * Get market data for a symbol
   */
  async getMarketData(symbol: string, timeframe: string): Promise<ApiResponse<MarketData>> {
    return supabaseMarketService.getMarketData(symbol);
  },

  /**
   * Get user's watchlist
   */
  async getWatchlist(userId: string): Promise<ApiResponse<WatchlistItem[]>> {
    return supabaseMarketService.getWatchlist(userId);
  },

  /**
   * Add symbol to watchlist
   */
  async addToWatchlist(
    userId: string,
    symbol: string,
    timeframe: string
  ): Promise<ApiResponse<WatchlistItem>> {
    return supabaseMarketService.addToWatchlist(userId, symbol, timeframe);
  },

  /**
   * Remove symbol from watchlist
   */
  async removeFromWatchlist(watchlistId: string): Promise<ApiResponse<void>> {
    return supabaseMarketService.removeFromWatchlist(watchlistId);
  },

  /**
   * Get trend analysis for a symbol
   */
  async getTrendAnalysis(symbol: string): Promise<ApiResponse<TrendAnalysis[]>> {
    return supabaseMarketService.getTrendAnalysis(symbol);
  },

  /**
   * Get volume analysis
   */
  async getVolumeAnalysis(symbol: string): Promise<ApiResponse<VolumeAnalysis>> {
    return supabaseMarketService.getVolumeAnalysis(symbol);
  },

  /**
   * Get momentum indicators
   */
  async getMomentumIndicators(
    symbol: string,
    timeframe: string
  ): Promise<ApiResponse<MomentumIndicators>> {
    return supabaseMarketService.getMomentumIndicators(symbol, timeframe);
  },
};