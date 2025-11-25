import { Suspense, lazy } from 'react';
import Header from '@/components/Header';
import AccountSidebar from '@/components/AccountSidebar';
import CurrencySelector from '@/components/CurrencySelector';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useTradingStore } from '@/store/tradingStore';
import { MultiTimeframePanel } from '@/components/MultiTimeframePanel';
import { IndicatorsDashboard } from '@/components/IndicatorsDashboard';
import { TimeframeMovementTracker } from '@/components/TimeframeMovementTracker';
import { IndicatorsTester } from '@/components/IndicatorsTester';
import { PatternDetectorTester } from '@/components/PatternDetectorTester';
import { SignalGeneratorTester } from '@/components/SignalGeneratorTester';
import { CronScheduler } from '@/components/CronScheduler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ChartSection = lazy(() => import('@/components/ChartSection'));
const AIAnalysis = lazy(() => import('@/components/AIAnalysis'));

const Analysis = () => {
  const { selectedSymbol, selectedTimeframe } = useTradingStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <AccountSidebar />
        
        <main className="flex-1 p-6 lg:mr-64">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">التحليل الشامل</h1>
                <p className="text-muted-foreground mt-1">
                  تحليل متعدد الفريمات والمؤشرات الفنية
                </p>
              </div>
              <CurrencySelector />
            </div>

            {/* Main Chart */}
            <div className="bg-card rounded-lg overflow-hidden shadow-lg">
              <Suspense fallback={<LoadingSkeleton />}>
                <ChartSection />
              </Suspense>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Multi-timeframe & Indicators */}
              <div className="lg:col-span-2 space-y-6">
                <MultiTimeframePanel symbol={selectedSymbol} />
                <IndicatorsDashboard symbol={selectedSymbol} timeframe={selectedTimeframe} />
                <Suspense fallback={<LoadingSkeleton />}>
                  <AIAnalysis />
                </Suspense>
              </div>

              {/* Right Column - Movement Tracker */}
              <div className="space-y-6">
                <TimeframeMovementTracker symbol={selectedSymbol} />
                
                {/* Quick Stats */}
                <div className="bg-card p-6 rounded-lg">
                  <h3 className="font-bold mb-4">إحصائيات سريعة</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded">
                      <span className="text-sm text-muted-foreground">الرمز</span>
                      <span className="font-mono font-bold">{selectedSymbol}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded">
                      <span className="text-sm text-muted-foreground">الفريم</span>
                      <span className="font-mono font-bold uppercase">{selectedTimeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing & Scheduler Section */}
            <Tabs defaultValue="indicators" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="indicators">Indicators Test</TabsTrigger>
                <TabsTrigger value="patterns">Patterns Test</TabsTrigger>
                <TabsTrigger value="signals">Signals Test</TabsTrigger>
                <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
              </TabsList>
              
              <TabsContent value="indicators" className="space-y-4 mt-6">
                <IndicatorsTester />
              </TabsContent>
              
              <TabsContent value="patterns" className="space-y-4 mt-6">
                <PatternDetectorTester />
              </TabsContent>
              
              <TabsContent value="signals" className="space-y-4 mt-6">
                <SignalGeneratorTester />
              </TabsContent>
              
              <TabsContent value="scheduler" className="space-y-4 mt-6">
                <CronScheduler />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analysis;
