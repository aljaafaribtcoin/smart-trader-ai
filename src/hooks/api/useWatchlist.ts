import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/services/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../useAuth';

/**
 * Hook to fetch watchlist from Supabase
 */
export const useWatchlist = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async () => {
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
    enabled: !!user,
  });
};

/**
 * Hook to add symbol to watchlist
 */
export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      symbol,
      timeframe,
    }: {
      symbol: string;
      timeframe: string;
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (watchlistId: string) => {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      
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
