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

export const marketService = {
  /**
   * Get market data for a symbol
   */
  async getMarketData(symbol: string, timeframe: string): Promise<ApiResponse<MarketData>> {
    return apiClient.get<MarketData>(API_ENDPOINTS.MARKET_DATA, { symbol, timeframe });
  },

  /**
   * Get user's watchlist
   */
  async getWatchlist(userId: string): Promise<ApiResponse<WatchlistItem[]>> {
    return apiClient.get<WatchlistItem[]>(`${API_ENDPOINTS.WATCHLIST}/${userId}`);
  },

  /**
   * Add symbol to watchlist
   */
  async addToWatchlist(
    userId: string,
    symbol: string,
    timeframe: string
  ): Promise<ApiResponse<WatchlistItem>> {
    return apiClient.post<WatchlistItem>(API_ENDPOINTS.WATCHLIST, {
      userId,
      symbol,
      timeframe,
    });
  },

  /**
   * Remove symbol from watchlist
   */
  async removeFromWatchlist(watchlistId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${API_ENDPOINTS.WATCHLIST}/${watchlistId}`);
  },

  /**
   * Get trend analysis for a symbol
   */
  async getTrendAnalysis(symbol: string): Promise<ApiResponse<TrendAnalysis[]>> {
    return apiClient.get<TrendAnalysis[]>(API_ENDPOINTS.TRENDS, { symbol });
  },

  /**
   * Get volume analysis
   */
  async getVolumeAnalysis(symbol: string): Promise<ApiResponse<VolumeAnalysis>> {
    return apiClient.get<VolumeAnalysis>(`${API_ENDPOINTS.INDICATORS}/volume`, { symbol });
  },

  /**
   * Get momentum indicators
   */
  async getMomentumIndicators(
    symbol: string,
    timeframe: string
  ): Promise<ApiResponse<MomentumIndicators>> {
    return apiClient.get<MomentumIndicators>(`${API_ENDPOINTS.INDICATORS}/momentum`, {
      symbol,
      timeframe,
    });
  },

  /**
   * Mock function - returns hardcoded watchlist for development
   */
  getMockWatchlist(): WatchlistItem[] {
    return [
      {
        id: '1',
        userId: 'user-1',
        symbol: 'BTCUSDT',
        timeframe: '1h',
        price: '68,420',
        change: '+2.3%',
        changePercentage: 2.3,
        positive: true,
        isFavorite: true,
        createdAt: new Date(),
      },
      {
        id: '2',
        userId: 'user-1',
        symbol: 'AVAXUSDT',
        timeframe: '15m',
        price: '14.82',
        change: '-1.9%',
        changePercentage: -1.9,
        positive: false,
        isFavorite: false,
        createdAt: new Date(),
      },
      {
        id: '3',
        userId: 'user-1',
        symbol: 'SEIUSDT',
        timeframe: '4h',
        price: '0.17',
        change: '-4.5%',
        changePercentage: -4.5,
        positive: false,
        isFavorite: false,
        createdAt: new Date(),
      },
    ];
  },

  /**
   * Mock function - returns trend analysis
   */
  getMockTrendAnalysis(): TrendAnalysis[] {
    return [
      {
        timeframe: '5m',
        direction: 'ranging',
        strength: 'weak',
        signal: 'تذبذب',
        signalColor: 'text-amber-300',
      },
      {
        timeframe: '15m',
        direction: 'bullish',
        strength: 'medium',
        signal: 'إشارة شراء',
        signalColor: 'text-emerald-300',
      },
      {
        timeframe: '1h',
        direction: 'bullish',
        strength: 'weak',
        signal: 'ضعيف صاعد',
        signalColor: 'text-amber-300',
      },
      {
        timeframe: '4h',
        direction: 'bearish',
        strength: 'medium',
        signal: 'هابط',
        signalColor: 'text-red-300',
      },
    ];
  },
};
