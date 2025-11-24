import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, CheckCircle, XCircle, Loader2, TrendingUp } from 'lucide-react';
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

export const SignalGenerator = () => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['BTCUSDT', 'ETHUSDT']);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>(['1d', '4h']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (selectedSymbols.length === 0 || selectedTimeframes.length === 0) {
      toast({
        title: 'خطأ',
        description: 'الرجاء اختيار عملة وإطار زمني واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-trading-signals', {
        body: {
          symbols: selectedSymbols,
          timeframes: selectedTimeframes,
        },
      });

      if (error) throw error;

      setResult(data);

      toast({
        title: '✅ تم التوليد بنجاح',
        description: `تم توليد ${data.signalsGenerated} توصية جديدة`,
      });
    } catch (error: any) {
      console.error('Signal generation error:', error);
      
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast({
          title: 'تم تجاوز الحد المسموح',
          description: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
          variant: 'destructive',
        });
      } else if (error.message?.includes('402') || error.message?.includes('Payment')) {
        toast({
          title: 'مطلوب دفع',
          description: 'يرجى إضافة رصيد إلى حساب Lovable الخاص بك.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'فشل توليد التوصيات',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const toggleTimeframe = (timeframe: string) => {
    setSelectedTimeframes((prev) =>
      prev.includes(timeframe) ? prev.filter((t) => t !== timeframe) : [...prev, timeframe]
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Wand2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            مولد التوصيات الذكي
            <Badge variant="default" className="text-xs">
              AI Powered
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            توليد توصيات تداول ذكية مبنية على المؤشرات والأنماط
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">اختر العملات</label>
          <div className="flex flex-wrap gap-2">
            {SYMBOLS.map((symbol) => (
              <Badge
                key={symbol}
                variant={selectedSymbols.includes(symbol) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1"
                onClick={() => toggleSymbol(symbol)}
              >
                {symbol}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">اختر الأطر الزمنية</label>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((timeframe) => (
              <Badge
                key={timeframe}
                variant={selectedTimeframes.includes(timeframe) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1"
                onClick={() => toggleTimeframe(timeframe)}
              >
                {timeframe}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || selectedSymbols.length === 0 || selectedTimeframes.length === 0}
        className="w-full gap-2 h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري توليد التوصيات بالذكاء الاصطناعي...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            توليد توصيات ذكية الآن
          </>
        )}
      </Button>

      {result && (
        <div className="mt-6 p-4 bg-background rounded-lg border">
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

          {result.success && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">عدد التوصيات المولدة:</span>
                <span className="font-semibold text-lg">{result.signalsGenerated}</span>
              </div>

              {result.signals && result.signals.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-xs text-muted-foreground mb-3">
                    ملخص التوصيات:
                  </p>
                  {result.signals.map((signal: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-muted/50 p-3 rounded border hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={signal.direction === 'LONG' ? 'default' : 'destructive'}
                            className="text-xs font-bold"
                          >
                            {signal.direction}
                          </Badge>
                          <span className="font-medium">{signal.symbol}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {signal.confidence}% ثقة
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-muted-foreground">دخول: </span>
                          <span className="font-medium">
                            {signal.entry_from.toFixed(2)} - {signal.entry_to.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">R:R: </span>
                          <span className="font-medium text-success">1:{signal.risk_reward.toFixed(1)}</span>
                        </div>
                      </div>
                      {signal.tags && signal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {signal.tags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
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
        </div>
      )}

      <div className="mt-4 p-3 bg-info/10 rounded-lg text-xs text-muted-foreground">
        <p className="mb-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <strong>كيف يعمل:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>يحلل المؤشرات الفنية (RSI, MACD, EMA, Bollinger Bands)</li>
          <li>يأخذ بعين الاعتبار الأنماط المكتشفة تلقائياً</li>
          <li>يستخدم الذكاء الاصطناعي لتوليد توصيات دقيقة</li>
          <li>يحدد نقاط دخول/خروج مثالية مع نسبة مخاطرة/عائد جيدة</li>
        </ul>
      </div>
    </Card>
  );
};
