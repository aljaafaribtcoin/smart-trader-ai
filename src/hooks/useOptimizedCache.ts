import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook لتحسين التخزين المؤقت وإدارة البيانات المسبقة
 */
export const useOptimizedCache = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // إعداد التخزين المؤقت العام
    queryClient.setDefaultOptions({
      queries: {
        // زيادة وقت صلاحية البيانات
        staleTime: 5 * 60 * 1000, // 5 دقائق
        gcTime: 10 * 60 * 1000, // 10 دقائق (كان cacheTime)
        
        // تحسين إعادة التحميل
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
        
        // إعادة المحاولة عند الفشل
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    });
  }, [queryClient]);

  // Prefetch للبيانات الشائعة
  const prefetchCommonData = async (symbol: string) => {
    const timeframes = ['15m', '1h', '4h', '1d'];
    
    // Prefetch المؤشرات الفنية
    timeframes.forEach((timeframe) => {
      queryClient.prefetchQuery({
        queryKey: ['technical-indicators', symbol, timeframe],
        staleTime: 5 * 60 * 1000,
      });
    });

    // Prefetch الأنماط
    queryClient.prefetchQuery({
      queryKey: ['patterns', symbol],
      staleTime: 10 * 60 * 1000,
    });

    // Prefetch التوصيات
    queryClient.prefetchQuery({
      queryKey: ['trading-signals', symbol],
      staleTime: 15 * 60 * 1000,
    });
  };

  // إبطال البيانات القديمة
  const invalidateStaleData = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const staleTime = query.state.dataUpdatedAt;
        const now = Date.now();
        // إبطال البيانات الأقدم من 15 دقيقة
        return now - staleTime > 15 * 60 * 1000;
      },
    });
  };

  // تحديث البيانات بشكل optimistic
  const updateOptimistically = <T,>(
    queryKey: string[],
    updater: (old: T | undefined) => T
  ) => {
    queryClient.setQueryData<T>(queryKey, updater);
  };

  return {
    prefetchCommonData,
    invalidateStaleData,
    updateOptimistically,
    queryClient,
  };
};