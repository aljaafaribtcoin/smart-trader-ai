import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BacktestRun } from '@/hooks/api/useBacktesting';
import { cn } from '@/lib/utils';

interface BacktestResultsProps {
  run: BacktestRun;
}

export const BacktestResults = ({ run }: BacktestResultsProps) => {
  const isProfit = run.net_profit > 0;

  const metrics = [
    {
      label: 'إجمالي الصفقات',
      value: run.total_trades,
      icon: Activity,
      color: 'text-primary',
    },
    {
      label: 'معدل النجاح',
      value: `${run.win_rate}%`,
      icon: Target,
      color: run.win_rate >= 50 ? 'text-success' : 'text-warning',
    },
    {
      label: 'صافي الربح',
      value: `$${run.net_profit.toFixed(2)}`,
      icon: DollarSign,
      color: isProfit ? 'text-success' : 'text-destructive',
    },
    {
      label: 'العائد %',
      value: `${run.net_profit_percentage.toFixed(2)}%`,
      icon: Percent,
      color: isProfit ? 'text-success' : 'text-destructive',
    },
    {
      label: 'صفقات رابحة',
      value: run.winning_trades,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      label: 'صفقات خاسرة',
      value: run.losing_trades,
      icon: TrendingDown,
      color: 'text-destructive',
    },
  ];

  const detailedMetrics = [
    { label: 'متوسط الربح', value: `$${run.average_profit.toFixed(2)}` },
    { label: 'متوسط الخسارة', value: `$${run.average_loss.toFixed(2)}` },
    { label: 'أكبر ربح', value: `$${run.largest_profit.toFixed(2)}` },
    { label: 'أكبر خسارة', value: `$${run.largest_loss.toFixed(2)}` },
    { label: 'Profit Factor', value: run.profit_factor.toFixed(2) },
    { label: 'Max Drawdown', value: `${run.max_drawdown_percentage.toFixed(2)}%` },
    { label: 'Sharpe Ratio', value: run.sharpe_ratio.toFixed(2) },
    { label: 'وقت التنفيذ', value: `${(run.execution_time_ms / 1000).toFixed(1)}s` },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={cn('h-4 w-4', metric.color)} />
              </div>
              <div className="space-y-1">
                <p className={cn('text-2xl font-bold', metric.color)}>{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>مقاييس مفصلة</CardTitle>
          <CardDescription>تحليل شامل لأداء الاستراتيجية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {detailedMetrics.map((metric, index) => (
              <div key={index} className="space-y-1 p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الأداء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>معدل النجاح</span>
              <Badge variant={run.win_rate >= 50 ? 'default' : 'secondary'}>
                {run.win_rate}%
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  run.win_rate >= 50 ? 'bg-success' : 'bg-warning'
                )}
                style={{ width: `${run.win_rate}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>العائد على الاستثمار</span>
              <Badge variant={isProfit ? 'default' : 'destructive'}>
                {run.net_profit_percentage.toFixed(2)}%
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  isProfit ? 'bg-success' : 'bg-destructive'
                )}
                style={{
                  width: `${Math.min(Math.abs(run.net_profit_percentage), 100)}%`,
                }}
              />
            </div>
          </div>

          {run.profit_factor > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Profit Factor</span>
                <Badge variant={run.profit_factor >= 1.5 ? 'default' : 'secondary'}>
                  {run.profit_factor.toFixed(2)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {run.profit_factor >= 2
                  ? 'ممتاز - الأرباح ضعف الخسائر'
                  : run.profit_factor >= 1.5
                  ? 'جيد - استراتيجية مربحة'
                  : run.profit_factor >= 1
                  ? 'متوسط - ربحية محدودة'
                  : 'ضعيف - الخسائر أكبر من الأرباح'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
