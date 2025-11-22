import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/api/useAccount";
import { useWatchlist } from "@/hooks/api/useWatchlist";
import { useTradingStore } from "@/store/tradingStore";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { ErrorMessage } from "./common/ErrorMessage";

const AccountSidebar = () => {
  const { toast } = useToast();
  const { selectedSymbol, setSymbol } = useTradingStore();
  
  const { data: account, isLoading: accountLoading, error: accountError } = useAccount();
  const { data: watchlist, isLoading: watchlistLoading, error: watchlistError } = useWatchlist();

  const handleSymbolClick = (symbol: string, timeframe: string) => {
    setSymbol(symbol);
    toast({
      title: "تم تغيير العملة",
      description: `جاري تحميل بيانات ${symbol}`,
    });
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:col-span-2 gap-3">
      {/* Account Card */}
      {accountLoading ? (
        <LoadingSkeleton type="card" count={1} />
      ) : accountError ? (
        <ErrorMessage message="فشل تحميل بيانات الحساب" />
      ) : account ? (
        <Card className="p-3 flex flex-col gap-2 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground">حالة الحساب</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
              {account.exchange}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Equity</div>
            <div className="text-lg font-semibold">$ {account.equity.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
            <Card className="bg-muted/30 px-2 py-1.5">
              <div className="text-muted-foreground">الصفقات المفتوحة</div>
              <div className="font-semibold text-warning">{account.open_trades}</div>
            </Card>
            <Card className="bg-muted/30 px-2 py-1.5">
              <div className="text-muted-foreground">نسبة الربح</div>
              <div className="font-semibold text-success">{account.win_rate}%</div>
            </Card>
          </div>
        </Card>
      ) : null}

      {/* Watchlist Card */}
      <Card className="p-3 flex-1 flex flex-col gap-2 shadow-soft">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-semibold text-muted-foreground">قائمة المراقبة</h2>
          <button className="text-[10px] text-secondary">تعديل</button>
        </div>

        {watchlistLoading ? (
          <LoadingSkeleton type="list" count={3} />
        ) : watchlistError ? (
          <ErrorMessage message="فشل تحميل قائمة المراقبة" />
        ) : watchlist && watchlist.length > 0 ? (
          <div className="space-y-1.5 text-xs">
            {watchlist.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSymbolClick(item.symbol, item.timeframe)}
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
                  <div className={`font-semibold text-sm ${(item.change_percentage || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {item.price}
                  </div>
                  <div className={`text-[10px] ${(item.change_percentage || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {(item.change_percentage || 0) >= 0 ? '+' : ''}{(item.change_percentage || 0).toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-4">
            لا توجد عملات في قائمة المراقبة
          </div>
        )}
      </Card>
    </aside>
  );
};

export default AccountSidebar;
