import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WatchlistItem } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch watchlist from Supabase
 */
export const useWatchlist = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [CACHE_KEYS.WATCHLIST, userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled,
  });
};

/**
 * Hook to add symbol to watchlist
 */
export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      symbol,
      timeframe,
    }: {
      userId: string;
      symbol: string;
      timeframe: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol,
          timeframe
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.WATCHLIST] });
      
      toast({
        title: 'تمت الإضافة',
        description: `تم إضافة ${variables.symbol} إلى قائمة المراقبة`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to remove symbol from watchlist
 */
export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (watchlistId: string) => {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.WATCHLIST] });
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف العملة من قائمة المراقبة',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};