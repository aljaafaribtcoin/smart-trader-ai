import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface VolumeChartProps {
  candles: any[];
  symbol: string;
}

export const VolumeChart = ({ candles, symbol }: VolumeChartProps) => {
  if (!candles || candles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">لا توجد بيانات حجم متاحة</h3>
      </Card>
    );
  }

  // Transform data for volume chart
  const volumeData = candles.map((candle) => {
    const open = parseFloat(candle.open);
    const close = parseFloat(candle.close);
    const volume = parseFloat(candle.volume);
    const isBullish = close >= open;

    return {
      timestamp: new Date(candle.timestamp).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      volume,
      isBullish,
    };
  });

  // Calculate statistics
  const totalVolume = volumeData.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = totalVolume / volumeData.length;
  const maxVolume = Math.max(...volumeData.map((d) => d.volume));
  const bullishVolume = volumeData
    .filter((d) => d.isBullish)
    .reduce((sum, d) => sum + d.volume, 0);
  const bearishVolume = volumeData
    .filter((d) => !d.isBullish)
    .reduce((sum, d) => sum + d.volume, 0);

  const bullishPercentage = ((bullishVolume / totalVolume) * 100).toFixed(1);
  const bearishPercentage = ((bearishVolume / totalVolume) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 text-xs border-border">
          <div className="space-y-1">
            <div className="font-semibold text-muted-foreground">{data.timestamp}</div>
            <div>
              <span className="text-muted-foreground">الحجم: </span>
              <span className="font-semibold">{data.volume.toLocaleString()}</span>
            </div>
            <div>
              <span className={`text-xs font-semibold ${data.isBullish ? 'text-success' : 'text-destructive'}`}>
                {data.isBullish ? '↗ حجم شرائي' : '↘ حجم بيعي'}
              </span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Volume Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">إجمالي الحجم</div>
          <div className="text-xl font-bold">{totalVolume.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">متوسط الحجم</div>
          <div className="text-xl font-bold">{avgVolume.toLocaleString()}</div>
        </Card>
        <Card className="p-4 bg-success/10">
          <div className="text-xs text-muted-foreground mb-1">حجم شرائي</div>
          <div className="text-xl font-bold text-success">{bullishPercentage}%</div>
        </Card>
        <Card className="p-4 bg-destructive/10">
          <div className="text-xs text-muted-foreground mb-1">حجم بيعي</div>
          <div className="text-xl font-bold text-destructive">{bearishPercentage}%</div>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">مخطط حجم التداول</h3>
          <p className="text-sm text-muted-foreground">
            الأعمدة الخضراء تمثل حجم شرائي والحمراء تمثل حجم بيعي
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={volumeData}
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
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
              {volumeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isBullish
                      ? 'hsl(var(--success))'
                      : 'hsl(var(--destructive))'
                  }
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Volume Analysis */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">تحليل الحجم</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">أعلى حجم تداول</span>
            <span className="font-bold">{maxVolume.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">نسبة الضغط الشرائي</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success"
                  style={{ width: `${bullishPercentage}%` }}
                />
              </div>
              <span className="font-bold text-success">{bullishPercentage}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">نسبة الضغط البيعي</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive"
                  style={{ width: `${bearishPercentage}%` }}
                />
              </div>
              <span className="font-bold text-destructive">{bearishPercentage}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
            <span className="text-sm font-semibold">الاتجاه السائد</span>
            <span className={`font-bold ${parseFloat(bullishPercentage) > parseFloat(bearishPercentage) ? 'text-success' : 'text-destructive'}`}>
              {parseFloat(bullishPercentage) > parseFloat(bearishPercentage) ? '↗ صاعد' : '↘ هابط'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
