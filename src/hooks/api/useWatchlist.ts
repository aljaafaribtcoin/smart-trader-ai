import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketService } from '@/services/api';
import { WatchlistItem } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch watchlist
 */
export const useWatchlist = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [CACHE_KEYS.WATCHLIST, userId],
    queryFn: async () => {
      // For now, use mock data
      return marketService.getMockWatchlist();
      
      // When API is ready:
      // const response = await marketService.getWatchlist(userId);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
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
      const response = await marketService.addToWatchlist(userId, symbol, timeframe);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate watchlist query to refetch
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.WATCHLIST, variables.userId] });
      
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
      const response = await marketService.removeFromWatchlist(watchlistId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (_, watchlistId) => {
      // Invalidate watchlist query to refetch
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
