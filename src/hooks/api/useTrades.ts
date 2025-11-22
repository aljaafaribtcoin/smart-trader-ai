import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trade, TradeExecution } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch all trades from Supabase
 */
export const useTrades = (
  userId: string,
  status?: 'open' | 'closed',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [CACHE_KEYS.TRADES, userId, status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.SHORT,
    enabled,
  });
};

/**
 * Hook to fetch open trades
 */
export const useOpenTrades = (userId: string) => {
  return useTrades(userId, 'open', true);
};

/**
 * Hook to fetch closed trades
 */
export const useClosedTrades = (userId: string) => {
  return useTrades(userId, 'closed', true);
};

/**
 * Hook to execute a new trade
 */
export const useExecuteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tradeData: Partial<Trade>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          ...tradeData
        })
        .select()
        .single();

      if (error) throw error;

      return {
        tradeId: data.id,
        executionPrice: data.entry_price,
        executionTime: new Date(data.entry_time),
        slippage: 0.02,
        fees: data.fees,
        success: true,
      } as TradeExecution;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.TRADES] });
      
      toast({
        title: 'تم تنفيذ الصفقة',
        description: `تم فتح الصفقة بنجاح عند سعر ${data.executionPrice}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل تنفيذ الصفقة',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to close a trade
 */
export const useCloseTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tradeId, exitPrice }: { tradeId: string; exitPrice: number }) => {
      const { data, error } = await supabase
        .from('trades')
        .update({
          status: 'closed',
          exit_price: exitPrice,
          exit_time: new Date().toISOString()
        })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.TRADES] });
      
      toast({
        title: 'تم إغلاق الصفقة',
        description: 'تم إغلاق الصفقة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل إغلاق الصفقة',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};