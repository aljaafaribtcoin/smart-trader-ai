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
      if (!user) throw new Error('المستخدم غير مسجل دخول');

      // Calculate quantity from position size and entry price
      const quantity = tradeData.positionSize / tradeData.entryPrice;
      
      // Calculate risk/reward
      const risk = Math.abs(tradeData.entryPrice - tradeData.stopLoss);
      const avgTarget = tradeData.takeProfits?.length > 0 
        ? tradeData.takeProfits.reduce((sum: number, tp: any) => sum + tp.price, 0) / tradeData.takeProfits.length
        : tradeData.entryPrice;
      const reward = Math.abs(avgTarget - tradeData.entryPrice);
      const riskReward = risk > 0 ? reward / risk : 0;

      // Insert the trade
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert([{
          user_id: user.id,
          symbol: tradeData.symbol,
          type: tradeData.type,
          entry_price: tradeData.entryPrice,
          stop_loss: tradeData.stopLoss,
          quantity: quantity,
          position_size: tradeData.positionSize,
          leverage: tradeData.leverage || 10,
          risk_reward: riskReward,
          notes: tradeData.notes || null,
          status: 'open',
        }])
        .select()
        .single();

      if (tradeError) throw tradeError;

      // Insert take profits if any
      if (tradeData.takeProfits && tradeData.takeProfits.length > 0 && trade) {
        const takeProfitsData = tradeData.takeProfits.map((tp: any, index: number) => ({
          trade_id: trade.id,
          level: index + 1,
          price: tp.price,
          percentage: tp.percentage,
          hit: false,
        }));

        const { error: tpError } = await supabase
          .from('take_profits')
          .insert(takeProfitsData);

        if (tpError) console.error('Error inserting take profits:', tpError);
      }

      return trade;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      
      toast({
        title: 'تم تنفيذ الصفقة',
        description: `تم فتح صفقة ${data.type === 'long' ? 'شراء' : 'بيع'} على ${data.symbol} عند ${data.entry_price}`,
      });

      // Create notification for trade execution
      try {
        await supabase.from('notifications').insert({
          user_id: data.user_id,
          title: `✅ تم تنفيذ صفقة ${data.type === 'long' ? 'شراء' : 'بيع'}`,
          message: `تم فتح صفقة ${data.type} على ${data.symbol} بسعر ${data.entry_price}`,
          type: 'trade',
          metadata: {
            trade_id: data.id,
            symbol: data.symbol,
            type: data.type,
            entry_price: data.entry_price,
            position_size: data.position_size,
          },
          action_url: `/trades`,
        });
      } catch (error) {
        console.error('Error creating trade notification:', error);
      }
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      
      const profitLoss = data.pnl || 0;
      const isProfit = profitLoss > 0;
      
      toast({
        title: 'تم إغلاق الصفقة',
        description: `${isProfit ? 'ربح' : 'خسارة'}: ${Math.abs(profitLoss).toFixed(2)} USDT (${data.pnl_percentage?.toFixed(2)}%)`,
        variant: isProfit ? 'default' : 'destructive',
      });

      // Create notification for trade closure
      try {
        await supabase.from('notifications').insert({
          user_id: data.user_id,
          title: `${isProfit ? '💰' : '📉'} إغلاق صفقة ${data.symbol}`,
          message: `تم إغلاق صفقة ${data.type} على ${data.symbol} ${isProfit ? 'بربح' : 'بخسارة'} ${Math.abs(profitLoss).toFixed(2)} USDT (${data.pnl_percentage?.toFixed(2)}%)`,
          type: isProfit ? 'success' : 'warning',
          metadata: {
            trade_id: data.id,
            symbol: data.symbol,
            pnl: profitLoss,
            pnl_percentage: data.pnl_percentage,
          },
          action_url: `/trades`,
        });
      } catch (error) {
        console.error('Error creating close trade notification:', error);
      }
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
