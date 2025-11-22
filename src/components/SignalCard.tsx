import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TradingSignal {
  id: string;
  symbol: string;
  direction: string;
  entry_from: number;
  entry_to: number;
  stop_loss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  confidence: number | null;
  risk_reward: number;
  status: string;
  main_scenario: string;
  alternative_scenario: string | null;
  tags: string[] | null;
  created_at: string;
}

interface SignalCardProps {
  signal: TradingSignal;
}

export const SignalCard = ({ signal }: SignalCardProps) => {
  const isLong = signal.direction.toLowerCase() === 'long';
  const confidence = signal.confidence || 0;

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getConfidenceBg = () => {
    if (confidence >= 80) return 'bg-success/20 border-success/40';
    if (confidence >= 60) return 'bg-warning/20 border-warning/40';
    return 'bg-muted/30 border-border';
  };

  const getStatusBadge = () => {
    switch (signal.status) {
      case 'active':
        return { label: 'نشط', variant: 'default' as const };
      case 'completed':
        return { label: 'مكتمل', variant: 'secondary' as const };
      case 'cancelled':
        return { label: 'ملغي', variant: 'destructive' as const };
      default:
        return { label: signal.status, variant: 'outline' as const };
    }
  };

  const statusBadge = getStatusBadge();
  const riskRewardRatio = `1:${signal.risk_reward.toFixed(2)}`;

  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 border-border/50 bg-gradient-to-br from-background to-muted/20">
      {/* Header with Symbol and Status */}
      <div className={`px-6 py-4 ${isLong ? 'bg-success/10' : 'bg-destructive/10'} border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isLong ? 'bg-success/20 border-2 border-success/50' : 'bg-destructive/20 border-2 border-destructive/50'
            }`}>
              {isLong ? (
                <ArrowUpCircle className="h-6 w-6 text-success" />
              ) : (
                <ArrowDownCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {signal.symbol}
                <Badge variant={isLong ? 'default' : 'destructive'} className="text-xs">
                  {isLong ? 'LONG' : 'SHORT'}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true, locale: ar })}
              </p>
            </div>
          </div>
          <Badge variant={statusBadge.variant} className="text-sm px-3 py-1">
            {statusBadge.label}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-5">
        {/* Confidence & Risk Reward */}
        <div className="grid grid-cols-2 gap-4">
          {/* Confidence Score */}
          <div className={`p-4 rounded-xl border-2 ${getConfidenceBg()} backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`h-4 w-4 ${getConfidenceColor()}`} />
              <p className="text-xs font-medium text-muted-foreground">درجة الثقة</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-end gap-1">
                <span className={`text-3xl font-bold ${getConfidenceColor()}`}>
                  {confidence}
                </span>
                <span className={`text-lg ${getConfidenceColor()} mb-1`}>%</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    confidence >= 80 ? 'bg-success' : confidence >= 60 ? 'bg-warning' : 'bg-muted-foreground'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Reward */}
          <div className="p-4 rounded-xl border-2 bg-primary/10 border-primary/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">نسبة المخاطر/العائد</p>
            </div>
            <div className="space-y-2">
              <span className="text-3xl font-bold text-primary">
                {riskRewardRatio}
              </span>
              <p className="text-xs text-muted-foreground">
                عائد محتمل {signal.risk_reward.toFixed(1)}x من المخاطرة
              </p>
            </div>
          </div>
        </div>

        {/* Entry Zone */}
        <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-accent">منطقة الدخول</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">من</p>
              <p className="text-lg font-bold">{signal.entry_from.toFixed(4)}</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-1 bg-gradient-to-r from-accent/30 via-accent to-accent/30 rounded-full" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">إلى</p>
              <p className="text-lg font-bold">{signal.entry_to.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Take Profit Targets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-sm font-semibold">أهداف الربح</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'TP1', value: signal.tp1, percentage: '33%' },
              { label: 'TP2', value: signal.tp2, percentage: '33%' },
              { label: 'TP3', value: signal.tp3, percentage: '34%' }
            ].map((tp, idx) => (
              <div 
                key={idx}
                className="bg-success/10 border border-success/30 rounded-lg p-3 text-center hover:bg-success/20 transition-colors"
              >
                <p className="text-xs text-success font-medium mb-1">{tp.label}</p>
                <p className="text-sm font-bold text-success">{tp.value.toFixed(4)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{tp.percentage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-semibold text-destructive">وقف الخسارة</p>
            </div>
            <p className="text-xl font-bold text-destructive">{signal.stop_loss.toFixed(4)}</p>
          </div>
        </div>

        {/* Scenarios */}
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-4 border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              السيناريو الرئيسي
            </p>
            <p className="text-sm leading-relaxed">{signal.main_scenario}</p>
          </div>
          
          {signal.alternative_scenario && (
            <div className="bg-muted/20 rounded-lg p-4 border border-dashed">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                السيناريو البديل
              </p>
              <p className="text-sm leading-relaxed">{signal.alternative_scenario}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {signal.tags && signal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {signal.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
