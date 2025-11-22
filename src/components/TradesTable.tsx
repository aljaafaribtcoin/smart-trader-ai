import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useTrades } from "@/hooks/api/useTrades";
import { useUserStore } from "@/store/userStore";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { ErrorMessage } from "./common/ErrorMessage";
import { EmptyState } from "./common/EmptyState";
import { TrendingUp } from "lucide-react";

const TradesTable = () => {
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");
  const { userId } = useUserStore();
  
  const { data: trades, isLoading, error } = useTrades(userId, activeTab);

  return (
    <Card className="p-3 sm:p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">سجل الصفقات (AI + يدوي)</h3>
        <div className="flex items-center gap-2 text-[11px]">
          <Button
            variant={activeTab === "open" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("open")}
            className={`h-auto px-2 py-1 transition-all duration-200 ${
              activeTab === "open" ? "scale-105" : "hover:scale-105"
            }`}
          >
            الصفقات المفتوحة
          </Button>
          <Button
            variant={activeTab === "closed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("closed")}
            className={`h-auto px-2 py-1 transition-all duration-200 ${
              activeTab === "closed" ? "scale-105" : "hover:scale-105"
            }`}
          >
            الصفقات المغلقة
          </Button>
        </div>
      </div>
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorMessage message="فشل تحميل الصفقات" />
      ) : trades && trades.length > 0 ? (
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
              {trades.map((trade) => {
                const pnl = trade.pnl || 0;
                const pnlPercent = trade.pnl_percentage?.toFixed(2) || '0.00';
                
                return (
                  <tr
                    key={trade.id}
                    className="bg-muted/30 hover:bg-muted/50 hover:scale-[1.01] transition-all duration-200 animate-fade-in"
                  >
                    <td className="py-1.5 pr-2 font-semibold">{trade.symbol}</td>
                    <td className={`py-1.5 font-semibold ${trade.type === 'long' ? 'text-success' : 'text-destructive'}`}>
                      {trade.type === 'long' ? 'Long' : 'Short'}
                    </td>
                    <td className="py-1.5">{trade.entry_price.toFixed(2)}</td>
                    <td className="py-1.5">{trade.stop_loss.toFixed(2)}</td>
                    <td className="py-1.5">-</td>
                    <td className={`py-1.5 font-semibold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pnl >= 0 ? '+' : ''}{pnlPercent}%
                    </td>
                    <td className="py-1.5 text-muted-foreground">{trade.ai_reason || 'تحليل AI'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="لا توجد صفقات"
          description={activeTab === 'open' ? 'لا توجد صفقات مفتوحة حالياً' : 'لا توجد صفقات مغلقة'}
        />
      )}
    </Card>
  );
};

export default TradesTable;
