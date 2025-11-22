import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIAnalysis, AIConfluence } from '@/types';
import { CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { AnalysisResult } from '@/lib/analysis/types';

/**
 * Hook to fetch AI analysis for a symbol
 */
export const useAIAnalysis = (
  symbol: string,
  timeframe: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['ai-analysis', symbol, timeframe],
    queryFn: async (): Promise<AnalysisResult | null> => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: {
          symbol,
          timeframes: ['1d', '4h', '1h', '15m'],
          userId: user?.user?.id
        }
      });

      if (error) {
        console.error('AI Analysis error:', error);
        throw new Error(error.message || 'فشل في تحليل السوق');
      }

      return data?.data || null;
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};

/**
 * Hook to trigger AI analysis (manual trigger)
 */
export const useAnalyzeSymbol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      symbol,
      timeframe,
    }: {
      symbol: string;
      timeframe: string;
    }): Promise<AnalysisResult | null> => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: {
          symbol,
          timeframes: ['1d', '4h', '1h', '15m'],
          userId: user?.user?.id
        }
      });

      if (error) {
        throw new Error(error.message || 'فشل في تحليل السوق');
      }

      return data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-analysis', variables.symbol] });
      
      toast({
        title: 'تم التحليل',
        description: `تم تحليل ${variables.symbol} بنجاح - الثقة: ${data?.confidence}%`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل التحليل',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to fetch confluence analysis
 */
export const useConfluence = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: ['ai-confluence', symbol, timeframe],
    queryFn: async (): Promise<AIConfluence | null> => {
      // Return null until AI confluence is implemented
      return null;
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};