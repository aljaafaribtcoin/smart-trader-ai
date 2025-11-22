import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useTradingStore } from "@/store/tradingStore";
import { useTrendAnalysis, useMomentumIndicators } from "@/hooks/api/useMarketData";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { useAnalyzeSymbol } from "@/hooks/api/useAIAnalysis";

const AIAnalysis = () => {
  const { selectedSymbol, selectedTimeframe } = useTradingStore();
  const { data: trendData, isLoading: trendLoading } = useTrendAnalysis(selectedSymbol);
  const { data: momentumData, isLoading: momentumLoading } = useMomentumIndicators(selectedSymbol, selectedTimeframe);
  const { mutate: analyzeSymbol, isPending: isAnalyzing } = useAnalyzeSymbol();

  const isLoading = trendLoading || momentumLoading;

  if (isLoading) return <LoadingSkeleton type="card" count={1} />;

  if (!trendData || trendData.length === 0 || !momentumData) {
    return (
      <Card className="p-3 flex-1 flex flex-col gap-2 text-[11px] shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground">ملخص تحليلي</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-auto px-2 py-0.5 text-[10px]"
            onClick={() => analyzeSymbol({ symbol: selectedSymbol, timeframe: selectedTimeframe })}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "جاري التحليل..." : "تحليل بالذكاء الاصطناعي"}
          </Button>
        </div>
        <p className="text-center text-muted-foreground py-4">
          لا توجد بيانات كافية للتحليل
        </p>
      </Card>
    );
  }

  // Analyze trend data
  const currentTrend = trendData.find(t => t.timeframe === selectedTimeframe);
  const bullishFrames = trendData.filter(t => t.direction === 'bullish');
  const bearishFrames = trendData.filter(t => t.direction === 'bearish');

  // Generate insights
  const insights = [];
  
  if (momentumData.macd.trend === 'bullish') {
    insights.push(`تقاطع إيجابي في MACD على فريم ${selectedTimeframe} مع تحسن في الزخم`);
  } else if (momentumData.macd.trend === 'bearish') {
    insights.push(`تقاطع سلبي في MACD على فريم ${selectedTimeframe}`);
  }

  if (momentumData.rsiSignal === 'oversold') {
    insights.push(`RSI في منطقة التشبع البيعي (${momentumData.rsi.toFixed(1)})، إشارة ارتداد محتملة`);
  } else if (momentumData.rsiSignal === 'overbought') {
    insights.push(`RSI في منطقة التشبع الشرائي (${momentumData.rsi.toFixed(1)})، إشارة تصحيح محتملة`);
  }

  if (momentumData.stochastic.signal === 'oversold') {
    insights.push(`Stochastic في منطقة التشبع البيعي، قد يشير لفرصة شراء قصيرة الأجل`);
  } else if (momentumData.stochastic.signal === 'overbought') {
    insights.push(`Stochastic في منطقة التشبع الشرائي، احتمالية تصحيح قريب`);
  }

  let conclusion = "";
  let conclusionColor = "text-warning";

  if (bullishFrames.length > bearishFrames.length) {
    conclusion = "الاتجاه العام يميل للصعود على معظم الفريمات. مناسب للصفقات الطويلة مع وقف خسارة محكم";
    conclusionColor = "text-success";
  } else if (bearishFrames.length > bullishFrames.length) {
    conclusion = "الاتجاه العام يميل للهبوط على معظم الفريمات. يفضل الحذر أو البيع على المكشوف";
    conclusionColor = "text-destructive";
  } else {
    conclusion = "السوق في حالة تذبذب. يفضل انتظار إشارات أوضح قبل الدخول";
    conclusionColor = "text-warning";
  }

  return (
    <Card className="p-3 flex-1 flex flex-col gap-2 text-[11px] shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">ملخص تحليلي من البيانات الحقيقية</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-auto px-2 py-0.5 text-[10px]"
          onClick={() => analyzeSymbol({ symbol: selectedSymbol, timeframe: selectedTimeframe })}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "⏳" : "إعادة التحليل"}
        </Button>
      </div>
      
      <p className="text-foreground leading-relaxed">
        {selectedSymbol} يظهر
        <span className={`font-semibold ${currentTrend?.signalColor || 'text-muted-foreground'}`}>
          {' '}{currentTrend?.signal || 'إشارات متباينة'}{' '}
        </span>
        على فريم {selectedTimeframe}. التحليل الفني يشير إلى توازن بين {bullishFrames.length} فريم صاعد و {bearishFrames.length} فريم هابط.
      </p>

      {insights.length > 0 && (
        <ul className="list-disc pr-4 space-y-1 text-muted-foreground">
          {insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      )}

      <p className="text-foreground">
        <span className={`font-semibold ${conclusionColor}`}>الخلاصة:</span> {conclusion}
      </p>
    </Card>
  );
};

export default AIAnalysis;
