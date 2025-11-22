import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pattern, PatternRecognitionResult } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch detected patterns for a symbol from Supabase
 */
export const usePatterns = (symbol: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PATTERNS, symbol],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .eq('status', 'active')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
    }): Promise<PatternRecognitionResult> => {
      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        symbol,
        timeframe: timeframes[0] || '1H',
        patterns: [],
        totalCount: 0,
        bullishCount: 0,
        bearishCount: 0,
        scannedAt: new Date(),
      };
    },
    onSuccess: (data, variables) => {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};