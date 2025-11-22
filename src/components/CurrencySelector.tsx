import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTradingStore } from "@/store/tradingStore";
import { useAnalyzeSymbol } from "@/hooks/api/useAIAnalysis";

import { useTrendAnalysis } from "@/hooks/api/useMarketData";

const CurrencySelector = () => {
  const { toast } = useToast();
  const { selectedSymbol, selectedTimeframe, setTimeframe } = useTradingStore();
  const { mutate: analyzeSymbol, isPending: isAnalyzing } = useAnalyzeSymbol();
  const { data: trendData } = useTrendAnalysis(selectedSymbol);

  const timeframes = ["5m", "15m", "1h", "4h"];
  
  // Map trend data to frame signals
  const frameSignals = timeframes.map(tf => {
    const trend = trendData?.find(t => t.timeframe === tf);
    if (!trend) {
      return { tf, signal: "لا توجد بيانات", color: "text-muted-foreground" };
    }
    
    return {
      tf,
      signal: trend.signal,
      color: trend.signalColor,
    };
  });

  // Calculate overall trend
  const bullishCount = trendData?.filter(t => t.direction === 'bullish').length || 0;
  const bearishCount = trendData?.filter(t => t.direction === 'bearish').length || 0;
  const totalFrames = trendData?.length || 1;
  const bullishPercentage = (bullishCount / totalFrames) * 100;

  let trendLabel = "محايد";
  let trendColor = "text-warning";
  if (bullishPercentage >= 70) {
    trendLabel = "صاعد قوي";
    trendColor = "text-success";
  } else if (bullishPercentage >= 50) {
    trendLabel = "تميل للصعود";
    trendColor = "text-success";
  } else if (bullishPercentage <= 30) {
    trendLabel = "هابط قوي";
    trendColor = "text-destructive";
  } else if (bullishPercentage < 50) {
    trendLabel = "تميل للهبوط";
    trendColor = "text-destructive";
  }

  const handleAnalyze = () => {
    analyzeSymbol({ symbol: selectedSymbol, timeframe: selectedTimeframe });
  };

  return (
    <Card className="px-3 sm:px-4 py-2.5 flex flex-col gap-3 shadow-soft">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold">{selectedSymbol.replace('USDT', ' / USDT')}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                Futures 10x
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              خبير الذكاء الاصطناعي: يراقب جميع الفريمات والنماذج والزخم والسيولة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-muted rounded-xl border text-[11px] overflow-hidden">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 border-l border-border last:border-l-0 transition-all duration-200 ${
                  tf === selectedTimeframe
                    ? "bg-primary/20 text-primary font-semibold scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`px-3 sm:px-4 py-1.5 h-auto rounded-2xl bg-gradient-primary text-xs sm:text-sm font-semibold shadow-glow border border-success/50 transition-all duration-300 ${
              isAnalyzing ? "animate-pulse" : "hover:scale-105"
            }`}
          >
            {isAnalyzing ? "⏳ جاري التحليل..." : "🚀 تحليل AI للفريمات الآن"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-[11px]">
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
          <span className="text-muted-foreground mb-1">اتجاه الفريمات</span>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                bullishPercentage >= 50 
                  ? 'bg-gradient-to-l from-success to-warning' 
                  : 'bg-gradient-to-l from-destructive to-warning'
              }`}
              style={{ width: `${Math.max(bullishPercentage, 100 - bullishPercentage)}%` }}
            ></div>
          </div>
          <span className={`mt-1 font-semibold ${trendColor}`}>{trendLabel}</span>
        </div>

        {frameSignals.map((frame) => (
          <Card key={frame.tf} className="flex flex-col items-center bg-muted/30 px-2 py-1.5">
            <span className="text-muted-foreground">{frame.tf}</span>
            <span className={`font-semibold text-[10px] ${frame.color}`}>{frame.signal}</span>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default CurrencySelector;
