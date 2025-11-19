import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TradingState {
  selectedSymbol: string;
  selectedTimeframe: string;
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: string) => void;
  resetSelection: () => void;
}

const DEFAULT_SYMBOL = 'BTCUSDT';
const DEFAULT_TIMEFRAME = '1h';

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      selectedSymbol: DEFAULT_SYMBOL,
      selectedTimeframe: DEFAULT_TIMEFRAME,
      
      setSymbol: (symbol) => set({ selectedSymbol: symbol }),
      
      setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
      
      resetSelection: () => set({ 
        selectedSymbol: DEFAULT_SYMBOL, 
        selectedTimeframe: DEFAULT_TIMEFRAME 
      }),
    }),
    {
      name: 'trading-storage',
    }
  )
);
