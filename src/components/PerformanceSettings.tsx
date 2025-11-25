import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, RefreshCw, Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const PerformanceSettings = () => {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    queryClient.clear();
    toast.success('تم مسح جميع البيانات المخزنة مؤقتاً');
  };

  const clearStaleCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.isStale(),
    });
    toast.success('تم مسح البيانات القديمة');
  };

  const refreshAllQueries = () => {
    queryClient.refetchQueries();
    toast.success('جاري تحديث جميع البيانات...');
  };

  const removeInactiveQueries = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach((query) => {
      if (!query.getObserversCount()) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    toast.success('تم حذف الاستعلامات غير النشطة');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          إعدادات الأداء
        </CardTitle>
        <CardDescription>
          أدوات لإدارة وتحسين أداء التطبيق
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {/* Clear All Cache */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4 text-red-500" />
                <p className="font-medium">مسح الكاش بالكامل</p>
              </div>
              <p className="text-sm text-muted-foreground">
                حذف جميع البيانات المخزنة مؤقتاً (يفضل عند المشاكل فقط)
              </p>
            </div>
            <Button
              onClick={clearAllCache}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Clear Stale Cache */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-yellow-500" />
                <p className="font-medium">مسح البيانات القديمة</p>
              </div>
              <p className="text-sm text-muted-foreground">
                حذف البيانات منتهية الصلاحية فقط
              </p>
            </div>
            <Button
              onClick={clearStaleCache}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Refresh All */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <p className="font-medium">تحديث جميع البيانات</p>
              </div>
              <p className="text-sm text-muted-foreground">
                إعادة تحميل كل البيانات النشطة
              </p>
            </div>
            <Button
              onClick={refreshAllQueries}
              variant="outline"
              size="sm"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>

          {/* Remove Inactive */}
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4 text-gray-500" />
                <p className="font-medium">حذف الاستعلامات غير النشطة</p>
              </div>
              <p className="text-sm text-muted-foreground">
                تحرير الذاكرة بحذف البيانات غير المستخدمة
              </p>
            </div>
            <Button
              onClick={removeInactiveQueries}
              variant="outline"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2 mt-4">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            نصائح الأداء
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• استخدم "مسح البيانات القديمة" بانتظام لتحسين الأداء</li>
            <li>• "مسح الكاش بالكامل" فقط عند وجود مشاكل</li>
            <li>• تحديث البيانات يتم تلقائياً عبر الـ Scheduler</li>
            <li>• البيانات المخزنة تقلل استهلاك الإنترنت</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};