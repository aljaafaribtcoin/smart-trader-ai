import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook للتحديثات التلقائية لبيانات السوق
 * يقوم بجلب البيانات كل 30 ثانية من LiveCoinWatch
 */
export const useAutoRefreshMarketData = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef(false);
  const updateCountRef = useRef(0);

  const refreshData = async () => {
    if (isRefreshing.current) {
      console.log('⏭️ تخطي التحديث، جلب بيانات جاري بالفعل...');
      return;
    }

    try {
      isRefreshing.current = true;
      updateCountRef.current += 1;
      
      console.log(`🔄 تحديث #${updateCountRef.current} - جلب بيانات جديدة من LiveCoinWatch...`);

      const { data, error } = await supabase.functions.invoke('initialize-market-data', {
        body: {},
      });

      if (error) {
        console.error('❌ خطأ في تحديث البيانات:', error);
        toast.error('فشل تحديث البيانات', {
          description: 'سيتم المحاولة مرة أخرى قريباً',
        });
        return;
      }

      if (data?.success) {
        console.log(`✅ تحديث #${updateCountRef.current} نجح:`, data);
        
        // إشعار خفيف فقط كل 5 تحديثات
        if (updateCountRef.current % 5 === 0) {
          toast.success('تم تحديث البيانات', {
            description: `${data.results?.prices || 0} عملة محدثة`,
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error('❌ خطأ في refresh:', error);
    } finally {
      isRefreshing.current = false;
    }
  };

  useEffect(() => {
    // تحديث فوري عند التحميل الأول
    refreshData();

    // إعداد التحديث التلقائي كل 30 ثانية
    intervalRef.current = setInterval(refreshData, 30000);

    toast.success('تم تفعيل التحديثات التلقائية', {
      description: 'سيتم تحديث البيانات كل 30 ثانية',
      duration: 3000,
    });

    // تنظيف عند unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // إرجاع دالة للتحديث اليدوي
  return { refreshData };
};
