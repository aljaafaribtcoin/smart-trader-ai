import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Notification } from '@/types/notification';

/**
 * Hook للاستماع إلى التحديثات الفورية لبيانات السوق والإشعارات
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

    // الاستماع لتحديثات الأنماط
    const patternsChannel = supabase
      .channel('patterns-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patterns',
        },
        (payload) => {
          console.log('🎯 نمط جديد:', payload);
          
          // تحديث cache الأنماط
          queryClient.invalidateQueries({ queryKey: ['patterns'] });
          queryClient.invalidateQueries({ queryKey: ['active-patterns'] });
          
          // عرض toast notification
          const pattern = payload.new;
          toast.success('نمط جديد!', {
            description: `تم اكتشاف ${pattern.pattern_name} على ${pattern.symbol}`,
          });
        }
      )
      .subscribe();

    // الاستماع لتحديثات التوصيات
    const signalsChannel = supabase
      .channel('signals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trading_signals',
        },
        (payload) => {
          console.log('⚡ توصية جديدة:', payload);
          
          // تحديث cache التوصيات
          queryClient.invalidateQueries({ queryKey: ['trading-signals'] });
          
          // عرض toast notification
          const signal = payload.new;
          toast.success('توصية جديدة!', {
            description: `${signal.direction} على ${signal.symbol} - دخول: ${signal.entry_from}`,
          });
        }
      )
      .subscribe();

    // الاستماع للإشعارات الجديدة
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`,
        },
        (payload) => {
          console.log('🔔 إشعار جديد:', payload);
          
          // تحديث cache الإشعارات
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
          
          // عرض toast notification
          const notification = payload.new as Notification;
          toast.info(notification.title, {
            description: notification.message,
          });
          
          // تشغيل صوت الإشعار
          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {
              // Ignore audio play errors (browser restrictions)
            });
          } catch (error) {
            console.log('Could not play notification sound:', error);
          }
        }
      )
      .subscribe();

    // تنظيف عند unmount
    return () => {
      console.log('🔴 إيقاف الاستماع للتحديثات الفورية...');
      supabase.removeChannel(pricesChannel);
      supabase.removeChannel(candlesChannel);
      supabase.removeChannel(indicatorsChannel);
      supabase.removeChannel(patternsChannel);
      supabase.removeChannel(signalsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [queryClient]);
};
