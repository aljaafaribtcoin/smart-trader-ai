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

  /**
   * Mock function - returns hardcoded patterns for development
   */
  getMockPatterns(): Pattern[] {
    return [
      {
        id: '1',
        symbol: 'AVAXUSDT',
        timeframe: '15m',
        type: 'double_bottom',
        name: 'Double Bottom',
        nameArabic: 'قاع مزدوج',
        status: 'confirmed',
        signal: 'bullish',
        strength: 'medium',
        reliability: 75,
        formationStart: 14.20,
        formationEnd: 14.25,
        breakoutLevel: 14.55,
        targetPrice: 15.30,
        duration: 48,
        priceRange: {
          high: 14.55,
          low: 14.20,
        },
        volume: {
          average: 1500000,
          onBreakout: 2300000,
        },
        supportingFactors: [
          'RSI في منطقة التشبع البيعي',
          'زيادة في حجم التداول',
          'ارتداد من منطقة دعم قوية',
        ],
        confluenceScore: 82,
        description: 'نموذج قاع مزدوج محتمل يتشكل على فريم 15 دقيقة',
        tradingImplication: 'إشارة صعودية - انتظر كسر مستوى 14.55 للدخول',
        detectedAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7200000),
      },
      {
        id: '2',
        symbol: 'AVAXUSDT',
        timeframe: '4h',
        type: 'channel_descending',
        name: 'Descending Channel',
        nameArabic: 'قناة هابطة',
        status: 'forming',
        signal: 'neutral',
        strength: 'medium',
        reliability: 68,
        formationStart: 15.80,
        duration: 96,
        priceRange: {
          high: 15.80,
          low: 14.10,
        },
        volume: {
          average: 3200000,
        },
        supportingFactors: [
          'خطوط القناة واضحة',
          'لمسات متعددة للحدود العليا والسفلى',
        ],
        confluenceScore: 70,
        description: 'قناة هابطة تتشكل على فريم 4 ساعات',
        tradingImplication: 'تحت المراقبة - انتظر كسر للأعلى أو للأسفل',
        detectedAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
      },
    ];
  },

  /**
   * Mock function - returns pattern recognition result
   */
  getMockPatternRecognition(): PatternRecognitionResult {
    return {
      symbol: 'AVAXUSDT',
      timeframe: '1H',
      patterns: this.getMockPatterns(),
      totalCount: 2,
      bullishCount: 1,
      bearishCount: 0,
      scannedAt: new Date(),
    };
  },
};
