import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useTrades } from "@/hooks/api/useTrades";
import { usePatterns } from "@/hooks/api/usePatterns";
import { useAccount } from "@/hooks/api/useAccount";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Percent,
  Activity,
  BarChart3,
  PieChart
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { data: openTrades = [] } = useTrades('open');
  const { data: closedTrades = [] } = useTrades('closed');
  const { data: patterns = [] } = usePatterns();
  const { data: account } = useAccount();

  // Calculate statistics
  const totalTrades = closedTrades.length;
  const profitableTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
  
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  
  const activePatterns = patterns.filter(p => p.status === 'active').length;
  const completedPatterns = patterns.filter(p => p.status === 'completed').length;
  
  const avgConfidence = patterns.length > 0 
    ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
    : 0;

  // Risk metrics
  const totalRisk = openTrades.reduce((sum, t) => {
    const risk = (t.entry_price - t.stop_loss) * t.quantity;
    return sum + Math.abs(risk);
  }, 0);

  const avgRiskReward = closedTrades.length > 0
    ? closedTrades.reduce((sum, t) => sum + (t.risk_reward || 0), 0) / closedTrades.length
    : 0;

  const stats = [
    {
      title: "إجمالي الصفقات",
      value: totalTrades,
      subtitle: `${openTrades.length} مفتوحة`,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "معدل الربح",
      value: `${winRate.toFixed(1)}%`,
      subtitle: `${profitableTrades} من ${totalTrades}`,
      icon: Target,
      color: winRate >= 50 ? "text-success" : "text-warning",
      bgColor: winRate >= 50 ? "bg-success/10" : "bg-warning/10",
    },
    {
      title: "إجمالي الأرباح/الخسائر",
      value: `${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}`,
      subtitle: "USDT",
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: totalPnL >= 0 ? "text-success" : "text-destructive",
      bgColor: totalPnL >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "متوسط الربح/الصفقة",
      value: `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}`,
      subtitle: "USDT",
      icon: DollarSign,
      color: avgPnL >= 0 ? "text-success" : "text-destructive",
      bgColor: avgPnL >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "الأنماط النشطة",
      value: activePatterns,
      subtitle: `${completedPatterns} مكتمل`,
      icon: BarChart3,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "متوسط ثقة الأنماط",
      value: `${avgConfidence.toFixed(1)}%`,
      subtitle: `من ${patterns.length} نمط`,
      icon: Percent,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "المخاطر الإجمالية",
      value: `${totalRisk.toFixed(2)}`,
      subtitle: "USDT في الصفقات المفتوحة",
      icon: PieChart,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "متوسط المخاطر/العائد",
      value: `1:${avgRiskReward.toFixed(2)}`,
      subtitle: "Risk/Reward Ratio",
      icon: Activity,
      color: avgRiskReward >= 2 ? "text-success" : "text-warning",
      bgColor: avgRiskReward >= 2 ? "bg-success/10" : "bg-warning/10",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen p-4 sm:p-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                لوحة الإحصائيات
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                نظرة شاملة على أداء التداول والأنماط
              </p>
            </div>
            <Badge variant="secondary" className="text-sm sm:text-lg px-3 py-1.5 sm:px-4 sm:py-2">
              {account ? `${account.balance.toFixed(2)} USDT` : 'جاري التحميل...'}
            </Badge>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={idx} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <h3 className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Win Rate Progress */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              معدل النجاح
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>الصفقات الرابحة</span>
                  <span className="text-success font-medium">{profitableTrades}</span>
                </div>
                <Progress 
                  value={(profitableTrades / Math.max(totalTrades, 1)) * 100} 
                  className="h-2 bg-muted"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>الصفقات الخاسرة</span>
                  <span className="text-destructive font-medium">
                    {totalTrades - profitableTrades}
                  </span>
                </div>
                <Progress 
                  value={((totalTrades - profitableTrades) / Math.max(totalTrades, 1)) * 100}
                  className="h-2 bg-muted"
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">النسبة الإجمالية</span>
                  <span className={`text-lg font-bold ${winRate >= 50 ? 'text-success' : 'text-warning'}`}>
                    {winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pattern Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              أداء الأنماط
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>أنماط نشطة</span>
                  <span className="text-primary font-medium">{activePatterns}</span>
                </div>
                <Progress 
                  value={(activePatterns / Math.max(patterns.length, 1)) * 100}
                  className="h-2 bg-muted"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>أنماط مكتملة</span>
                  <span className="text-success font-medium">{completedPatterns}</span>
                </div>
                <Progress 
                  value={(completedPatterns / Math.max(patterns.length, 1)) * 100}
                  className="h-2 bg-muted"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>أنماط ملغاة</span>
                  <span className="text-muted-foreground font-medium">
                    {patterns.filter(p => p.status === 'invalidated').length}
                  </span>
                </div>
                <Progress 
                  value={(patterns.filter(p => p.status === 'invalidated').length / Math.max(patterns.length, 1)) * 100}
                  className="h-2 bg-muted"
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">متوسط الثقة</span>
                  <span className="text-lg font-bold text-secondary">
                    {avgConfidence.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            النشاط الأخير
          </h3>
          <div className="space-y-3">
            {closedTrades.slice(0, 5).map((trade) => (
              <div 
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${(trade.pnl || 0) >= 0 ? 'bg-success' : 'bg-destructive'}`} />
                  <div>
                    <p className="font-medium">{trade.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {trade.type === 'long' ? 'شراء' : 'بيع'} • {new Date(trade.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}{(trade.pnl || 0).toFixed(2)} USDT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(trade.pnl_percentage || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Dashboard;