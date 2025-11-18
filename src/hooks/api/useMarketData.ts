import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api';
import { TrendAnalysis, VolumeAnalysis, MomentumIndicators } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';

/**
 * Hook to fetch market data for a symbol
 */
export const useMarketData = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.MARKET_DATA, symbol, timeframe],
    queryFn: async () => {
      const response = await marketService.getMarketData(symbol, timeframe);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time data
  });
};

/**
 * Hook to fetch trend analysis
 */
export const useTrendAnalysis = (symbol: string) => {
  return useQuery({
    queryKey: ['trend-analysis', symbol],
    queryFn: async () => {
      // For now, use mock data
      return marketService.getMockTrendAnalysis();
      
      // When API is ready:
      // const response = await marketService.getTrendAnalysis(symbol);
      // if (response.error) throw new Error(response.error.message);
      // return response.data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

/**
 * Hook to fetch volume analysis
 */
export const useVolumeAnalysis = (symbol: string) => {
  return useQuery({
    queryKey: ['volume-analysis', symbol],
    queryFn: async () => {
      const response = await marketService.getVolumeAnalysis(symbol);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

/**
 * Hook to fetch momentum indicators
 */
export const useMomentumIndicators = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: ['momentum-indicators', symbol, timeframe],
    queryFn: async () => {
      const response = await marketService.getMomentumIndicators(symbol, timeframe);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
