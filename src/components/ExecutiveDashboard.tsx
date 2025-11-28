import { TrendingUp, TrendingDown, Activity, Target, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useBacktestStatistics, useBacktestOverview } from '@/hooks/api/useBacktestStatistics';
import { useBacktestRuns } from '@/hooks/api/useBacktesting';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { EmptyState } from './common/EmptyState';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ExecutiveDashboard = () => {
  const { data: statistics, isLoading: statsLoading } = useBacktestStatistics();
  const { data: overview, isLoading: overviewLoading } = useBacktestOverview();
  const { data: runs, isLoading: runsLoading } = useBacktestRuns();

  if (statsLoading || overviewLoading || runsLoading) {
    return <LoadingSkeleton />;
  }

  if (!runs || runs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="لا توجد بيانات"
        description="قم بتشغيل اختبارات Backtesting أولاً لرؤية الإحصائيات"
      />
    );
  }

  // Prepare data for charts
  const completedRuns = runs.filter(run => run.status === 'completed');
  
  const strategyComparison = statistics
    ?.reduce((acc: any[], stat) => {
      const existing = acc.find(s => s.strategy === stat.strategy_type);
      if (existing) {
        existing.runs += stat.total_runs || 0;
        existing.avgReturn += stat.avg_return || 0;
        existing.count += 1;
      } else {
        acc.push({
          strategy: stat.strategy_type,
          runs: stat.total_runs || 0,
          avgReturn: stat.avg_return || 0,
          count: 1,
        });
      }
      return acc;
    }, [])
    .map(s => ({
      strategy: s.strategy,
      runs: s.runs,
      avgReturn: Math.round((s.avgReturn / s.count) * 100) / 100,
    })) || [];

  const symbolPerformance = statistics
    ?.slice(0, 10)
    .map(stat => ({
      symbol: stat.symbol,
      return: Math.round((stat.avg_return || 0) * 100) / 100,
      winRate: Math.round((stat.avg_win_rate || 0) * 100) / 100,
    })) || [];

  const timelineData = completedRuns
    .slice(-20)
    .map(run => ({
      name: new Date(run.created_at || '').toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
      return: Math.round((run.net_profit_percentage || 0) * 100) / 100,
      winRate: Math.round((run.win_rate || 0) * 100) / 100,
    }));

  const strategyDistribution = strategyComparison.map(s => ({
    name: s.strategy,
    value: s.runs,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{overview?.totalRuns || 0}</p>
              <p className="text-xs text-muted-foreground">إجمالي الاختبارات</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{overview?.totalTrades || 0}</p>
              <p className="text-xs text-muted-foreground">إجمالي الصفقات</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Percent className={cn('h-4 w-4', (overview?.avgWinRate || 0) >= 50 ? 'text-success' : 'text-warning')} />
            </div>
            <div className="space-y-1">
              <p className={cn('text-2xl font-bold', (overview?.avgWinRate || 0) >= 50 ? 'text-success' : 'text-warning')}>
                {overview?.avgWinRate || 0}%
              </p>
              <p className="text-xs text-muted-foreground">متوسط Win Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className={cn('h-4 w-4', (overview?.totalReturn || 0) >= 0 ? 'text-success' : 'text-destructive')} />
            </div>
            <div className="space-y-1">
              <p className={cn('text-2xl font-bold', (overview?.totalReturn || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                {overview?.totalReturn || 0}%
              </p>
              <p className="text-xs text-muted-foreground">إجمالي العائد</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{overview?.avgProfitFactor.toFixed(2) || 0}</p>
              <p className="text-xs text-muted-foreground">متوسط Profit Factor</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className={cn('h-4 w-4', (overview?.profitableRate || 0) >= 50 ? 'text-success' : 'text-warning')} />
            </div>
            <div className="space-y-1">
              <p className={cn('text-2xl font-bold', (overview?.profitableRate || 0) >= 50 ? 'text-success' : 'text-warning')}>
                {overview?.profitableRate || 0}%
              </p>
              <p className="text-xs text-muted-foreground">نسبة الربحية</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>الأداء عبر الزمن</CardTitle>
            <CardDescription>العائد ومعدل النجاح للاختبارات الأخيرة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="return" stroke="hsl(var(--primary))" name="العائد %" strokeWidth={2} />
                <Line type="monotone" dataKey="winRate" stroke="hsl(var(--success))" name="Win Rate %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Strategy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الاستراتيجيات</CardTitle>
            <CardDescription>عدد الاختبارات لكل استراتيجية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={strategyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {strategyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>مقارنة الاستراتيجيات</CardTitle>
            <CardDescription>متوسط العائد لكل استراتيجية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strategyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="strategy" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="avgReturn" fill="hsl(var(--primary))" name="متوسط العائد %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Symbols */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل الرموز أداءً</CardTitle>
            <CardDescription>أعلى 10 رموز من حيث العائد</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={symbolPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="symbol" stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="return" fill="hsl(var(--success))" name="العائد %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات التفصيلية</CardTitle>
          <CardDescription>جميع الإحصائيات حسب الاستراتيجية والرمز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right p-2">الاستراتيجية</th>
                  <th className="text-right p-2">الرمز</th>
                  <th className="text-right p-2">الإطار الزمني</th>
                  <th className="text-right p-2">الاختبارات</th>
                  <th className="text-right p-2">الصفقات</th>
                  <th className="text-right p-2">Win Rate</th>
                  <th className="text-right p-2">متوسط العائد</th>
                  <th className="text-right p-2">أفضل عائد</th>
                  <th className="text-right p-2">Profit Factor</th>
                </tr>
              </thead>
              <tbody>
                {statistics?.slice(0, 20).map((stat, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30">
                    <td className="p-2">
                      <Badge variant="outline">{stat.strategy_type}</Badge>
                    </td>
                    <td className="p-2 font-medium">{stat.symbol}</td>
                    <td className="p-2">{stat.timeframe}</td>
                    <td className="p-2">{stat.total_runs}</td>
                    <td className="p-2">{stat.total_trades_all_runs}</td>
                    <td className="p-2">
                      <span className={cn((stat.avg_win_rate || 0) >= 50 ? 'text-success' : 'text-warning')}>
                        {stat.avg_win_rate?.toFixed(2) || 0}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={cn((stat.avg_return || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                        {stat.avg_return?.toFixed(2) || 0}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-success">{stat.best_return?.toFixed(2) || 0}%</span>
                    </td>
                    <td className="p-2">{stat.avg_profit_factor?.toFixed(2) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
