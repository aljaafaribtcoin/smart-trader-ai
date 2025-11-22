import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface TradingViewChartProps {
  symbol: string;
  timeframe: string;
}

// Convert timeframe to TradingView format
const convertTimeframe = (tf: string): string => {
  const map: Record<string, string> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1h': '60',
    '4h': '240',
    '1d': 'D',
    '1w': 'W',
  };
  return map[tf] || '60';
};

export const TradingViewChart = ({ symbol, timeframe }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BYBIT:${symbol}`,
          interval: convertTimeframe(timeframe),
          timezone: 'Asia/Riyadh',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          style: '1',
          locale: 'ar_AE',
          toolbar_bg: 'hsl(var(--background))',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: containerRef.current.id,
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies',
          ],
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          save_image: false,
          details: true,
          hotlist: false,
          calendar: false,
        });
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, timeframe]);

  return (
    <Card className="p-2.5 sm:p-3 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between mb-2 text-[11px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>شارت TradingView</span>
          <span className="px-2 py-0.5 rounded-full bg-muted border text-[10px]">
            {symbol} • {timeframe}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-0.5 rounded-xl bg-success/20 text-success border border-success/50 text-[10px]">
            ✓ بيانات حقيقية من TradingView
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        id={`tradingview_${symbol}_${timeframe}`}
        className="h-[320px] sm:h-[480px] rounded-lg overflow-hidden"
      />
    </Card>
  );
};
