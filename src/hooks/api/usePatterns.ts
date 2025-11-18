import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patternService } from '@/services/api';
import { Pattern, PatternRecognitionResult } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch detected patterns for a symbol
 */
export const usePatterns = (symbol: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PATTERNS, symbol],
    queryFn: async () => {
      // For now, use mock data
      return patternService.getMockPatterns();
      
      // When API is ready:
      // const response = await patternService.getDetectedPatterns(symbol);
      // if (response.error) throw new Error(response.error.message);
      // return response.data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};

/**
 * Hook to scan for new patterns
 */
export const useScanPatterns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      symbol,
      timeframes,
    }: {
      symbol: string;
      timeframes: string[];
    }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock data
      return patternService.getMockPatternRecognition();
      
      // When API is ready:
      // const response = await patternService.scanPatterns(symbol, timeframes);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData([CACHE_KEYS.PATTERNS, variables.symbol], data.patterns);
      
      const message = data.totalCount > 0
        ? `تم اكتشاف ${data.totalCount} نموذج (${data.bullishCount} صاعد، ${data.bearishCount} هابط)`
        : 'لم يتم اكتشاف أنماط جديدة';
      
      toast({
        title: 'اكتمل المسح',
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل المسح',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to fetch patterns for user's watchlist
 */
export const useWatchlistPatterns = (userId: string) => {
  return useQuery({
    queryKey: ['patterns-watchlist', userId],
    queryFn: async () => {
      // For now, use mock data
      return patternService.getMockPatterns();
      
      // When API is ready:
      // const response = await patternService.getWatchlistPatterns(userId);
      // if (response.error) throw new Error(response.error.message);
      // return response.data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};
