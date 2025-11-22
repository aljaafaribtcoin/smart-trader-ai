import { Card } from "./ui/card";
import { CandlestickChart } from "./charts/CandlestickChart";
import { useTradingStore } from "@/store/tradingStore";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "./common/LoadingSkeleton";

const ChartSection = () => {
  const { selectedSymbol, selectedTimeframe } = useTradingStore();

  const { data: candles, isLoading } = useQuery({
    queryKey: ['candles', selectedSymbol, selectedTimeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_candles')
        .select('*')
        .eq('symbol', selectedSymbol)
        .eq('timeframe', selectedTimeframe)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return <LoadingSkeleton type="chart" />;
  }

  if (!candles || candles.length === 0) {
    return (
      <Card className="p-2.5 sm:p-3 h-[320px] sm:h-[380px] shadow-soft flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="mb-2 text-2xl">📊</div>
          <div className="text-sm">لا توجد بيانات شموع متاحة لـ {selectedSymbol} على فريم {selectedTimeframe}</div>
          <div className="text-xs mt-2">جاري تحميل البيانات...</div>
        </div>
      </Card>
    );
  }

  return <CandlestickChart candles={candles} symbol={selectedSymbol} timeframe={selectedTimeframe} />;
};

export default ChartSection;
