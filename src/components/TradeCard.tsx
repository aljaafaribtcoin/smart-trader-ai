import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTradingStore } from "@/store/tradingStore";
import { useUserStore } from "@/store/userStore";
import { useAIAnalysis } from "@/hooks/api/useAIAnalysis";
import { useExecuteTrade } from "@/hooks/api/useTrades";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { ErrorMessage } from "./common/ErrorMessage";
import { ConfirmDialog } from "./common/ConfirmDialog";

const TradeCard = () => {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { selectedSymbol, selectedTimeframe } = useTradingStore();
  const { userId, preferences } = useUserStore();
  
  const { data: analysis, isLoading, error } = useAIAnalysis(selectedSymbol, selectedTimeframe);
  const { mutate: executeTrade, isPending: isExecuting } = useExecuteTrade();

  const handleExecuteTrade = () => {
    if (!analysis) return;
    
    const tradeType: 'long' | 'short' = analysis.signalType === 'neutral' ? 'long' : analysis.signalType;
    
    executeTrade({
      userId,
      symbol: selectedSymbol,
      type: tradeType,
      entryPrice: analysis.entryZone.min,
      stopLoss: analysis.stopLoss,
      takeProfits: analysis.takeProfits.map(tp => ({ level: 1, price: tp, percentage: 100, hit: false })),
      positionSize: analysis.positionSizing,
      leverage: preferences.defaultLeverage,
    });
    setShowConfirmDialog(false);
  };
  if (isLoading) return <LoadingSkeleton type="card" count={1} />;
  if (error) return <ErrorMessage message="فشل تحميل تحليل AI" />;
  if (!analysis) return null;

  return (
    <>
      <Card className="p-3 flex flex-col gap-3 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">صفقة AI المقترحة (Confluence)</h3>
          <p className="text-[11px] text-muted-foreground">
            تجميع إشارات المؤشرات + النماذج + السيولة + السلوك السعري
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] text-muted-foreground mb-0.5">درجة الثقة</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-success">{analysis.confidenceScore} / 100</span>
            <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
              <div style={{ width: `${analysis.confidenceScore}%` }} className="h-full bg-gradient-to-l from-success to-warning"></div>
            </div>
          </div>
        </div>
      </div>

      <Card className="flex items-center justify-between bg-muted/50 px-2.5 py-2 text-xs">
        <div>
          <div className="text-muted-foreground">نوع الصفقة المقترح</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2.5 py-1 rounded-full ${analysis.signalType === 'long' ? 'bg-success/15 text-success border-success/50' : 'bg-destructive/15 text-destructive border-destructive/50'} border font-semibold`}>
              {analysis.signalType === 'long' ? '✅ Long (شراء)' : '❌ Short (بيع)'}
            </span>
            <span className="px-2 py-1 rounded-full bg-muted border">{analysis.analysisType}</span>
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div>
            RR التقريبي: <span className="font-semibold text-success">3 : 1</span>
          </div>
          <div>
            قوة الإشارة: <span className="font-semibold text-success">قوية</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Card className="bg-muted/50 p-2 border-success/40">
          <div className="text-muted-foreground mb-0.5">منطقة الدخول</div>
          <div className="text-sm font-semibold text-success">{analysis.entryZone.min} - {analysis.entryZone.max}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            يفضل انتظار شمعة تأكيد
          </div>
        </Card>
        <Card className="bg-muted/50 p-2 border-destructive/40">
          <div className="text-muted-foreground mb-0.5">وقف الخسارة الذكي</div>
          <div className="text-sm font-semibold text-destructive">{analysis.stopLoss.toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">أسفل آخر قاع + أسفل منطقة الطلب</div>
        </Card>
        <Card className="bg-muted/50 p-2 border-warning/40">
          <div className="text-muted-foreground mb-0.5">أهداف الربح</div>
          <div className="text-[10px]">
            {analysis.takeProfits.map((tp, idx) => (
              <div key={idx}>
                TP{idx + 1}: <span className="font-semibold text-warning">{tp.toFixed(2)}</span>
                {idx < analysis.takeProfits.length - 1 && <br />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-2 mt-1 text-xs">
        <Button 
          onClick={handleExecuteTrade}
          disabled={isExecuting}
          className={`flex-1 bg-success hover:bg-success/90 text-success-foreground transition-all duration-200 ${
            isExecuting ? "animate-pulse" : "hover:scale-105"
          }`}
        >
          {isExecuting ? "⏳ جاري التنفيذ..." : "تنفيذ صفقة Long مقترحة"}
        </Button>
        <Button variant="outline" className="transition-all duration-200 hover:scale-105">
          تعديل يدوي
        </Button>
      </div>
    </Card>
    
    <ConfirmDialog
      open={showConfirmDialog}
      onOpenChange={setShowConfirmDialog}
      title="تأكيد تنفيذ الصفقة"
      description={`هل أنت متأكد من تنفيذ صفقة ${analysis.signalType === 'long' ? 'Long' : 'Short'} على ${selectedSymbol}؟`}
      confirmLabel="تنفيذ"
      onConfirm={handleExecuteTrade}
    />
  </>
  );
};

export default TradeCard;
