import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Indicator {
  name: string;
  value: string | number;
  status: 'bullish' | 'bearish' | 'neutral';
  statusLabel: string;
  timestamp: Date;
  icon: React.ReactNode;
  category: string;
}

interface IndicatorsDashboardProps {
  symbol: string;
  timeframe: string;
}

export const IndicatorsDashboard = ({ symbol, timeframe }: IndicatorsDashboardProps) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const evaluateRSI = (rsi: number): { status: 'bullish' | 'bearish' | 'neutral'; label: string } => {
    if (rsi > 70) return { status: 'bearish', label: 'تشبع شرائي ⚠️' };
    if (rsi < 30) return { status: 'bullish', label: 'تشبع بيعي ✅' };
    if (rsi > 60) return { status: 'bullish', label: 'صاعد' };
    if (rsi < 40) return { status: 'bearish', label: 'هابط' };
    return { status: 'neutral', label: 'محايد' };
  };

  const evaluateMACD = (macdValue: number, signal: number): { status: 'bullish' | 'bearish' | 'neutral'; label: string } => {
    if (macdValue > signal) return { status: 'bullish', label: 'إشارة شراء 🟢' };
    if (macdValue < signal) return { status: 'bearish', label: 'إشارة بيع 🔴' };
    return { status: 'neutral', label: 'محايد' };
  };

  const evaluateStochastic = (k: number): { status: 'bullish' | 'bearish' | 'neutral'; label: string } => {
    if (k > 80) return { status: 'bearish', label: 'تشبع شرائي' };
    if (k < 20) return { status: 'bullish', label: 'تشبع بيعي' };
    return { status: 'neutral', label: 'محايد' };
  };

  const evaluateEMA = (price: number, ema20: number, ema50: number): { status: 'bullish' | 'bearish' | 'neutral'; label: string } => {
    if (price > ema20 && ema20 > ema50) return { status: 'bullish', label: 'صاعد قوي' };
    if (price < ema20 && ema20 < ema50) return { status: 'bearish', label: 'هابط قوي' };
    if (price > ema20) return { status: 'bullish', label: 'صاعد' };
    if (price < ema20) return { status: 'bearish', label: 'هابط' };
    return { status: 'neutral', label: 'محايد' };
  };

  const evaluateATR = (atr: number): { status: 'bullish' | 'bearish' | 'neutral'; label: string } => {
    // This is relative, in a real scenario we'd compare with historical ATR
    if (atr > 1000) return { status: 'neutral', label: 'تقلب عالي' };
    if (atr > 500) return { status: 'neutral', label: 'تقلب متوسط' };
    return { status: 'neutral', label: 'تقلب منخفض' };
  };

  const loadIndicators = async () => {
    try {
      setIsLoading(true);

      // Fetch technical indicators
      const { data: techData, error: techError } = await supabase
        .from('technical_indicators')
        .select('*')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (techError) throw techError;

      // Fetch current price
      const { data: priceData, error: priceError } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceError) throw priceError;

      const indicatorsList: Indicator[] = [];
      const now = new Date();
      const timestamp = techData ? new Date(techData.calculated_at) : now;

      if (techData && priceData) {
        const price = priceData.price;

        // Trend Indicators
        if (techData.ema_20 && techData.ema_50) {
          const emaEval = evaluateEMA(price, techData.ema_20, techData.ema_50);
          indicatorsList.push({
            name: 'EMA 20',
            value: `$${techData.ema_20.toFixed(2)}`,
            status: emaEval.status,
            statusLabel: emaEval.label,
            timestamp,
            icon: <TrendingUp className="w-4 h-4" />,
            category: 'trend',
          });

          indicatorsList.push({
            name: 'EMA 50',
            value: `$${techData.ema_50.toFixed(2)}`,
            status: emaEval.status,
            statusLabel: emaEval.label,
            timestamp,
            icon: <TrendingUp className="w-4 h-4" />,
            category: 'trend',
          });
        }

        if (techData.ema_200) {
          const ema200Status = price > techData.ema_200 ? 'bullish' : price < techData.ema_200 ? 'bearish' : 'neutral';
          indicatorsList.push({
            name: 'EMA 200',
            value: `$${techData.ema_200.toFixed(2)}`,
            status: ema200Status,
            statusLabel: ema200Status === 'bullish' ? 'صاعد' : ema200Status === 'bearish' ? 'هابط' : 'محايد',
            timestamp,
            icon: <TrendingUp className="w-4 h-4" />,
            category: 'trend',
          });
        }

        // Momentum Indicators
        if (techData.rsi) {
          const rsiEval = evaluateRSI(techData.rsi);
          indicatorsList.push({
            name: 'RSI (14)',
            value: techData.rsi.toFixed(1),
            status: rsiEval.status,
            statusLabel: rsiEval.label,
            timestamp,
            icon: <Activity className="w-4 h-4" />,
            category: 'momentum',
          });
        }

        if (techData.macd_value && techData.macd_signal) {
          const macdEval = evaluateMACD(techData.macd_value, techData.macd_signal);
          indicatorsList.push({
            name: 'MACD',
            value: techData.macd_value.toFixed(2),
            status: macdEval.status,
            statusLabel: macdEval.label,
            timestamp,
            icon: <Zap className="w-4 h-4" />,
            category: 'momentum',
          });
        }

        if (techData.stochastic_k) {
          const stochEval = evaluateStochastic(techData.stochastic_k);
          indicatorsList.push({
            name: 'Stochastic',
            value: techData.stochastic_k.toFixed(1),
            status: stochEval.status,
            statusLabel: stochEval.label,
            timestamp,
            icon: <Activity className="w-4 h-4" />,
            category: 'momentum',
          });
        }

        // Volatility Indicators
        if (techData.atr) {
          const atrEval = evaluateATR(techData.atr);
          indicatorsList.push({
            name: 'ATR',
            value: `$${techData.atr.toFixed(2)}`,
            status: atrEval.status,
            statusLabel: atrEval.label,
            timestamp,
            icon: <BarChart3 className="w-4 h-4" />,
            category: 'volatility',
          });
        }

        if (techData.bb_upper && techData.bb_lower && techData.bb_middle) {
          const bbWidth = ((techData.bb_upper - techData.bb_lower) / techData.bb_middle) * 100;
          const bbStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';
          indicatorsList.push({
            name: 'BB Width',
            value: `${bbWidth.toFixed(2)}%`,
            status: bbStatus,
            statusLabel: bbWidth < 2 ? 'نطاق ضيق' : bbWidth > 4 ? 'نطاق واسع' : 'نطاق متوسط',
            timestamp,
            icon: <BarChart3 className="w-4 h-4" />,
            category: 'volatility',
          });
        }

        // Volume Indicators
        if (priceData.volume_24h) {
          const volumeStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';
          indicatorsList.push({
            name: 'Volume 24h',
            value: `${(priceData.volume_24h / 1e9).toFixed(2)}B`,
            status: volumeStatus,
            statusLabel: 'حجم التداول',
            timestamp: new Date(priceData.last_updated),
            icon: <BarChart3 className="w-4 h-4" />,
            category: 'volume',
          });
        }
      }

      setIndicators(indicatorsList);
    } catch (error) {
      console.error('Failed to load indicators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIndicators();

    const interval = setInterval(loadIndicators, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bullish':
        return 'text-success';
      case 'bearish':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'bullish':
        return 'default';
      case 'bearish':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const groupedIndicators = {
    trend: indicators.filter((i) => i.category === 'trend'),
    momentum: indicators.filter((i) => i.category === 'momentum'),
    volatility: indicators.filter((i) => i.category === 'volatility'),
    volume: indicators.filter((i) => i.category === 'volume'),
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const renderIndicatorSection = (title: string, icon: React.ReactNode, items: Indicator[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-muted-foreground">
          {icon}
          {title}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {items.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`shrink-0 ${getStatusColor(indicator.status)}`}>
                  {indicator.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs sm:text-sm truncate">{indicator.name}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {formatDistanceToNow(indicator.timestamp, { addSuffix: true, locale: ar })}
                  </div>
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className={`font-mono font-bold text-xs sm:text-sm ${getStatusColor(indicator.status)}`}>
                  {indicator.value}
                </div>
                <Badge variant={getStatusBadgeVariant(indicator.status) as any} className="text-[10px] sm:text-xs mt-1">
                  {indicator.statusLabel}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        📈 لوحة المؤشرات الفنية
      </h3>

      {renderIndicatorSection('مؤشرات الاتجاه', <TrendingUp className="w-4 h-4" />, groupedIndicators.trend)}
      {renderIndicatorSection('مؤشرات الزخم', <Activity className="w-4 h-4" />, groupedIndicators.momentum)}
      {renderIndicatorSection('مؤشرات التقلب', <BarChart3 className="w-4 h-4" />, groupedIndicators.volatility)}
      {renderIndicatorSection('مؤشرات الحجم', <BarChart3 className="w-4 h-4" />, groupedIndicators.volume)}

      {indicators.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد بيانات مؤشرات متاحة</p>
        </div>
      )}
    </Card>
  );
};
