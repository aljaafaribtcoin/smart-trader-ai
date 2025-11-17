import { Card } from "./ui/card";

const ChartSection = () => {
  return (
    <Card className="p-2.5 sm:p-3 h-[320px] sm:h-[380px] shadow-soft">
      <div className="flex items-center justify-between mb-2 text-[11px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>منطقة الشارت</span>
          <span className="px-2 py-0.5 rounded-full bg-muted border text-[10px]">
            TradingView Chart Placeholder
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-0.5 rounded-xl bg-muted text-muted-foreground border hover:border-secondary transition">
            أنماط الأسعار: قيد الفحص
          </button>
        </div>
      </div>
      <div className="w-full h-[260px] sm:h-[320px] rounded-xl bg-muted/30 border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
        <div className="text-center">
          <div className="mb-2">📊</div>
          <div>سيتم دمج شارت حقيقي (TradingView / Lightweight Charts)</div>
        </div>
      </div>
    </Card>
  );
};

export default ChartSection;
