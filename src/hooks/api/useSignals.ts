import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TradingSignal {
  id: string;
  symbol: string;
  direction: string;
  entry_from: number;
  entry_to: number;
  stop_loss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  confidence: number | null;
  risk_reward: number;
  main_scenario: string;
  alternative_scenario: string | null;
  supporting_factors: any;
  status: string;
  tags: string[] | null;
  telegram_summary: string | null;
  invalidation_price: number | null;
  created_at: string;
  user_id: string | null;
}

export const useSignals = (status?: string) => {
  return useQuery({
    queryKey: ['trading-signals', status],
    queryFn: async () => {
      let query = supabase
        .from('trading_signals')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TradingSignal[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveSignals = () => {
  return useSignals('active');
};
