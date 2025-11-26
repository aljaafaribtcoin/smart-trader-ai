import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivePattern {
  pattern_id: string;
  symbol: string;
  timeframe: string;
  pattern_name: string;
  pattern_type: string;
  detected_at: string;
  pattern_confidence: number;
  pattern_target: number | null;
  pattern_stop_loss: number | null;
  current_price: number | null;
  signal_id: string | null;
  direction: string | null;
  entry_from: number | null;
  entry_to: number | null;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  signal_stop_loss: number | null;
  signal_confidence: number | null;
  risk_reward: number | null;
  main_scenario: string | null;
  signal_created_at: string | null;
}

export const useActivePatterns = () => {
  return useQuery({
    queryKey: ['active-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_patterns_with_signals')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ActivePattern[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
