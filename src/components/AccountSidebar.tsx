import { useState } from "react";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

const AccountSidebar = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const { toast } = useToast();

  const watchlist = [
    { symbol: "BTCUSDT", timeframe: "1H", price: "68,420", change: "+2.3%", positive: true },
    { symbol: "AVAXUSDT", timeframe: "15m", price: "14.82", change: "-1.9%", positive: false },
    { symbol: "SEIUSDT", timeframe: "4H", price: "0.17", change: "-4.5%", positive: false },
  ];

  const handleSymbolClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    toast({
      title: "تم تغيير العملة",
      description: `جاري تحميل بيانات ${symbol}`,
    });
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:col-span-2 gap-3">
      <Card className="p-3 flex flex-col gap-2 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground">حالة الحساب</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
            Real
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Equity</div>
          <div className="text-lg font-semibold">$ 12,540.23</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
          <Card className="bg-muted/30 px-2 py-1.5">
            <div className="text-muted-foreground">الصفقات المفتوحة</div>
            <div className="font-semibold text-warning">3</div>
          </Card>
          <Card className="bg-muted/30 px-2 py-1.5">
            <div className="text-muted-foreground">نسبة الربح</div>
            <div className="font-semibold text-success">68%</div>
          </Card>
        </div>
      </Card>

      <Card className="p-3 flex-1 flex flex-col gap-2 shadow-soft">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-semibold text-muted-foreground">قائمة المراقبة</h2>
          <button className="text-[10px] text-secondary">تعديل</button>
        </div>

        <div className="space-y-1.5 text-xs">
          {watchlist.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSymbolClick(item.symbol)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl border transition-all duration-200 ${
                selectedSymbol === item.symbol
                  ? "bg-muted/50 border-secondary scale-105 shadow-glow"
                  : "bg-muted/20 border-border hover:border-secondary/60 hover:scale-102"
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{item.symbol}</span>
                <span className="text-[10px] text-muted-foreground">فريم {item.timeframe}</span>
              </div>
              <div className="text-right">
                <div className={`font-semibold text-sm ${item.positive ? "text-success" : "text-destructive"}`}>
                  {item.price}
                </div>
                <div className={`text-[10px] ${item.positive ? "text-success" : "text-destructive"}`}>
                  {item.change}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </aside>
  );
};

export default AccountSidebar;
