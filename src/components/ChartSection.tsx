import { TradingViewChart } from "./charts/TradingViewChart";
import { useTradingStore } from "@/store/tradingStore";

const ChartSection = () => {
  const { selectedSymbol, selectedTimeframe } = useTradingStore();

  return <TradingViewChart symbol={selectedSymbol} timeframe={selectedTimeframe} />;
};

export default ChartSection;
