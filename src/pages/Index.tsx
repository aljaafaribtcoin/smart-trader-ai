import Header from "@/components/Header";
import AccountSidebar from "@/components/AccountSidebar";
import CurrencySelector from "@/components/CurrencySelector";
import ChartSection from "@/components/ChartSection";
import MarketInsights from "@/components/MarketInsights";
import TradeCard from "@/components/TradeCard";
import AIAnalysis from "@/components/AIAnalysis";
import TradesTable from "@/components/TradesTable";
import PatternScanner from "@/components/PatternScanner";
import AIChat from "@/components/AIChat";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-12 gap-4">
          <AccountSidebar />

          <section className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            <CurrencySelector />

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-3">
                <ChartSection />
                <MarketInsights />
              </div>

              <div className="col-span-12 xl:col-span-4 flex flex-col gap-3">
                <TradeCard />
                <AIAnalysis />
              </div>
            </div>

            <TradesTable />
          </section>

          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3">
            <PatternScanner />
            <AIChat />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
