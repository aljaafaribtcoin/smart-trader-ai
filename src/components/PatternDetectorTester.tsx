import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'AVAXUSDT', 'SUIUSDT', 'SEIUSDT', '1000PEPEUSDT'];
const TIMEFRAMES = ['1d', '4h', '1h', '15m'];

export const PatternDetectorTester = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>(['1d', '4h']);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleDetect = async () => {
    if (selectedTimeframes.length === 0) {
      toast({
        title: 'خطأ',
        description: 'الرجاء اختيار إطار زمني واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setIsDetecting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('detect-patterns', {
        body: {
          symbols: [selectedSymbol],
          timeframes: selectedTimeframes,
        }
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: '✅ تم الكشف بنجاح',
        description: `تم اكتشاف ${data.patternsDetected} نمط`,
      });
    } catch (error: any) {
      console.error('Pattern detection error:', error);
      toast({
        title: 'فشل كشف الأنماط',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const toggleTimeframe = (timeframe: string) => {
    setSelectedTimeframes(prev => 
      prev.includes(timeframe) 
        ? prev.filter(t => t !== timeframe)
        : [...prev, timeframe]
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">اختبار كاشف الأنماط</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">اختر العملة</label>
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

        <div>
          <label className="text-sm font-medium mb-2 block">اختر الأطر الزمنية</label>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map(timeframe => (
              <Badge
                key={timeframe}
                variant={selectedTimeframes.includes(timeframe) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleTimeframe(timeframe)}
              >
                {timeframe}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleDetect} 
        disabled={isDetecting || selectedTimeframes.length === 0}
        className="w-full gap-2"
      >
        {isDetecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري الكشف عن الأنماط...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            ابدأ كشف الأنماط
          </>
        )}
      </Button>

      {result && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span className="font-semibold">
              {result.success ? 'تم الكشف بنجاح' : 'فشل الكشف'}
            </span>
          </div>

          {result.success && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الأنماط المكتشفة:</span>
                <span className="font-semibold">{result.patternsDetected}</span>
              </div>
              
              {result.patterns && result.patterns.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-xs text-muted-foreground">الأنماط المكتشفة:</p>
                  {result.patterns.map((pattern: any, idx: number) => (
                    <div key={idx} className="bg-background p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{pattern.pattern_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {pattern.confidence}%
                        </Badge>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{pattern.symbol}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{pattern.timeframe}</Badge>
                        <Badge 
                          variant={pattern.pattern_type === 'reversal' ? 'default' : 'outline'}
                          className="text-[10px]"
                        >
                          {pattern.pattern_type === 'reversal' ? 'انعكاس' : 'استمرار'}
                        </Badge>
                      </div>
                      {pattern.description && (
                        <p className="text-xs text-muted-foreground mt-2">{pattern.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        {pattern.target_price && (
                          <div>
                            <span className="text-muted-foreground">الهدف: </span>
                            <span className="text-success font-medium">{pattern.target_price.toFixed(2)}</span>
                          </div>
                        )}
                        {pattern.stop_loss && (
                          <div>
                            <span className="text-muted-foreground">SL: </span>
                            <span className="text-destructive font-medium">{pattern.stop_loss.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-info/10 rounded-lg text-xs text-muted-foreground">
        <p className="mb-1">💡 <strong>ملاحظة:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>يتم كشف 10 أنماط مختلفة: Head & Shoulders, Double Top/Bottom, Triangles, Wedges, Flags, Cup & Handle</li>
          <li>الأنماط ذات الثقة أعلى من 70% تحصل على تنبيهات تلقائية</li>
          <li>يتم حفظ الأنماط في قاعدة البيانات لمتابعتها</li>
        </ul>
      </div>
    </Card>
  );
};
