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

  /**
   * Mock function - returns hardcoded AI analysis for development
   */
  getMockAnalysis(): AIAnalysis {
    return {
      id: '1',
      symbol: 'AVAXUSDT',
      timeframe: '1H',
      analysisType: 'confluence',
      signalType: 'long',
      signalStrength: 'strong',
      confidenceScore: 84,
      summary:
        'إشارة شراء قوية مع تأكيد من عدة مؤشرات فنية ونموذج ارتداد واضح من منطقة طلب قوية.',
      detailedAnalysis:
        'يلاحظ النظام أن AVAXUSDT يتحرك داخل موجة هبوط رئيسية على الفريمات الكبيرة (4H, 1D)، لكنه يظهر إشارات ارتداد قصيرة على فريم 15m و 1H بعد دخول حجم شراء واضح من منطقة 14.20 - 14.40.',
      keyPoints: [
        'تقاطع إيجابي محتمل في MACD على فريم 1H مع تحسن تدريجي في الزخم.',
        'ظهور نموذج قاع مزدوج صغير على فريم 15m عند منطقة 14.20 - 14.25.',
        'RSI يخرج من التشبع البيعي على الفريمات القصيرة مع ارتفاع تدريجي في الفوليوم.',
      ],
      warnings: [
        'الاتجاه العام على الفريمات الكبيرة لا يزال هابطاً.',
        'يجب الالتزام الصارم بوقف الخسارة.',
      ],
      entryZone: {
        min: 14.4,
        max: 14.55,
      },
      stopLoss: 14.18,
      takeProfits: [14.9, 15.3, 15.8],
      riskReward: '3:1',
      positionSizing: 2,
      maxLoss: 270,
      trendAnalysis: {
        shortTerm: 'صاعد - ارتداد من منطقة دعم',
        mediumTerm: 'محايد - داخل نطاق تداول',
        longTerm: 'هابط - اتجاه هابط أساسي',
      },
      volumeAnalysis: 'حجم تداول متزايد مع شموع خضراء، يدل على دخول مشترين.',
      momentum: 'تحسن تدريجي في الزخم بعد منطقة تشبع بيعي.',
      supportingIndicators: [
        'RSI خارج من منطقة التشبع البيعي',
        'نموذج قاع مزدوج محتمل',
        'زيادة في حجم التداول',
        'ارتداد من منطقة طلب قوية',
      ],
      conflictingIndicators: ['MACD لا يزال تحت خط الصفر على الفريمات الكبيرة'],
      validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Mock function - returns confluence analysis
   */
  getMockConfluence(): AIConfluence {
    return {
      symbol: 'AVAXUSDT',
      totalScore: 84,
      factors: [
        {
          name: 'نموذج قاع مزدوج',
          category: 'pattern',
          score: 85,
          weight: 0.25,
          signal: 'bullish',
          description: 'تشكل نموذج قاع مزدوج واضح على فريم 15m',
        },
        {
          name: 'RSI',
          category: 'momentum',
          score: 78,
          weight: 0.2,
          signal: 'bullish',
          description: 'خروج من منطقة التشبع البيعي',
        },
        {
          name: 'حجم التداول',
          category: 'volume',
          score: 90,
          weight: 0.2,
          signal: 'bullish',
          description: 'زيادة ملحوظة في حجم الشراء',
        },
        {
          name: 'منطقة الطلب',
          category: 'technical',
          score: 88,
          weight: 0.2,
          signal: 'bullish',
          description: 'ارتداد من منطقة طلب قوية عند 14.20-14.40',
        },
        {
          name: 'MACD',
          category: 'momentum',
          score: 72,
          weight: 0.15,
          signal: 'neutral',
          description: 'تحسن تدريجي لكن لا يزال تحت خط الصفر',
        },
      ],
      recommendation: 'buy',
      timeframe: '1H',
    };
  },
};
