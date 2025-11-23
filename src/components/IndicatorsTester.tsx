import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCalculateIndicators } from '@/hooks/useTechnicalIndicators';
import { Loader2, Play, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'CAKEUSDT', 'AVAXUSDT', 'SUIUSDT', 'SEIUSDT', '1000PEPEUSDT'];
const TIMEFRAMES = ['3m', '5m', '15m', '1H', '4H', '1D'];

export const IndicatorsTester = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<Array<{ symbol: string; timeframe: string; success: boolean; error?: string }>>([]);
  
  const calculateIndicators = useCalculateIndicators();
  const { toast } = useToast();

  const handleCalculate = async () => {
    setIsCalculating(true);
    setResults([]);

    try {
      const result = await calculateIndicators(selectedSymbol, selectedTimeframe);
      
      setResults([{
        symbol: selectedSymbol,
        timeframe: selectedTimeframe,
        success: result.success,
        error: result.error
      }]);

      if (result.success) {
        toast({
          title: '✅ تم حساب المؤشرات بنجاح',
          description: `${selectedSymbol} • ${selectedTimeframe}`,
        });
      } else {
        toast({
          title: '❌ فشل حساب المؤشرات',
          description: result.error || 'حدث خطأ غير معروف',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResults([{
        symbol: selectedSymbol,
        timeframe: selectedTimeframe,
        success: false,
        error: errorMsg
      }]);

      toast({
        title: '❌ خطأ في الحساب',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculateAll = async () => {
    setIsCalculating(true);
    setResults([]);

    const newResults: Array<{ symbol: string; timeframe: string; success: boolean; error?: string }> = [];

    for (const symbol of SYMBOLS) {
      for (const timeframe of TIMEFRAMES) {
        try {
          const result = await calculateIndicators(symbol, timeframe);
          newResults.push({
            symbol,
            timeframe,
            success: result.success,
            error: result.error
          });
          setResults([...newResults]);
        } catch (error) {
          newResults.push({
            symbol,
            timeframe,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          setResults([...newResults]);
        }
      }
    }

    setIsCalculating(false);

    const successful = newResults.filter(r => r.success).length;
    const failed = newResults.filter(r => !r.success).length;

    toast({
      title: 'اكتمل الحساب الشامل',
      description: `نجح: ${successful} • فشل: ${failed}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">اختبار حساب المؤشرات الفنية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">الرمز</label>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYMBOLS.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الفريم</label>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map(tf => (
                  <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1"
          >
            {isCalculating ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <Play className="w-4 h-4 ml-2" />
            )}
            حساب المؤشرات
          </Button>

          <Button
            onClick={handleCalculateAll}
            disabled={isCalculating}
            variant="outline"
            className="flex-1"
          >
            {isCalculating ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <Play className="w-4 h-4 ml-2" />
            )}
            حساب الكل
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
            <h4 className="text-sm font-semibold">النتائج:</h4>
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-accent/30 text-sm"
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="font-mono">{result.symbol}</span>
                  <Badge variant="outline" className="text-xs">{result.timeframe}</Badge>
                </div>
                {result.error && (
                  <span className="text-xs text-destructive truncate max-w-[200px]">
                    {result.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
