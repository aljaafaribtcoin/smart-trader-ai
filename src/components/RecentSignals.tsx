import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wand2, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const RecentSignals = () => {
  const navigate = useNavigate();

  const { data: signals, isLoading } = useQuery({
    queryKey: ['recent-trading-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_signals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <LoadingSkeleton className="h-64" />;
  }

  return (
    <Card className="p-4 flex-1 flex flex-col gap-3 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          التوصيات الذكية
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => navigate('/signals')}
        >
          عرض الكل
        </Button>
      </div>

      {!signals || signals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">لم يتم توليد توصيات بعد</p>
          <p className="text-[10px] mt-1">استخدم مولد التوصيات الذكي</p>
        </div>
      ) : (
        <div className="space-y-2">
          {signals.map((signal) => {
            const isLong = signal.direction.toLowerCase() === 'long';
            return (
              <div
                key={signal.id}
                className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate('/signals')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={isLong ? 'default' : 'destructive'}
                        className="text-[10px] font-bold"
                      >
                        {signal.direction}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {signal.symbol}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium line-clamp-1">{signal.main_scenario}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(signal.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-background rounded p-2">
                    <span className="text-muted-foreground block mb-1">دخول</span>
                    <span className="font-medium">
                      {signal.entry_from.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-background rounded p-2">
                    <span className="text-muted-foreground block mb-1">هدف</span>
                    <span className="font-medium text-success">{signal.tp1.toFixed(2)}</span>
                  </div>
                  <div className="bg-background rounded p-2">
                    <span className="text-muted-foreground block mb-1">R:R</span>
                    <span className="font-medium text-primary">
                      1:{signal.risk_reward.toFixed(1)}
                    </span>
                  </div>
                </div>

                {signal.confidence && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">درجة الثقة:</span>
                    <span
                      className={`font-semibold ${
                        signal.confidence >= 80
                          ? 'text-success'
                          : signal.confidence >= 60
                          ? 'text-warning'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {signal.confidence}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2 gap-2"
        onClick={() => navigate('/signals')}
      >
        عرض جميع التوصيات
        <ArrowRight className="h-3 w-3" />
      </Button>
    </Card>
  );
};

export default RecentSignals;
