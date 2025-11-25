import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TechnicalIndicator {
  symbol: string;
  timeframe: string;
  rsi?: number;
  macd_value?: number;
  macd_signal?: number;
  macd_histogram?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  ema_20?: number;
  ema_50?: number;
  ema_200?: number;
  atr?: number;
  stochastic_k?: number;
  stochastic_d?: number;
  calculated_at: string;
}

export const useTechnicalIndicators = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: ['technical-indicators', symbol, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technical_indicators')
        .select('*')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TechnicalIndicator | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchInterval: false,    // Disable auto-refetch, rely on scheduler
  });
};

export const useCalculateIndicators = () => {
  return async (symbol: string, timeframe: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-technical-indicators', {
        body: { symbol, timeframe }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to calculate indicators:', error);
      throw error;
    }
  };
};
