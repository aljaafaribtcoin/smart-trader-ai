import { Button } from "./ui/button";
import { Card } from "./ui/card";

const TradesTable = () => {
  const trades = [
    {
      symbol: "AVAXUSDT",
      type: "Long",
      typeColor: "text-success",
      entry: "14.45",
      stop: "14.18",
      target: "15.30",
      pnl: "+3.2%",
      pnlColor: "text-success",
      reason: "ارتداد من منطقة طلب + خروج RSI من التشبع البيعي + زيادة الفوليوم.",
    },
    {
      symbol: "BTCUSDT",
      type: "Short",
      typeColor: "text-destructive",
      entry: "69,500",
      stop: "70,200",
      target: "67,800",
      pnl: "-1.1%",
      pnlColor: "text-destructive",
      reason: "رفض قوي عند مقاومة أسبوعية مع دايفرجنس سلبي في MACD.",
    },
  ];

  return (
    <Card className="p-3 sm:p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">سجل الصفقات (AI + يدوي)</h3>
        <div className="flex items-center gap-2 text-[11px]">
          <Button variant="secondary" size="sm" className="h-auto px-2 py-1">
            الصفقات المفتوحة
          </Button>
          <Button variant="ghost" size="sm" className="h-auto px-2 py-1">
            الصفقات المغلقة
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto text-[11px]">
        <table className="min-w-full border-separate border-spacing-y-1">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-right py-1.5 pr-2">العملة</th>
              <th className="text-right py-1.5">نوع الصفقة</th>
              <th className="text-right py-1.5">الدخول</th>
              <th className="text-right py-1.5">الوقف</th>
              <th className="text-right py-1.5">الهدف</th>
              <th className="text-right py-1.5">الربح/الخسارة</th>
              <th className="text-right py-1.5">سبب الدخول (AI)</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr
                key={index}
                className={`transition ${
                  index === 0 ? "bg-muted/50 hover:bg-muted/70" : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <td className="py-1.5 pr-2 font-semibold">{trade.symbol}</td>
                <td className={`py-1.5 font-semibold ${trade.typeColor}`}>{trade.type}</td>
                <td className="py-1.5">{trade.entry}</td>
                <td className="py-1.5">{trade.stop}</td>
                <td className="py-1.5">{trade.target}</td>
                <td className={`py-1.5 font-semibold ${trade.pnlColor}`}>{trade.pnl}</td>
                <td className="py-1.5 text-muted-foreground">{trade.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TradesTable;
