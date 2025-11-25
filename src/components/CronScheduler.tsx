import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, Clock, TrendingUp, Activity, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const tasks = [
  {
    id: 'sync-prices',
    name: 'تحديث الأسعار',
    description: 'كل دقيقة',
    icon: TrendingUp,
    interval: '* * * * *',
    color: 'text-blue-500'
  },
  {
    id: 'fetch-candles',
    name: 'جلب الشموع',
    description: 'كل 3 دقائق',
    icon: Activity,
    interval: '*/3 * * * *',
    color: 'text-green-500'
  },
  {
    id: 'calculate-indicators',
    name: 'حساب المؤشرات',
    description: 'كل 5 دقائق',
    icon: Zap,
    interval: '*/5 * * * *',
    color: 'text-yellow-500'
  },
  {
    id: 'detect-patterns',
    name: 'كشف الأنماط',
    description: 'كل 15 دقيقة',
    icon: RefreshCw,
    interval: '*/15 * * * *',
    color: 'text-purple-500'
  },
  {
    id: 'generate-signals',
    name: 'توليد التوصيات',
    description: 'كل ساعة',
    icon: Clock,
    interval: '0 * * * *',
    color: 'text-orange-500'
  }
];

export const CronScheduler = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const runTask = async (taskId: string) => {
    setLoading(taskId);
    try {
      const { data, error } = await supabase.functions.invoke('scheduler-orchestrator', {
        body: { task: taskId }
      });

      if (error) throw error;

      toast.success(`تم تشغيل المهمة: ${tasks.find(t => t.id === taskId)?.name}`);
      console.log('Task result:', data);
    } catch (error: any) {
      console.error('Task error:', error);
      toast.error(`فشل تشغيل المهمة: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const runAllTasks = async () => {
    setLoading('all');
    try {
      const { data, error } = await supabase.functions.invoke('scheduler-orchestrator', {
        body: {}
      });

      if (error) throw error;

      toast.success('تم تشغيل جميع المهام بنجاح');
      console.log('All tasks result:', data);
    } catch (error: any) {
      console.error('All tasks error:', error);
      toast.error(`فشل تشغيل المهام: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          جدولة المهام التلقائية
        </CardTitle>
        <CardDescription>
          نظام تشغيل المهام بشكل دوري لتحديث البيانات تلقائياً
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">تشغيل جميع المهام</p>
            <p className="text-sm text-muted-foreground">تنفيذ كل المهام دفعة واحدة</p>
          </div>
          <Button 
            onClick={runAllTasks}
            disabled={loading !== null}
            size="lg"
          >
            {loading === 'all' ? (
              <>
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                جاري التشغيل...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-2" />
                تشغيل الكل
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-3">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <div 
                key={task.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${task.color}`} />
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.description}
                      </Badge>
                      <code className="text-xs text-muted-foreground">{task.interval}</code>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => runTask(task.id)}
                  disabled={loading !== null}
                  variant="outline"
                  size="sm"
                >
                  {loading === task.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            إعداد التشغيل التلقائي
          </h4>
          <p className="text-sm text-muted-foreground">
            لتفعيل التشغيل التلقائي، استخدم خدمة مجانية مثل:
          </p>
          <ul className="text-sm space-y-1 mr-4">
            <li>• <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cron-job.org</a> - مجاني 100%</li>
            <li>• <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">uptimerobot.com</a> - لمراقبة التشغيل</li>
          </ul>
          <div className="mt-3 p-3 bg-background rounded border">
            <p className="text-xs font-mono break-all">
              {`https://eyxqdgosabtgizwsrsiq.supabase.co/functions/v1/scheduler-orchestrator`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};