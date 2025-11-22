import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

interface IndicatorsPanelProps {
  indicators: any;
  candles: any[];
  symbol: string;
}

export const IndicatorsPanel = ({ indicators, candles, symbol }: IndicatorsPanelProps) => {
  if (!indicators) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📈</div>
        <h3 className="text-lg font-semibold mb-2">لا توجد مؤشرات متاحة</h3>
        <p className="text-sm text-muted-foreground">
          جاري حساب المؤشرات الفنية...
        </p>
      </Card>
    );
  }

  const rsi = parseFloat(indicators.rsi || '50');
  const macdValue = parseFloat(indicators.macd_value || '0');
  const macdSignal = parseFloat(indicators.macd_signal || '0');
  const stochasticK = parseFloat(indicators.stochastic_k || '50');
  const stochasticD = parseFloat(indicators.stochastic_d || '50');

  // Prepare data for charts
  const chartData = candles.slice(-50).map((candle, index) => ({
    index,
    timestamp: new Date(candle.timestamp).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    close: parseFloat(candle.close),
  }));

  // RSI Signal
  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { text: 'تشبع شرائي', color: 'bg-destructive' };
    if (rsi < 30) return { text: 'تشبع بيعي', color: 'bg-success' };
    return { text: 'محايد', color: 'bg-muted' };
  };

  const rsiSignal = getRSISignal(rsi);

  // MACD Signal
  const macdSignal_text = macdValue > macdSignal ? 'إشارة شراء' : 'إشارة بيع';
  const macdColor = macdValue > macdSignal ? 'text-success' : 'text-destructive';

  // Stochastic Signal
  const getStochasticSignal = (k: number) => {
    if (k > 80) return { text: 'تشبع شرائي', color: 'bg-destructive' };
    if (k < 20) return { text: 'تشبع بيعي', color: 'bg-success' };
    return { text: 'محايد', color: 'bg-muted' };
  };

  const stochasticSignal = getStochasticSignal(stochasticK);

  return (
    <div className="space-y-4">
      {/* Indicators Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RSI Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">مؤشر القوة النسبية (RSI)</h4>
            <Badge className={rsiSignal.color}>{rsiSignal.text}</Badge>
          </div>
          <div className="text-3xl font-bold mb-2">{rsi.toFixed(2)}</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                rsi > 70 ? 'bg-destructive' : rsi < 30 ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(rsi, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0</span>
            <span>30</span>
            <span>70</span>
            <span>100</span>
          </div>
        </Card>

        {/* MACD Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">MACD</h4>
            <Badge className={macdValue > macdSignal ? 'bg-success' : 'bg-destructive'}>
              {macdSignal_text}
            </Badge>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">MACD: </span>
              <span className={`font-bold ${macdColor}`}>{macdValue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Signal: </span>
              <span className="font-semibold">{macdSignal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Histogram: </span>
              <span className="font-semibold">
                {(macdValue - macdSignal).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Stochastic Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Stochastic</h4>
            <Badge className={stochasticSignal.color}>{stochasticSignal.text}</Badge>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">%K: </span>
              <span className="font-bold">{stochasticK.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">%D: </span>
              <span className="font-semibold">{stochasticD.toFixed(2)}</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full transition-all ${
                stochasticK > 80
                  ? 'bg-destructive'
                  : stochasticK < 20
                  ? 'bg-success'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(stochasticK, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* RSI Chart */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">مخطط RSI (آخر 50 شمعة)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="timestamp"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              domain={[0, 100]}
            />
            <Tooltip />
            <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="hsl(var(--success))" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey={() => rsi}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Moving Averages */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">المتوسطات المتحركة (EMA)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">EMA 20</div>
            <div className="text-lg font-bold text-success">
              ${parseFloat(indicators.ema_20 || '0').toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">EMA 50</div>
            <div className="text-lg font-bold text-primary">
              ${parseFloat(indicators.ema_50 || '0').toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">EMA 200</div>
            <div className="text-lg font-bold text-muted-foreground">
              ${parseFloat(indicators.ema_200 || '0').toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Bollinger Bands */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">بولينجر باندز</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">الحد العلوي</div>
            <div className="text-lg font-bold text-destructive">
              ${parseFloat(indicators.bb_upper || '0').toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">الوسط</div>
            <div className="text-lg font-bold text-primary">
              ${parseFloat(indicators.bb_middle || '0').toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">الحد السفلي</div>
            <div className="text-lg font-bold text-success">
              ${parseFloat(indicators.bb_lower || '0').toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* ATR */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">متوسط المدى الحقيقي (ATR)</h4>
            <p className="text-xs text-muted-foreground mt-1">
              مؤشر التقلب - قيمة أعلى تعني تقلب أكبر
            </p>
          </div>
          <div className="text-2xl font-bold text-primary">
            ${parseFloat(indicators.atr || '0').toFixed(2)}
          </div>
        </div>
      </Card>
    </div>
  );
};
