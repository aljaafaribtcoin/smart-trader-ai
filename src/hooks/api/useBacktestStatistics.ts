import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BacktestStatistics {
  strategy_type: string;
  symbol: string;
  timeframe: string;
  total_runs: number;
  total_trades_all_runs: number;
  avg_win_rate: number;
  avg_return: number;
  best_return: number;
  worst_return: number;
  avg_profit_factor: number;
  avg_max_drawdown: number;
}

export const useBacktestStatistics = () => {
  return useQuery({
    queryKey: ['backtest-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backtest_statistics')
        .select('*')
        .order('avg_return', { ascending: false });

      if (error) throw error;
      return data as BacktestStatistics[];
    },
  });
};

export interface BacktestFilters {
  startDate?: Date;
  endDate?: Date;
  strategy?: string;
  symbol?: string;
  timeframe?: string;
}

export const useBacktestOverview = (filters?: BacktestFilters) => {
  return useQuery({
    queryKey: ['backtest-overview', filters],
    queryFn: async () => {
      let query = supabase
        .from('backtesting_runs')
        .select('*')
        .eq('status', 'completed');

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters?.strategy) {
        query = query.eq('strategy_type', filters.strategy);
      }
      if (filters?.symbol) {
        query = query.eq('symbol', filters.symbol);
      }
      if (filters?.timeframe) {
        query = query.eq('timeframe', filters.timeframe);
      }

      const { data: runs, error } = await query;

      if (error) throw error;

      const totalRuns = runs.length;
      const totalTrades = runs.reduce((sum, run) => sum + (run.total_trades || 0), 0);
      const avgWinRate = runs.length > 0 
        ? runs.reduce((sum, run) => sum + (run.win_rate || 0), 0) / runs.length 
        : 0;
      const totalReturn = runs.reduce((sum, run) => sum + (run.net_profit_percentage || 0), 0);
      const avgProfitFactor = runs.length > 0
        ? runs.reduce((sum, run) => sum + (run.profit_factor || 0), 0) / runs.length
        : 0;
      const profitableRuns = runs.filter(run => (run.net_profit || 0) > 0).length;

      return {
        totalRuns,
        totalTrades,
        avgWinRate: Math.round(avgWinRate * 100) / 100,
        totalReturn: Math.round(totalReturn * 100) / 100,
        avgProfitFactor: Math.round(avgProfitFactor * 100) / 100,
        profitableRuns,
        profitableRate: totalRuns > 0 ? Math.round((profitableRuns / totalRuns) * 100) : 0,
      };
    },
  });
};
