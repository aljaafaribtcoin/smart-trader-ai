import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import AccountSidebar from "@/components/AccountSidebar";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useMarketDataInitializer } from "@/hooks/useMarketDataInitializer";
import { useAutoRefreshMarketData } from "@/hooks/useAutoRefreshMarketData";
import { useRealtimeMarketData } from "@/hooks/useRealtimeMarketData";
import { useBybitCandlesRefresh } from "@/hooks/useBybitCandlesRefresh";
import { useTradingStore } from "@/store/tradingStore";

// Lazy load heavy components
const ChartSection = lazy(() => import("@/components/ChartSection"));
const MarketInsights = lazy(() => import("@/components/MarketInsights"));
const TradeCard = lazy(() => import("@/components/TradeCard"));
const AIAnalysis = lazy(() => import("@/components/AIAnalysis"));
const TradesTable = lazy(() => import("@/components/TradesTable"));
const PatternScanner = lazy(() => import("@/components/PatternScanner"));
const AIChat = lazy(() => import("@/components/AIChat"));

import { MultiTimeframePanel } from "@/components/MultiTimeframePanel";
import { IndicatorsDashboard } from "@/components/IndicatorsDashboard";
import { TimeframeMovementTracker } from "@/components/TimeframeMovementTracker";

const Index = () => {
  const { isInitializing } = useMarketDataInitializer();
  const { selectedSymbol, selectedTimeframe } = useTradingStore();
  
  // تفعيل التحديثات التلقائية كل 30 ثانية من LiveCoinWatch
  useAutoRefreshMarketData();
  
  // تفعيل التحديثات الفورية عبر Realtime
  useRealtimeMarketData();
  
  // تفعيل تحديثات شموع Bybit حسب الإطار الزمني
  useBybitCandlesRefresh();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">جاري تحميل بيانات السوق...</h2>
          <p className="text-muted-foreground text-sm">قد يستغرق هذا بضع ثوانٍ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Account Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-2">
              <AccountSidebar />
            </div>

            {/* Main Content Area */}
            <div className="col-span-1 lg:col-span-7 space-y-4 sm:space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <ChartSection />
              </Suspense>

              <MultiTimeframePanel symbol={selectedSymbol} />

              <IndicatorsDashboard symbol={selectedSymbol} timeframe={selectedTimeframe} />

              <Suspense fallback={<LoadingSkeleton />}>
                <MarketInsights />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton />}>
                <AIAnalysis />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton />}>
                <TradesTable />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton />}>
                <PatternScanner />
              </Suspense>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 lg:col-span-3 space-y-4 sm:space-y-6">
              <TimeframeMovementTracker symbol={selectedSymbol} />

              <Suspense fallback={<LoadingSkeleton />}>
                <TradeCard />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton />}>
                <AIChat />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
