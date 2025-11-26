import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BacktestRun {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  strategy_type: string;
  status: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  total_loss: number;
  net_profit: number;
  net_profit_percentage: number;
  average_profit: number;
  average_loss: number;
  largest_profit: number;
  largest_loss: number;
  profit_factor: number;
  max_drawdown: number;
  max_drawdown_percentage: number;
  sharpe_ratio: number;
  initial_capital: number;
  risk_per_trade: number;
  max_trades_per_day: number;
  execution_time_ms: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface BacktestTrade {
  id: string;
  run_id: string;
  symbol: string;
  direction: string;
  entry_time: string;
  entry_price: number;
  exit_time: string | null;
  exit_price: number | null;
  stop_loss: number;
  take_profit_1: number | null;
  take_profit_2: number | null;
  take_profit_3: number | null;
  position_size: number;
  risk_amount: number;
  status: string;
  exit_reason: string | null;
  profit_loss: number;
  profit_loss_percentage: number;
  signal_id: string | null;
  pattern_id: string | null;
  confidence: number | null;
  created_at: string;
}

export interface BacktestConfig {
  name: string;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  strategy_type: 'signals' | 'patterns' | 'indicators';
  initial_capital: number;
  risk_per_trade: number;
  max_trades_per_day: number;
}

export const useBacktestRuns = () => {
  return useQuery({
    queryKey: ['backtest-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backtesting_runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BacktestRun[];
    },
  });
};

export const useBacktestRun = (runId: string) => {
  return useQuery({
    queryKey: ['backtest-run', runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backtesting_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error) throw error;
      return data as BacktestRun;
    },
    enabled: !!runId,
  });
};

export const useBacktestTrades = (runId: string) => {
  return useQuery({
    queryKey: ['backtest-trades', runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backtest_trades')
        .select('*')
        .eq('run_id', runId)
        .order('entry_time', { ascending: true });

      if (error) throw error;
      return data as BacktestTrade[];
    },
    enabled: !!runId,
  });
};

export const useRunBacktest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: BacktestConfig) => {
      toast.info('بدء Backtesting...', {
        description: 'قد يستغرق هذا بعض الوقت',
      });

      const { data, error } = await supabase.functions.invoke('run-backtest', {
        body: config,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backtest-runs'] });
      toast.success('اكتمل Backtesting!', {
        description: `تم تنفيذ ${data.metrics.total_trades} صفقة`,
      });
    },
    onError: (error) => {
      toast.error('فشل Backtesting', {
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      });
    },
  });
};

export const useDeleteBacktestRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('backtesting_runs')
        .delete()
        .eq('id', runId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtest-runs'] });
      toast.success('تم حذف Backtest');
    },
  });
};
