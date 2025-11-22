import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook للاستماع إلى التحديثات الفورية لبيانات السوق
 * يستخدم Supabase Realtime للحصول على تحديثات فورية
 */
export const useRealtimeMarketData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('📡 تفعيل الاستماع للتحديثات الفورية...');

    // الاستماع لتحديثات الأسعار
    const pricesChannel = supabase
      .channel('market-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_prices',
        },
        (payload) => {
          console.log('💰 تحديث السعر:', payload);
          
          // تحديث cache الخاص بـ React Query
          queryClient.invalidateQueries({ queryKey: ['market-data'] });
          queryClient.invalidateQueries({ queryKey: ['trend-analysis'] });
          queryClient.invalidateQueries({ queryKey: ['volume-analysis'] });
        }
      )
      .subscribe();

    // الاستماع لتحديثات الشموع
    const candlesChannel = supabase
      .channel('market-candles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_candles',
        },
        (payload) => {
          console.log('📊 تحديث الشموع:', payload);
          
          // تحديث cache الخاص بالشموع
          queryClient.invalidateQueries({ queryKey: ['candles'] });
        }
      )
      .subscribe();

    // الاستماع لتحديثات المؤشرات الفنية
    const indicatorsChannel = supabase
      .channel('technical-indicators-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'technical_indicators',
        },
        (payload) => {
          console.log('📈 تحديث المؤشرات:', payload);
          
          // تحديث cache الخاص بالمؤشرات
          queryClient.invalidateQueries({ queryKey: ['momentum-indicators'] });
        }
      )
      .subscribe();

    // تنظيف عند unmount
    return () => {
      console.log('🔴 إيقاف الاستماع للتحديثات الفورية...');
      supabase.removeChannel(pricesChannel);
      supabase.removeChannel(candlesChannel);
      supabase.removeChannel(indicatorsChannel);
    };
  }, [queryClient]);
};
