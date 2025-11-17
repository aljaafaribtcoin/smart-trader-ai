import { Button } from "./ui/button";
import { Card } from "./ui/card";

const CurrencySelector = () => {
  const timeframes = ["5m", "15m", "1H", "4H", "1D"];
  const frameSignals = [
    { tf: "5m", signal: "تذبذب", color: "text-warning" },
    { tf: "15m", signal: "إشارة شراء", color: "text-success" },
    { tf: "1H", signal: "ضعيف صاعد", color: "text-warning" },
    { tf: "4H", signal: "هابط", color: "text-destructive" },
  ];

  return (
    <Card className="px-3 sm:px-4 py-2.5 flex flex-col gap-3 shadow-soft">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold">AVAX / USDT</h2>
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
            {timeframes.map((tf, index) => (
              <button
                key={tf}
                className={`px-2.5 py-1.5 border-l border-border last:border-l-0 transition ${
                  tf === "1D"
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <Button className="px-3 sm:px-4 py-1.5 h-auto rounded-2xl bg-gradient-primary text-xs sm:text-sm font-semibold shadow-glow border border-success/50">
            🚀 تحليل AI للفريمات الآن
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-[11px]">
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
          <span className="text-muted-foreground mb-1">اتجاه الفريمات</span>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div className="w-3/4 h-full bg-gradient-to-l from-success to-warning"></div>
          </div>
          <span className="mt-1 text-success font-semibold">تميل للصعود</span>
        </div>

        {frameSignals.map((frame) => (
          <Card key={frame.tf} className="flex flex-col items-center bg-muted/30 px-2 py-1.5">
            <span className="text-muted-foreground">{frame.tf}</span>
            <span className={`font-semibold ${frame.color}`}>{frame.signal}</span>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default CurrencySelector;
