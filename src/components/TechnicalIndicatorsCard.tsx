import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnicalIndicatorsCardProps {
  symbol: string;
  timeframe: string;
}

export const TechnicalIndicatorsCard = ({ symbol, timeframe }: TechnicalIndicatorsCardProps) => {
  const { data: indicators, isLoading } = useTechnicalIndicators(symbol, timeframe);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">المؤشرات الفنية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!indicators) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">المؤشرات الفنية</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد بيانات متاحة
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRSISignal = (rsi?: number) => {
    if (!rsi) return { text: 'غير متاح', color: 'text-muted-foreground', icon: Minus };
    if (rsi > 70) return { text: 'تشبع شرائي', color: 'text-destructive', icon: TrendingDown };
    if (rsi < 30) return { text: 'تشبع بيعي', color: 'text-success', icon: TrendingUp };
    return { text: 'محايد', color: 'text-muted-foreground', icon: Minus };
  };

  const getMACDSignal = (histogram?: number) => {
    if (!histogram) return { text: 'غير متاح', color: 'text-muted-foreground', icon: Minus };
    if (histogram > 0) return { text: 'صاعد', color: 'text-success', icon: TrendingUp };
    if (histogram < 0) return { text: 'هابط', color: 'text-destructive', icon: TrendingDown };
    return { text: 'محايد', color: 'text-muted-foreground', icon: Minus };
  };

  const getStochasticSignal = (k?: number) => {
    if (!k) return { text: 'غير متاح', color: 'text-muted-foreground', icon: Minus };
    if (k > 80) return { text: 'تشبع شرائي', color: 'text-destructive', icon: TrendingDown };
    if (k < 20) return { text: 'تشبع بيعي', color: 'text-success', icon: TrendingUp };
    return { text: 'محايد', color: 'text-muted-foreground', icon: Minus };
  };

  const rsiSignal = getRSISignal(indicators.rsi);
  const macdSignal = getMACDSignal(indicators.macd_histogram);
  const stochSignal = getStochasticSignal(indicators.stochastic_k);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>المؤشرات الفنية</span>
          <Badge variant="outline" className="text-xs">
            {symbol} • {timeframe}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RSI */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">RSI (14)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">{indicators.rsi?.toFixed(2) || '--'}</span>
              <rsiSignal.icon className={cn("w-3.5 h-3.5", rsiSignal.color)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all",
                  indicators.rsi && indicators.rsi > 70 ? "bg-destructive" :
                  indicators.rsi && indicators.rsi < 30 ? "bg-success" :
                  "bg-primary"
                )}
                style={{ width: `${indicators.rsi || 0}%` }}
              />
            </div>
            <span className={cn("text-xs font-medium mr-2", rsiSignal.color)}>
              {rsiSignal.text}
            </span>
          </div>
        </div>

        {/* MACD */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">MACD</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px]">
                {indicators.macd_value?.toFixed(2) || '--'}
              </span>
              <macdSignal.icon className={cn("w-3.5 h-3.5", macdSignal.color)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="text-center">
              <div className="text-muted-foreground">قيمة</div>
              <div className="font-mono font-semibold">{indicators.macd_value?.toFixed(2) || '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">إشارة</div>
              <div className="font-mono font-semibold">{indicators.macd_signal?.toFixed(2) || '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">هستوجرام</div>
              <div className={cn("font-mono font-semibold", macdSignal.color)}>
                {indicators.macd_histogram?.toFixed(2) || '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Bollinger Bands</div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="text-center">
              <div className="text-muted-foreground">عالي</div>
              <div className="font-mono font-semibold text-destructive">
                {indicators.bb_upper?.toFixed(2) || '--'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">وسط</div>
              <div className="font-mono font-semibold">{indicators.bb_middle?.toFixed(2) || '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">منخفض</div>
              <div className="font-mono font-semibold text-success">
                {indicators.bb_lower?.toFixed(2) || '--'}
              </div>
            </div>
          </div>
        </div>

        {/* EMAs */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">المتوسطات المتحركة (EMA)</div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="text-center">
              <div className="text-muted-foreground">20</div>
              <div className="font-mono font-semibold">{indicators.ema_20?.toFixed(2) || '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">50</div>
              <div className="font-mono font-semibold">{indicators.ema_50?.toFixed(2) || '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">200</div>
              <div className="font-mono font-semibold">{indicators.ema_200?.toFixed(2) || '--'}</div>
            </div>
          </div>
        </div>

        {/* Stochastic */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Stochastic</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px]">
                K: {indicators.stochastic_k?.toFixed(2) || '--'}
              </span>
              <stochSignal.icon className={cn("w-3.5 h-3.5", stochSignal.color)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="text-center">
              <div className="text-muted-foreground">%K</div>
              <div className={cn("font-mono font-semibold", stochSignal.color)}>
                {indicators.stochastic_k?.toFixed(2) || '--'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">%D</div>
              <div className="font-mono font-semibold">
                {indicators.stochastic_d?.toFixed(2) || '--'}
              </div>
            </div>
          </div>
        </div>

        {/* ATR */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">ATR (التقلب)</span>
            <span className="font-mono font-semibold">{indicators.atr?.toFixed(2) || '--'}</span>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
          آخر تحديث: {new Date(indicators.calculated_at).toLocaleTimeString('ar-SA')}
        </div>
      </CardContent>
    </Card>
  );
};
