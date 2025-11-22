import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import AccountSidebar from "@/components/AccountSidebar";
import CurrencySelector from "@/components/CurrencySelector";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useMarketDataInitializer } from "@/hooks/useMarketDataInitializer";
import { useAutoRefreshMarketData } from "@/hooks/useAutoRefreshMarketData";
import { useRealtimeMarketData } from "@/hooks/useRealtimeMarketData";
import { useBybitCandlesRefresh } from "@/hooks/useBybitCandlesRefresh";
import { LiveUpdateIndicator } from "@/components/LiveUpdateIndicator";

// Lazy load heavy components
const ChartSection = lazy(() => import("@/components/ChartSection"));
const MarketInsights = lazy(() => import("@/components/MarketInsights"));
const TradeCard = lazy(() => import("@/components/TradeCard"));
const AIAnalysis = lazy(() => import("@/components/AIAnalysis"));
const TradesTable = lazy(() => import("@/components/TradesTable"));
const PatternScanner = lazy(() => import("@/components/PatternScanner"));
const AIChat = lazy(() => import("@/components/AIChat"));

const Index = () => {
  const { isInitializing } = useMarketDataInitializer();
  
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-12 gap-4">
          <AccountSidebar />

          <section className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            <LiveUpdateIndicator />
            <CurrencySelector />

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-3">
                <Suspense fallback={<LoadingSkeleton type="chart" />}>
                  <ChartSection />
                </Suspense>
                <Suspense fallback={<LoadingSkeleton type="card" />}>
                  <MarketInsights />
                </Suspense>
              </div>

              <div className="col-span-12 xl:col-span-4 flex flex-col gap-3">
                <Suspense fallback={<LoadingSkeleton type="card" />}>
                  <TradeCard />
                </Suspense>
                <Suspense fallback={<LoadingSkeleton type="card" />}>
                  <AIAnalysis />
                </Suspense>
              </div>
            </div>

            <Suspense fallback={<LoadingSkeleton type="table" count={5} />}>
              <TradesTable />
            </Suspense>
          </section>

          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3">
            <Suspense fallback={<LoadingSkeleton type="card" />}>
              <PatternScanner />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton type="card" />}>
              <AIChat />
            </Suspense>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
