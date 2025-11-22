import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Account, AccountStats } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';

/**
 * Hook to fetch account data from Supabase
 */
export const useAccount = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [CACHE_KEYS.ACCOUNT, userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create default account if none exists
        const { data: newAccount, error: insertError } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newAccount;
      }

      return data;
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};

/**
 * Hook to fetch account statistics from Supabase
 */
export const useAccountStats = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['account-stats', userId],
    queryFn: async (): Promise<AccountStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalProfit: 0,
          totalLoss: 0,
          netProfit: 0,
          averageWin: 0,
          averageLoss: 0,
          profitFactor: 0,
          maxDrawdown: 0,
        };
      }

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'closed');

      if (error) throw error;

      const totalTrades = trades?.length || 0;
      const winningTrades = trades?.filter(t => (t.pnl || 0) > 0).length || 0;
      const losingTrades = trades?.filter(t => (t.pnl || 0) < 0).length || 0;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      
      const totalProfit = trades?.reduce((sum, t) => sum + (t.pnl && t.pnl > 0 ? t.pnl : 0), 0) || 0;
      const totalLoss = trades?.reduce((sum, t) => sum + (t.pnl && t.pnl < 0 ? t.pnl : 0), 0) || 0;
      const netProfit = totalProfit + totalLoss;
      
      const averageWin = winningTrades > 0 ? totalProfit / winningTrades : 0;
      const averageLoss = losingTrades > 0 ? Math.abs(totalLoss) / losingTrades : 0;
      const profitFactor = totalLoss !== 0 ? totalProfit / Math.abs(totalLoss) : 0;

      return {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        totalProfit,
        totalLoss,
        netProfit,
        averageWin,
        averageLoss,
        profitFactor,
        maxDrawdown: 0,
      };
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};