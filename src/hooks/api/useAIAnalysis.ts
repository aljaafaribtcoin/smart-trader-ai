import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/api';
import { AIAnalysis, AIConfluence } from '@/types';
import { CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

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
    queryFn: async () => {
      // For now, use mock data
      return aiService.getMockAnalysis();
      
      // When API is ready:
      // const response = await aiService.analyzeSymbol(symbol, timeframe);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
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
      analysisType = 'confluence',
    }: {
      symbol: string;
      timeframe: string;
      analysisType?: string;
    }) => {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return mock data
      return aiService.getMockAnalysis();
      
      // When API is ready:
      // const response = await aiService.analyzeSymbol(symbol, timeframe, analysisType);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(
        ['ai-analysis', variables.symbol, variables.timeframe],
        data
      );
      
      toast({
        title: 'تم التحليل',
        description: `تم تحليل ${variables.symbol} بنجاح - درجة الثقة: ${data.confidenceScore}%`,
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
    queryFn: async () => {
      // For now, use mock data
      return aiService.getMockConfluence();
      
      // When API is ready:
      // const response = await aiService.getConfluence(symbol, timeframe);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};
