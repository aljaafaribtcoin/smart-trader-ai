import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { loadAllTimeframesForSymbol } from '@/controller/marketController';
import { Timeframe } from '@/core/types';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { errorLogger } from '@/lib/errorLogger';

interface TimeframeMovement {
  timeframe: Timeframe;
  change: number;
  price: number;
  timestamp: Date;
  sparklineData: number[];
  error?: boolean;
}

interface TimeframeMovementTrackerProps {
  symbol: string;
}

const TIMEFRAMES: Timeframe[] = ['3m', '5m', '15m', '1H', '4H', '1D'];

export const TimeframeMovementTracker = ({ symbol }: TimeframeMovementTrackerProps) => {
  const [movements, setMovements] = useState<TimeframeMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedTimeframes, setFailedTimeframes] = useState<Timeframe[]>([]);

  const loadMovements = async () => {
    try {
      setIsLoading(true);
      const snapshots = await loadAllTimeframesForSymbol(symbol, TIMEFRAMES);

      const failed: Timeframe[] = [];
      const newMovements = TIMEFRAMES.map((tf) => {
        const snapshot = snapshots[tf];

        if (!snapshot || snapshot.candles.length === 0) {
          failed.push(tf);
          return {
            timeframe: tf,
            change: 0,
            price: 0,
            timestamp: new Date(),
            sparklineData: [],
            error: true,
          };
        }

        const candles = snapshot.candles;
        const firstCandle = candles[0];
        const latestCandle = candles[candles.length - 1];
        const change = ((latestCandle.close - firstCandle.open) / firstCandle.open) * 100;

        // Create sparkline data (last 20 candles)
        const sparklineData = candles.slice(-20).map((c) => c.close);

        return {
          timeframe: tf,
          change,
          price: latestCandle.close,
          timestamp: new Date(latestCandle.timestamp),
          sparklineData,
          error: false,
        };
      });

      setMovements(newMovements);
      setFailedTimeframes(failed);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errorLogger.log({
        type: 'api',
        component: 'TimeframeMovementTracker',
        message: 'Failed to load movements',
        details: { symbol, error: message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();

    const interval = setInterval(loadMovements, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getHeatmapColor = (change: number) => {
    if (change > 2) return 'bg-success/80';
    if (change > 1) return 'bg-success/60';
    if (change > 0) return 'bg-success/30';
    if (change > -1) return 'bg-destructive/30';
    if (change > -2) return 'bg-destructive/60';
    return 'bg-destructive/80';
  };

  const MiniSparkline = ({ data }: { data: number[] }) => {
    if (data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 50 : ((max - value) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] > data[0];

    return (
      <svg width="60" height="20" className="opacity-70">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
          strokeWidth="2"
        />
      </svg>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
        🔄 متتبع حركة الفريمات
      </h3>

      {/* Warning banner for failed timeframes */}
      {failedTimeframes.length > 0 && (
        <div className="mb-4 p-2 text-xs text-warning bg-warning/10 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>فشل تحميل: {failedTimeframes.join(', ')}</span>
        </div>
      )}

      {/* Movement List */}
      <div className="space-y-2 mb-4 sm:mb-6">
        {movements.map((movement) => (
          <div
            key={movement.timeframe}
            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors ${
              movement.error 
                ? 'bg-destructive/10 border border-destructive/20' 
                : 'bg-accent/30 hover:bg-accent/50'
            }`}
          >
            {movement.error ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-xs sm:text-sm uppercase w-8 sm:w-10">
                    {movement.timeframe}
                  </span>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-xs text-destructive">فشل التحميل</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-mono font-semibold text-xs sm:text-sm uppercase w-8 sm:w-10">
                    {movement.timeframe}
                  </span>
                  <div className="hidden sm:block">
                    <MiniSparkline data={movement.sparklineData} />
                  </div>
                </div>
                <div className="text-left">
                  <div className={`font-mono font-bold text-xs sm:text-sm ${getChangeColor(movement.change)}`}>
                    {movement.change > 0 ? '📈' : movement.change < 0 ? '📉' : '➖'}{' '}
                    {movement.change > 0 ? '+' : ''}{movement.change.toFixed(2)}%
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground">
                    {formatDistanceToNow(movement.timestamp, { addSuffix: true, locale: ar })}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Heatmap View - Hidden on small screens */}
      <div className="hidden sm:block border-t border-border pt-4">
        <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground">خريطة حرارية</h4>
        <div className="space-y-2">
          {movements.map((movement) => (
            <div key={movement.timeframe} className="flex items-center gap-2">
              <span className="font-mono text-xs w-10 text-muted-foreground uppercase">
                {movement.timeframe}
              </span>
              <div className="flex-1 h-5 sm:h-6 rounded overflow-hidden flex">
                <div
                  className={`h-full transition-all ${getHeatmapColor(movement.change)}`}
                  style={{ width: '100%' }}
                />
              </div>
              <span className={`font-mono text-xs w-14 sm:w-16 text-right ${getChangeColor(movement.change)}`}>
                {movement.change > 0 ? '+' : ''}{movement.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-accent/30 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <span className="text-success font-semibold">
              {movements.filter((m) => m.change > 0).length}
            </span>
            <span className="text-muted-foreground mr-1">صاعد</span>
          </div>
          <div>
            <span className="text-destructive font-semibold">
              {movements.filter((m) => m.change < 0).length}
            </span>
            <span className="text-muted-foreground mr-1">هابط</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
