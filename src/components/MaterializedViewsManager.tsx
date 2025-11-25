import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const views = [
  {
    id: 'latest_market_data',
    name: 'أحدث بيانات السوق',
    description: 'الشموع مع المؤشرات الفنية للأيام السبعة الأخيرة',
    refreshInterval: '5 دقائق'
  },
  {
    id: 'active_patterns_with_signals',
    name: 'الأنماط النشطة والتوصيات',
    description: 'جميع الأنماط المكتشفة مع التوصيات المرتبطة',
    refreshInterval: '10 دقائق'
  },
  {
    id: 'market_summary',
    name: 'ملخص السوق',
    description: 'ملخص شامل لكل رمز مع الإحصائيات الرئيسية',
    refreshInterval: '15 دقيقة'
  }
];

export const MaterializedViewsManager = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<Record<string, boolean>>({});

  const refreshView = async (viewId: string) => {
    setLoading(viewId);
    try {
      const { error } = await supabase.rpc('refresh_materialized_views');

      if (error) throw error;

      setRefreshStatus((prev) => ({ ...prev, [viewId]: true }));
      toast.success(`تم تحديث ${views.find(v => v.id === viewId)?.name}`);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setRefreshStatus((prev) => ({ ...prev, [viewId]: false }));
      }, 3000);
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast.error(`فشل التحديث: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const refreshAllViews = async () => {
    setLoading('all');
    try {
      const { error } = await supabase.rpc('refresh_materialized_views');

      if (error) throw error;

      const newStatus: Record<string, boolean> = {};
      views.forEach(v => newStatus[v.id] = true);
      setRefreshStatus(newStatus);
      
      toast.success('تم تحديث جميع الـ Views بنجاح');
      
      setTimeout(() => {
        setRefreshStatus({});
      }, 3000);
    } catch (error: any) {
      console.error('Refresh all error:', error);
      toast.error(`فشل التحديث الشامل: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          إدارة Materialized Views
        </CardTitle>
        <CardDescription>
          تحديث البيانات المخزنة مسبقاً لتحسين الأداء
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">تحديث جميع الـ Views</p>
            <p className="text-sm text-muted-foreground">
              تحديث شامل لجميع البيانات المخزنة
            </p>
          </div>
          <Button 
            onClick={refreshAllViews}
            disabled={loading !== null}
            size="lg"
          >
            {loading === 'all' ? (
              <>
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث الكل
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-3">
          {views.map((view) => (
            <div 
              key={view.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Database className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{view.name}</p>
                    {refreshStatus[view.id] && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{view.description}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    تحديث: {view.refreshInterval}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => refreshView(view.id)}
                disabled={loading !== null}
                variant="outline"
                size="sm"
              >
                {loading === view.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            ملاحظة هامة
          </h4>
          <p className="text-sm text-muted-foreground">
            يتم تحديث الـ Views تلقائياً عند تشغيل المهام المجدولة. 
            استخدم التحديث اليدوي فقط عند الحاجة لبيانات فورية.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};