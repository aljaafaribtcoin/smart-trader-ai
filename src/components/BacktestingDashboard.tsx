import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestTube, Trash2, Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BacktestRunner } from './BacktestRunner';
import { BacktestResults } from './BacktestResults';
import { useBacktestRuns, useBacktestRun, useDeleteBacktestRun } from '@/hooks/api/useBacktesting';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { EmptyState } from './common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export const BacktestingDashboard = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: runs, isLoading } = useBacktestRuns();
  const { data: selectedRun } = useBacktestRun(selectedRunId || '');
  const deleteRun = useDeleteBacktestRun();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
    };

    const labels: { [key: string]: string } = {
      completed: 'مكتمل',
      failed: 'فشل',
      running: 'قيد التنفيذ',
      pending: 'قيد الانتظار',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TestTube className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Backtesting</h2>
          <p className="text-sm text-muted-foreground">
            اختبر استراتيجياتك على البيانات التاريخية
          </p>
        </div>
      </div>

      {/* New Backtest Runner */}
      <BacktestRunner />

      {/* Backtests History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الاختبارات</CardTitle>
          <CardDescription>جميع اختبارات الأداء السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {!runs || runs.length === 0 ? (
            <EmptyState
              icon={TestTube}
              title="لا توجد اختبارات"
              description="ابدأ أول Backtest لاختبار استراتيجياتك"
            />
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(run.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{run.name}</h4>
                        {getStatusBadge(run.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{run.symbol}</span>
                        <span>{run.timeframe}</span>
                        <span>{run.strategy_type}</span>
                        <span>
                          {formatDistanceToNow(new Date(run.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </div>

                    {run.status === 'completed' && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">الصفقات</p>
                          <p className="font-semibold">{run.total_trades}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                          <p
                            className={cn(
                              'font-semibold',
                              run.win_rate >= 50 ? 'text-success' : 'text-warning'
                            )}
                          >
                            {run.win_rate}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">العائد</p>
                          <p
                            className={cn(
                              'font-semibold',
                              run.net_profit > 0 ? 'text-success' : 'text-destructive'
                            )}
                          >
                            {run.net_profit_percentage > 0 ? '+' : ''}
                            {run.net_profit_percentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {run.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRunId(run.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRun.mutate(run.id)}
                      disabled={deleteRun.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={!!selectedRunId} onOpenChange={() => setSelectedRunId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>نتائج Backtest</DialogTitle>
            <DialogDescription>
              {selectedRun?.name} - {selectedRun?.symbol} ({selectedRun?.timeframe})
            </DialogDescription>
          </DialogHeader>
          {selectedRun && <BacktestResults run={selectedRun} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
