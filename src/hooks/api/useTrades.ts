import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeService } from '@/services/api';
import { Trade, TradeExecution } from '@/types';
import { CACHE_KEYS, CACHE_TIMES } from '@/services/constants';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch all trades
 */
export const useTrades = (
  userId: string,
  status?: 'open' | 'closed',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [CACHE_KEYS.TRADES, userId, status],
    queryFn: async () => {
      // For now, use mock data
      const allTrades = tradeService.getMockTrades();
      return status ? allTrades.filter(trade => trade.status === status) : allTrades;
      
      // When API is ready:
      // const response = await tradeService.getTrades(userId, status);
      // if (response.error) throw new Error(response.error.message);
      // return response.data?.data || [];
    },
    staleTime: CACHE_TIMES.SHORT,
    enabled,
  });
};

/**
 * Hook to fetch open trades
 */
export const useOpenTrades = (userId: string) => {
  return useQuery({
    queryKey: ['trades-open', userId],
    queryFn: async () => {
      const allTrades = tradeService.getMockTrades();
      return allTrades.filter(trade => trade.status === 'open');
    },
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: 5000, // Refetch every 5 seconds for open trades
  });
};

/**
 * Hook to fetch closed trades
 */
export const useClosedTrades = (userId: string) => {
  return useQuery({
    queryKey: ['trades-closed', userId],
    queryFn: async () => {
      const allTrades = tradeService.getMockTrades();
      return allTrades.filter(trade => trade.status === 'closed');
    },
    staleTime: CACHE_TIMES.LONG,
  });
};

/**
 * Hook to execute a new trade
 */
export const useExecuteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tradeData: Partial<Trade>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      return {
        tradeId: `trade-${Date.now()}`,
        executionPrice: tradeData.entryPrice || 0,
        executionTime: new Date(),
        slippage: 0.02,
        fees: 5.25,
        success: true,
      } as TradeExecution;
      
      // When API is ready:
      // const response = await tradeService.executeTrade(tradeData);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    onSuccess: (data) => {
      // Invalidate trades queries
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.TRADES] });
      queryClient.invalidateQueries({ queryKey: ['trades-open'] });
      
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
      const response = await tradeService.closeTrade(tradeId, exitPrice);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.TRADES] });
      queryClient.invalidateQueries({ queryKey: ['trades-open'] });
      queryClient.invalidateQueries({ queryKey: ['trades-closed'] });
      
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
