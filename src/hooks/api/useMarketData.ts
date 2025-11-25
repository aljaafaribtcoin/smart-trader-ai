import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';

/**
 * Hook to fetch market data for a symbol from Supabase
 */
export const useMarketData = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.MARKET_DATA, symbol, timeframe],
    queryFn: async () => {
      const response = await marketService.getMarketData(symbol, timeframe);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchInterval: false, // عطل التحديث التلقائي، سيتم عبر Scheduler
  });
};

/**
 * Hook to fetch trend analysis from Supabase
 */
export const useTrendAnalysis = (symbol: string) => {
  return useQuery({
    queryKey: ['trend-analysis', symbol],
    queryFn: async () => {
      const response = await marketService.getTrendAnalysis(symbol);
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    staleTime: CACHE_TIMES.LONG,
    gcTime: CACHE_TIMES.VERY_LONG,
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
    staleTime: CACHE_TIMES.LONG,
    gcTime: CACHE_TIMES.VERY_LONG,
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
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchInterval: false,
  });
};