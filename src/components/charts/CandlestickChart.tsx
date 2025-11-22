import { Card } from '@/components/ui/card';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';

interface CandlestickChartProps {
  candles: any[];
  symbol: string;
  timeframe: string;
}

export const CandlestickChart = ({ candles, symbol, timeframe }: CandlestickChartProps) => {
  // Transform candles data for charting
  const chartData = candles.map((candle) => {
    const open = parseFloat(candle.open);
    const high = parseFloat(candle.high);
    const low = parseFloat(candle.low);
    const close = parseFloat(candle.close);
    const isBullish = close >= open;

    return {
      timestamp: new Date(candle.timestamp).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fullTimestamp: candle.timestamp,
      open,
      high,
      low,
      close,
      isBullish,
      // For simplified candlestick representation
      body: [Math.min(open, close), Math.max(open, close)],
      wick: [low, high],
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 text-xs border-border">
          <div className="space-y-1">
            <div className="font-semibold text-muted-foreground">{data.timestamp}</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">فتح: </span>
                <span className="font-semibold">${data.open.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">أعلى: </span>
                <span className="font-semibold text-success">${data.high.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">أقل: </span>
                <span className="font-semibold text-destructive">${data.low.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">إغلاق: </span>
                <span className={`font-semibold ${data.isBullish ? 'text-success' : 'text-destructive'}`}>
                  ${data.close.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="pt-1 border-t border-border mt-2">
              <span className={`text-xs font-semibold ${data.isBullish ? 'text-success' : 'text-destructive'}`}>
                {data.isBullish ? '↗ صاعد' : '↘ هابط'}
              </span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">
          {symbol} - {timeframe}
        </h3>
        <p className="text-sm text-muted-foreground">
          عرض الشموع اليابانية مع خطوط الاتجاه
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="timestamp"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickMargin={10}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickMargin={10}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Candlestick wicks (high-low lines) */}
          {chartData.map((entry, index) => (
            <Line
              key={`wick-${index}`}
              type="linear"
              dataKey="wick"
              stroke={entry.isBullish ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
              strokeWidth={1}
              dot={false}
              connectNulls
            />
          ))}

          {/* Bullish candles */}
          <Bar
            dataKey={(data) => (data.isBullish ? data.body : null)}
            fill="hsl(var(--success))"
            opacity={0.8}
            barSize={8}
          />

          {/* Bearish candles */}
          <Bar
            dataKey={(data) => (!data.isBullish ? data.body : null)}
            fill="hsl(var(--destructive))"
            opacity={0.8}
            barSize={8}
          />

          {/* Close price line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
            opacity={0.6}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};
