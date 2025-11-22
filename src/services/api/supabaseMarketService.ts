import { supabase } from '@/integrations/supabase/client';
import {
  MarketData,
  WatchlistItem,
  TrendAnalysis,
  VolumeAnalysis,
  MomentumIndicators,
  ApiResponse,
} from '@/types';

/**
 * Service for interacting with market data stored in Supabase
 */
export const supabaseMarketService = {
  /**
   * Get market data from Supabase market_prices table
   */
  async getMarketData(symbol: string): Promise<ApiResponse<MarketData>> {
    try {
      const { data: priceData, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (!priceData) {
        return {
          data: null,
          error: {
            code: 'NOT_FOUND',
            message: 'No market data found',
          },
          status: 404,
        };
      }

      const marketData: MarketData = {
        symbol: priceData.symbol,
        timeframe: '1h',
        price: parseFloat(priceData.price.toString()),
        change24h: priceData.change_24h || 0,
        changePercentage: priceData.change_24h || 0,
        high24h: priceData.high_24h || 0,
        low24h: priceData.low_24h || 0,
        volume24h: priceData.volume_24h || 0,
        timestamp: new Date(priceData.last_updated),
      };

      return {
        data: marketData,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Get user's watchlist with live prices
   */
  async getWatchlist(userId: string): Promise<ApiResponse<WatchlistItem[]>> {
    try {
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId);

      if (watchlistError) throw watchlistError;

      if (!watchlistData || watchlistData.length === 0) {
        return {
          data: [],
          error: null,
          status: 200,
        };
      }

      // Get prices for all symbols in watchlist
      const symbols = watchlistData.map((item) => item.symbol);
      const { data: pricesData, error: pricesError } = await supabase
        .from('market_prices')
        .select('*')
        .in('symbol', symbols)
        .order('last_updated', { ascending: false });

      if (pricesError) throw pricesError;

      // Merge watchlist with prices
      const watchlistItems: WatchlistItem[] = watchlistData.map((item) => {
        const priceData = pricesData?.find((p) => p.symbol === item.symbol);
        const change = priceData?.change_24h || 0;

        return {
          id: item.id,
          userId: item.user_id,
          symbol: item.symbol,
          timeframe: (item.timeframe || '1h') as any,
          price: priceData?.price?.toString() || '0',
          change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
          changePercentage: change,
          positive: change >= 0,
          isFavorite: false,
          createdAt: new Date(item.created_at),
        };
      });

      return {
        data: watchlistItems,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Add symbol to watchlist
   */
  async addToWatchlist(
    userId: string,
    symbol: string,
    timeframe: string
  ): Promise<ApiResponse<WatchlistItem>> {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: userId,
          symbol,
          timeframe,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          symbol: data.symbol,
          timeframe: (data.timeframe || '1h') as any,
          price: '0',
          change: '0%',
          changePercentage: 0,
          positive: true,
          isFavorite: false,
          createdAt: new Date(data.created_at),
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return {
        data: null,
        error: {
          code: 'ADD_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Remove symbol from watchlist
   */
  async removeFromWatchlist(watchlistId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;

      return {
        data: undefined,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return {
        data: null,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Get trend analysis from technical indicators
   */
  async getTrendAnalysis(symbol: string): Promise<ApiResponse<TrendAnalysis[]>> {
    try {
      const timeframes = ['5m', '15m', '1h', '4h'];
      const { data: indicators, error } = await supabase
        .from('technical_indicators')
        .select('*')
        .eq('symbol', symbol)
        .in('timeframe', timeframes);

      if (error) throw error;

      const trendAnalysis: TrendAnalysis[] = timeframes.map((tf) => {
        const indicator = indicators?.find((i) => i.timeframe === tf);
        
        if (!indicator) {
          return {
            timeframe: tf as any,
            direction: 'ranging',
            strength: 'weak',
            signal: 'تذبذب',
            signalColor: 'text-amber-300',
          };
        }

        const rsi = parseFloat(indicator.rsi?.toString() || '50');
        const macdHistogram = parseFloat(indicator.macd_histogram?.toString() || '0');
        
        let direction: TrendAnalysis['direction'] = 'ranging';
        let strength: TrendAnalysis['strength'] = 'weak';
        let signal = 'تذبذب';
        let signalColor = 'text-amber-300';

        if (rsi > 60 && macdHistogram > 0) {
          direction = 'bullish';
          strength = rsi > 70 ? 'strong' : 'medium';
          signal = strength === 'strong' ? 'إشارة شراء قوية' : 'إشارة شراء';
          signalColor = 'text-emerald-300';
        } else if (rsi < 40 && macdHistogram < 0) {
          direction = 'bearish';
          strength = rsi < 30 ? 'strong' : 'medium';
          signal = strength === 'strong' ? 'إشارة بيع قوية' : 'هابط';
          signalColor = 'text-red-300';
        }

        return {
          timeframe: tf as any,
          direction,
          strength,
          signal,
          signalColor,
        };
      });

      return {
        data: trendAnalysis,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Get volume analysis from market prices
   */
  async getVolumeAnalysis(symbol: string): Promise<ApiResponse<VolumeAnalysis>> {
    try {
      const { data: recentPrices, error } = await supabase
        .from('market_prices')
        .select('volume_24h, last_updated')
        .eq('symbol', symbol)
        .order('last_updated', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (!recentPrices || recentPrices.length === 0) {
        return {
          data: null,
          error: {
            code: 'NOT_FOUND',
            message: 'No volume data found',
          },
          status: 404,
        };
      }

      const currentVolume = parseFloat(recentPrices[0].volume_24h?.toString() || '0');
      const avgVolume = recentPrices.reduce((sum, p) => sum + parseFloat(p.volume_24h?.toString() || '0'), 0) / recentPrices.length;
      const percentageChange = ((currentVolume - avgVolume) / avgVolume) * 100;

      const volumeAnalysis: VolumeAnalysis = {
        current: currentVolume,
        average30d: avgVolume,
        percentageChange,
        trend: percentageChange > 10 ? 'increasing' : percentageChange < -10 ? 'decreasing' : 'stable',
        buyPressure: 50 + (percentageChange / 2),
        sellPressure: 50 - (percentageChange / 2),
      };

      return {
        data: volumeAnalysis,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error fetching volume analysis:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Get momentum indicators
   */
  async getMomentumIndicators(
    symbol: string,
    timeframe: string
  ): Promise<ApiResponse<MomentumIndicators>> {
    try {
      const { data: indicator, error } = await supabase
        .from('technical_indicators')
        .select('*')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .single();

      if (error) throw error;

      if (!indicator) {
        return {
          data: null,
          error: {
            code: 'NOT_FOUND',
            message: 'No indicators found',
          },
          status: 404,
        };
      }

      const rsi = parseFloat(indicator.rsi?.toString() || '50');
      const stochasticK = parseFloat(indicator.stochastic_k?.toString() || '50');

      const momentumIndicators: MomentumIndicators = {
        rsi,
        rsiSignal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
        macd: {
          value: parseFloat(indicator.macd_value?.toString() || '0'),
          signal: parseFloat(indicator.macd_signal?.toString() || '0'),
          histogram: parseFloat(indicator.macd_histogram?.toString() || '0'),
          trend: parseFloat(indicator.macd_histogram?.toString() || '0') > 0 ? 'bullish' : 'bearish',
        },
        stochastic: {
          k: stochasticK,
          d: parseFloat(indicator.stochastic_d?.toString() || '50'),
          signal: stochasticK > 80 ? 'overbought' : stochasticK < 20 ? 'oversold' : 'neutral',
        },
      };

      return {
        data: momentumIndicators,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error fetching momentum indicators:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Trigger edge function to fetch latest prices
   */
  async fetchLatestPrices(symbols: string[]): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-livecoinwatch-prices', {
        body: { symbols },
      });

      if (error) throw error;

      return {
        data,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error triggering price fetch:', error);
      return {
        data: null,
        error: {
          code: 'INVOKE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Trigger edge function to fetch candles
   */
  async fetchCandles(symbol: string, timeframe: string, limit: number = 200): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-bybit-candles', {
        body: { symbol, timeframe, limit },
      });

      if (error) throw error;

      return {
        data,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error triggering candles fetch:', error);
      return {
        data: null,
        error: {
          code: 'INVOKE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },

  /**
   * Trigger edge function to calculate indicators
   */
  async calculateIndicators(symbol: string, timeframe: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-technical-indicators', {
        body: { symbol, timeframe },
      });

      if (error) throw error;

      return {
        data,
        error: null,
        status: 200,
      };
    } catch (error) {
      console.error('Error triggering indicators calculation:', error);
      return {
        data: null,
        error: {
          code: 'INVOKE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        status: 500,
      };
    }
  },
};
