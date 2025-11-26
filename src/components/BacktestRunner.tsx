import { useState } from 'react';
import { Play, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRunBacktest, BacktestConfig } from '@/hooks/api/useBacktesting';

const AVAILABLE_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'];
const TIMEFRAMES = ['15m', '1h', '4h', '1d'];
const STRATEGY_TYPES = [
  { value: 'signals', label: 'التوصيات' },
  { value: 'patterns', label: 'الأنماط' },
  { value: 'indicators', label: 'المؤشرات' },
];

export const BacktestRunner = () => {
  const runBacktest = useRunBacktest();
  
  const [config, setConfig] = useState<BacktestConfig>({
    name: `Backtest ${new Date().toLocaleDateString('ar')}`,
    symbol: 'BTCUSDT',
    timeframe: '1h',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end_date: new Date().toISOString(),
    strategy_type: 'signals',
    initial_capital: 10000,
    risk_per_trade: 2,
    max_trades_per_day: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runBacktest.mutate(config);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>تشغيل Backtest جديد</CardTitle>
        </div>
        <CardDescription>
          اختبر استراتيجياتك على البيانات التاريخية لقياس الأداء
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الاختبار</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="مثال: اختبار استراتيجية BTC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">الرمز</Label>
              <Select
                value={config.symbol}
                onValueChange={(value) => setConfig({ ...config, symbol: value })}
              >
                <SelectTrigger id="symbol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SYMBOLS.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">الإطار الزمني</Label>
              <Select
                value={config.timeframe}
                onValueChange={(value) => setConfig({ ...config, timeframe: value })}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">نوع الاستراتيجية</Label>
              <Select
                value={config.strategy_type}
                onValueChange={(value: any) => setConfig({ ...config, strategy_type: value })}
              >
                <SelectTrigger id="strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">من تاريخ</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={config.start_date.slice(0, 16)}
                onChange={(e) =>
                  setConfig({ ...config, start_date: new Date(e.target.value).toISOString() })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">إلى تاريخ</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={config.end_date.slice(0, 16)}
                onChange={(e) =>
                  setConfig({ ...config, end_date: new Date(e.target.value).toISOString() })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capital">رأس المال الابتدائي ($)</Label>
              <Input
                id="capital"
                type="number"
                value={config.initial_capital}
                onChange={(e) =>
                  setConfig({ ...config, initial_capital: Number(e.target.value) })
                }
                min={100}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk">المخاطرة لكل صفقة (%)</Label>
              <Input
                id="risk"
                type="number"
                value={config.risk_per_trade}
                onChange={(e) =>
                  setConfig({ ...config, risk_per_trade: Number(e.target.value) })
                }
                min={0.5}
                max={10}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_trades">الحد الأقصى للصفقات يومياً</Label>
              <Input
                id="max_trades"
                type="number"
                value={config.max_trades_per_day}
                onChange={(e) =>
                  setConfig({ ...config, max_trades_per_day: Number(e.target.value) })
                }
                min={1}
                max={10}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={runBacktest.isPending}
          >
            {runBacktest.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                جاري التنفيذ...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                تشغيل Backtest
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
