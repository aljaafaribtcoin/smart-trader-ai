import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { loadAllTimeframesForSymbol } from '@/controller/marketController';
import { Timeframe, MarketSnapshot } from '@/core/types';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';

interface TimeframeAnalysis {
  timeframe: Timeframe;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: 'strong' | 'medium' | 'weak';
  rsi: number | null;
  macdSignal: 'buy' | 'sell' | 'neutral';
  volumeRatio: number;
  price: number;
  change: number;
}

interface MultiTimeframePanelProps {
  symbol: string;
}

const TIMEFRAMES: Timeframe[] = ['1D', '4H', '1H', '15m', '5m', '3m'];

export const MultiTimeframePanel = ({ symbol }: MultiTimeframePanelProps) => {
  const [analyses, setAnalyses] = useState<TimeframeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const analyzeTimeframe = (snapshot: MarketSnapshot): Omit<TimeframeAnalysis, 'timeframe'> => {
    const candles = snapshot.candles;
    if (candles.length === 0) {
      return {
        direction: 'neutral',
        strength: 'weak',
        rsi: null,
        macdSignal: 'neutral',
        volumeRatio: 0,
        price: 0,
        change: 0,
      };
    }

    const latestCandle = candles[candles.length - 1];
    const firstCandle = candles[0];
    const change = ((latestCandle.close - firstCandle.open) / firstCandle.open) * 100;

    // Calculate simple RSI
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < Math.min(14, candles.length); i++) {
      const diff = candles[i].close - candles[i - 1].close;
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    // Determine direction and strength
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let strength: 'strong' | 'medium' | 'weak' = 'weak';

    if (change > 1) {
      direction = 'bullish';
      strength = change > 3 ? 'strong' : 'medium';
    } else if (change < -1) {
      direction = 'bearish';
      strength = change < -3 ? 'strong' : 'medium';
    }

    // MACD signal (simplified)
    let macdSignal: 'buy' | 'sell' | 'neutral' = 'neutral';
    if (rsi < 30) macdSignal = 'buy';
    else if (rsi > 70) macdSignal = 'sell';

    // Volume ratio
    const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
    const volumeRatio = latestCandle.volume / avgVolume;

    return {
      direction,
      strength,
      rsi,
      macdSignal,
      volumeRatio,
      price: latestCandle.close,
      change,
    };
  };

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const snapshots = await loadAllTimeframesForSymbol(symbol, TIMEFRAMES);

      const newAnalyses = TIMEFRAMES.map((tf) => {
        const snapshot = snapshots[tf];
        const analysis = analyzeTimeframe(snapshot);
        return {
          timeframe: tf,
          ...analysis,
        };
      });

      setAnalyses(newAnalyses);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load multi-timeframe analysis:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل تحليل الفريمات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
    
    // Auto-refresh based on shortest timeframe
    const interval = setInterval(() => {
      loadAnalyses();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDirectionBadge = (direction: string) => {
    const variants = {
      bullish: 'default',
      bearish: 'destructive',
      neutral: 'secondary',
    } as const;
    
    const labels = {
      bullish: 'صاعد',
      bearish: 'هابط',
      neutral: 'محايد',
    };

    return (
      <Badge variant={variants[direction as keyof typeof variants]}>
        {labels[direction as keyof typeof labels]}
      </Badge>
    );
  };

  const getStrengthBadge = (strength: string) => {
    const labels = {
      strong: 'قوي',
      medium: 'متوسط',
      weak: 'ضعيف',
    };
    return <span className="text-sm text-muted-foreground">{labels[strength as keyof typeof labels]}</span>;
  };

  const getRSIColor = (rsi: number | null) => {
    if (rsi === null) return 'text-muted-foreground';
    if (rsi > 70) return 'text-destructive';
    if (rsi < 30) return 'text-success';
    return 'text-foreground';
  };

  const getMACDIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return '↑';
      case 'sell':
        return '↓';
      default:
        return '↔';
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            📊 تحليل الفريمات المتعددة
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAnalyses}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right py-3 px-4 text-sm font-semibold">الفريم</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">الاتجاه</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">السعر</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">التغير</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">RSI</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">MACD</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">الحجم</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">القوة</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr
                key={analysis.timeframe}
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-mono font-semibold text-sm uppercase">
                    {analysis.timeframe}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(analysis.direction)}
                    {getDirectionBadge(analysis.direction)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sm">
                    ${analysis.price.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-mono text-sm font-semibold ${
                      analysis.change > 0 ? 'text-success' : analysis.change < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {analysis.change > 0 ? '+' : ''}{analysis.change.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`font-mono text-sm font-semibold ${getRSIColor(analysis.rsi)}`}>
                    {analysis.rsi !== null ? analysis.rsi.toFixed(1) : '-'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-lg">{getMACDIcon(analysis.macdSignal)}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-mono text-sm ${
                      analysis.volumeRatio > 1.2 ? 'text-success' : analysis.volumeRatio < 0.8 ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {(analysis.volumeRatio * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-3 px-4">{getStrengthBadge(analysis.strength)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confluence Summary */}
      <div className="mt-6 p-4 bg-accent/30 rounded-lg">
        <h4 className="font-semibold mb-2">📈 ملخص التوافق</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-success font-semibold">
              {analyses.filter((a) => a.direction === 'bullish').length}
            </span>
            <span className="text-sm text-muted-foreground mr-1">صاعد</span>
          </div>
          <div>
            <span className="text-destructive font-semibold">
              {analyses.filter((a) => a.direction === 'bearish').length}
            </span>
            <span className="text-sm text-muted-foreground mr-1">هابط</span>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold">
              {analyses.filter((a) => a.direction === 'neutral').length}
            </span>
            <span className="text-sm text-muted-foreground mr-1">محايد</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
