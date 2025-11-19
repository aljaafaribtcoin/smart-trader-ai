import { Card } from "./ui/card";
import { usePatterns } from "@/hooks/api/usePatterns";
import { useTradingStore } from "@/store/tradingStore";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { ErrorMessage } from "./common/ErrorMessage";
import { EmptyState } from "./common/EmptyState";
import { TrendingUp } from "lucide-react";

const PatternScanner = () => {
  const { selectedSymbol } = useTradingStore();
  const { data: patterns, isLoading, error } = usePatterns(selectedSymbol);

  return (
    <Card className="p-3 flex flex-col gap-2 text-[11px] shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">النماذج الفنية المكتشفة تلقائياً</h3>
        <span className="px-2 py-0.5 rounded-xl bg-muted border text-[10px]">Auto Pattern Scanner</span>
      </div>
      
      {isLoading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : error ? (
        <ErrorMessage message="فشل تحميل النماذج الفنية" />
      ) : patterns && patterns.length > 0 ? (
        <div className="space-y-1.5">
          {patterns.map((pattern, index) => {
            const signalColor = pattern.signal === 'bullish' 
              ? 'bg-success/10 text-success border-success/40'
              : pattern.signal === 'bearish'
              ? 'bg-destructive/10 text-destructive border-destructive/40'
              : 'bg-warning/10 text-warning border-warning/40';
              
            return (
              <div
                key={pattern.id}
                className={`flex items-center justify-between rounded-xl px-2 py-1.5 border ${
                  index === 0 ? "bg-muted/50" : "bg-muted/30"
                }`}
              >
                <div>
                  <div className="font-semibold">{pattern.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    فريم {pattern.timeframe} - القوة: {pattern.strength}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full border ${signalColor}`}>
                  {pattern.signal === 'bullish' ? 'إشارة صعود' : pattern.signal === 'bearish' ? 'إشارة هبوط' : 'تحت المراقبة'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="لا توجد نماذج فنية"
          description="لم يتم اكتشاف أي نماذج فنية على هذا الرمز"
        />
      )}
    </Card>
  );
};

export default PatternScanner;
