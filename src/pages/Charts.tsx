import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { CandlestickChart } from '@/components/charts/CandlestickChart';
import { IndicatorsPanel } from '@/components/charts/IndicatorsPanel';
import { VolumeChart } from '@/components/charts/VolumeChart';
import CurrencySelector from '@/components/CurrencySelector';
import { useTradingStore } from '@/store/tradingStore';
import { supabaseMarketService } from '@/services/api/supabaseMarketService';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { toast } from 'sonner';

const Charts = () => {
  const { selectedSymbol, selectedTimeframe, setTimeframe } = useTradingStore();
  const [candles, setCandles] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const timeframes = [
    { value: '1m', label: '1د' },
    { value: '5m', label: '5د' },
    { value: '15m', label: '15د' },
    { value: '30m', label: '30د' },
    { value: '1h', label: '1س' },
    { value: '4h', label: '4س' },
    { value: '1d', label: '1ي' },
  ];

  const fetchChartData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      // Fetch candles from edge function
      await supabaseMarketService.fetchCandles(selectedSymbol, selectedTimeframe, 200);
      
      // Wait a bit for data to be stored
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch from database
      const { data: candlesData, error: candlesError } = await supabase
        .from('market_candles')
        .select('*')
        .eq('symbol', selectedSymbol)
        .eq('timeframe', selectedTimeframe)
        .order('timestamp', { ascending: true })
        .limit(200);

      if (candlesError) throw candlesError;
      setCandles(candlesData || []);

      // Calculate indicators
      if (candlesData && candlesData.length > 50) {
        await supabaseMarketService.calculateIndicators(selectedSymbol, selectedTimeframe);
        
        // Fetch indicators
        const { data: indicatorsData, error: indicatorsError } = await supabase
          .from('technical_indicators')
          .select('*')
          .eq('symbol', selectedSymbol)
          .eq('timeframe', selectedTimeframe)
          .single();

        if (!indicatorsError && indicatorsData) {
          setIndicators(indicatorsData);
        }
      }

      if (showToast) {
        toast.success('تم تحديث البيانات بنجاح');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      if (showToast) {
        toast.error('فشل تحديث البيانات');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedSymbol, selectedTimeframe]);

  const handleRefresh = () => {
    fetchChartData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold mb-1">الرسوم البيانية المتقدمة</h2>
            <p className="text-sm text-muted-foreground">
              تحليل الشموع اليابانية والمؤشرات الفنية
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CurrencySelector />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? '⏳' : '🔄'} تحديث
            </Button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <Card className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground ml-2">الإطار الزمني:</span>
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className="min-w-[60px]"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Charts Section */}
        <Tabs defaultValue="candles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="candles">الشموع اليابانية</TabsTrigger>
            <TabsTrigger value="indicators">المؤشرات الفنية</TabsTrigger>
            <TabsTrigger value="volume">حجم التداول</TabsTrigger>
          </TabsList>

          <TabsContent value="candles" className="space-y-4">
            <CandlestickChart 
              candles={candles} 
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
            />
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4">
            <IndicatorsPanel 
              indicators={indicators}
              candles={candles}
              symbol={selectedSymbol}
            />
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            <VolumeChart 
              candles={candles}
              symbol={selectedSymbol}
            />
          </TabsContent>
        </Tabs>

        {/* Market Info */}
        {candles.length > 0 && (
          <Card className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">السعر الحالي</span>
                <span className="font-bold text-lg">
                  ${parseFloat(candles[candles.length - 1].close).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">أعلى سعر</span>
                <span className="font-semibold text-success">
                  ${Math.max(...candles.map(c => parseFloat(c.high))).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">أقل سعر</span>
                <span className="font-semibold text-destructive">
                  ${Math.min(...candles.map(c => parseFloat(c.low))).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">عدد الشموع</span>
                <span className="font-semibold">{candles.length}</span>
              </div>
            </div>
          </Card>
        )}

        {candles.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">لا توجد بيانات متاحة</h3>
            <p className="text-sm text-muted-foreground mb-4">
              اضغط على زر التحديث لجلب البيانات من Bybit
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? 'جاري التحميل...' : 'تحديث البيانات'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Charts;
