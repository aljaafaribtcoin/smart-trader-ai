import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Database, Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const PerformanceMonitor = () => {
  const queryClient = useQueryClient();
  
  const cacheStats = useMemo(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const total = queries.length;
    const stale = queries.filter(q => q.isStale()).length;
    const fresh = total - stale;
    const inactive = queries.filter(q => !q.getObserversCount()).length;
    
    return { total, fresh, stale, inactive };
  }, [queryClient]);

  const getHealthStatus = () => {
    const { fresh, total } = cacheStats;
    const freshRatio = total > 0 ? (fresh / total) * 100 : 0;
    
    if (freshRatio >= 80) return { label: 'ممتاز', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (freshRatio >= 60) return { label: 'جيد', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (freshRatio >= 40) return { label: 'متوسط', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'ضعيف', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const healthStatus = getHealthStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          مراقبة الأداء
        </CardTitle>
        <CardDescription>
          حالة التخزين المؤقت والأداء العام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Status */}
        <div className={`p-4 rounded-lg ${healthStatus.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${healthStatus.color}`} />
              <span className="font-medium">حالة النظام</span>
            </div>
            <Badge variant="outline" className={healthStatus.color}>
              {healthStatus.label}
            </Badge>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">إجمالي الكاش</span>
            </div>
            <p className="text-2xl font-bold">{cacheStats.total}</p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">بيانات حديثة</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{cacheStats.fresh}</p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">بيانات قديمة</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{cacheStats.stale}</p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-muted-foreground">غير نشط</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{cacheStats.inactive}</p>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">نصائح لتحسين الأداء:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• البيانات الحديثة ({cacheStats.fresh}) لا تحتاج إعادة تحميل</li>
            <li>• استخدم Prefetching للصفحات المتوقع زيارتها</li>
            <li>• نظف الكاش غير النشط ({cacheStats.inactive}) دورياً</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};