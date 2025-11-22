import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/services/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../useAuth';

/**
 * Hook to fetch trades from Supabase
 */
export const useTrades = (status?: 'open' | 'closed') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['trades', user?.id, status],
    queryFn: async () => {
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
    enabled: !!user,
  });
};

/**
 * Hook to execute a new trade
 */
export const useExecuteTrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tradeData: any) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trades')
        .insert([{
          user_id: user.id,
          symbol: tradeData.symbol || '',
          type: tradeData.type || 'long',
          entry_price: tradeData.entryPrice || 0,
          stop_loss: tradeData.stopLoss || 0,
          quantity: tradeData.quantity || 0,
          position_size: tradeData.positionSize || 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      
      toast({
        title: 'تم تنفيذ الصفقة',
        description: `تم فتح الصفقة بنجاح عند سعر ${data.entry_price}`,
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
  const { toast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      
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
