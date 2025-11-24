import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Play, CheckCircle, XCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'AVAXUSDT', 'SUIUSDT'];
const TIMEFRAMES = ['1d', '4h', '1h'];

export const SignalGeneratorTester = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-trading-signals', {
        body: {
          symbols: [selectedSymbol],
          timeframes: [selectedTimeframe],
        },
      });

      if (error) throw error;

      setResult(data);

      toast({
        title: '✅ تم التوليد بنجاح',
        description: `تم توليد ${data.signalsGenerated} توصية`,
      });
    } catch (error: any) {
      console.error('Signal generation error:', error);
      toast({
        title: 'فشل توليد التوصيات',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">اختبار مولد التوصيات الذكي</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">اختر العملة</label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">اختر الإطار الزمني</label>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((timeframe) => (
                <SelectItem key={timeframe} value={timeframe}>
                  {timeframe}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التوليد بالذكاء الاصطناعي...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            توليد توصية ذكية
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
              {result.success ? 'تم التوليد بنجاح' : 'فشل التوليد'}
            </span>
          </div>

          {result.success && result.signals && result.signals.length > 0 && (
            <div className="space-y-3">
              {result.signals.map((signal: any, idx: number) => (
                <div key={idx} className="bg-background p-4 rounded border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={signal.direction === 'LONG' ? 'default' : 'destructive'}
                        className="text-sm font-bold"
                      >
                        {signal.direction}
                      </Badge>
                      <span className="font-semibold text-lg">{signal.symbol}</span>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {signal.confidence}% ثقة
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="bg-accent/10 p-2 rounded">
                      <p className="text-xs text-muted-foreground mb-1">منطقة الدخول</p>
                      <p className="font-medium">
                        {signal.entry_from.toFixed(2)} - {signal.entry_to.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded">
                      <p className="text-xs text-muted-foreground mb-1">نسبة R:R</p>
                      <p className="font-medium text-primary">1:{signal.risk_reward.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div className="bg-success/10 p-2 rounded text-center">
                      <p className="text-muted-foreground mb-1">TP1</p>
                      <p className="font-medium text-success">{signal.tp1.toFixed(2)}</p>
                    </div>
                    <div className="bg-success/10 p-2 rounded text-center">
                      <p className="text-muted-foreground mb-1">TP2</p>
                      <p className="font-medium text-success">{signal.tp2.toFixed(2)}</p>
                    </div>
                    <div className="bg-success/10 p-2 rounded text-center">
                      <p className="text-muted-foreground mb-1">TP3</p>
                      <p className="font-medium text-success">{signal.tp3.toFixed(2)}</p>
                    </div>
                    <div className="bg-destructive/10 p-2 rounded text-center">
                      <p className="text-muted-foreground mb-1">SL</p>
                      <p className="font-medium text-destructive">{signal.stop_loss.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-muted/50 p-3 rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        السيناريو الرئيسي
                      </p>
                      <p className="text-xs leading-relaxed">{signal.main_scenario}</p>
                    </div>

                    {signal.alternative_scenario && (
                      <div className="bg-muted/30 p-3 rounded border-dashed border">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          السيناريو البديل
                        </p>
                        <p className="text-xs leading-relaxed">{signal.alternative_scenario}</p>
                      </div>
                    )}
                  </div>

                  {signal.supporting_factors && signal.supporting_factors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        العوامل الداعمة:
                      </p>
                      <ul className="space-y-1">
                        {signal.supporting_factors.map((factor: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-success">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {signal.tags && signal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {signal.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-info/10 rounded-lg text-xs text-muted-foreground">
        <p className="mb-1">
          <strong>💡 ملاحظة:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>يحلل المؤشرات الفنية والأنماط المكتشفة باستخدام AI</li>
          <li>يولد نقاط دخول وخروج دقيقة مع تحليل شامل</li>
          <li>يحسب نسبة المخاطرة للعائد تلقائياً</li>
          <li>يوفر سيناريوهات رئيسية وبديلة للتداول</li>
        </ul>
      </div>
    </Card>
  );
};
