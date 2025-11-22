import { Card } from "./ui/card";
import { useTrendAnalysis, useVolumeAnalysis } from "@/hooks/api/useMarketData";
import { useTradingStore } from "@/store/tradingStore";
import { LoadingSkeleton } from "./common/LoadingSkeleton";

const MarketInsights = () => {
  const { selectedSymbol } = useTradingStore();
  const { data: trendData, isLoading: trendLoading } = useTrendAnalysis(selectedSymbol);
  const { data: volumeData, isLoading: volumeLoading } = useVolumeAnalysis(selectedSymbol);
  
  const isLoading = trendLoading || volumeLoading;

  if (isLoading) return <LoadingSkeleton type="card" count={1} />;

  if (!trendData || trendData.length === 0 || !volumeData) {
    return (
      <Card className="p-3 text-center text-muted-foreground">
        لا توجد بيانات كافية لعرض التحليل
      </Card>
    );
  }

  const volumeTrend = volumeData?.trend === 'increasing' ? 'قوي' : volumeData?.trend === 'decreasing' ? 'ضعيف' : 'متوسط';
  const volumeColor = volumeData?.trend === 'increasing' ? 'text-success' : volumeData?.trend === 'decreasing' ? 'text-destructive' : 'text-warning';
  
  // Calculate momentum from trend data
  const bullishCount = trendData.filter(t => t.direction === 'bullish').length;
  const bearishCount = trendData.filter(t => t.direction === 'bearish').length;
  const rangingCount = trendData.filter(t => t.direction === 'ranging').length;
  
  let momentumStatus = "تذبذب";
  let momentumColor = "text-warning";
  let momentumDescription = "الفريمات متباينة، لا يوجد اتجاه واضح";
  
  if (bullishCount > bearishCount + rangingCount) {
    momentumStatus = "صاعد قوي";
    momentumColor = "text-success";
    momentumDescription = "معظم الفريمات تظهر زخم صعودي واضح";
  } else if (bearishCount > bullishCount + rangingCount) {
    momentumStatus = "هابط قوي";
    momentumColor = "text-destructive";
    momentumDescription = "معظم الفريمات تظهر زخم هبوطي واضح";
  } else if (bullishCount > bearishCount) {
    momentumStatus = "يميل للصعود";
    momentumColor = "text-success";
    momentumDescription = "الفريمات تظهر تحسناً تدريجياً";
  } else if (bearishCount > bullishCount) {
    momentumStatus = "يميل للهبوط";
    momentumColor = "text-destructive";
    momentumDescription = "الفريمات تظهر ضعفاً تدريجياً";
  }
  
  const insights = [
    {
      title: "حجم السيولة",
      status: volumeTrend,
      statusColor: volumeColor,
      description: `الحجم الحالي ${volumeData.percentageChange > 0 ? 'أعلى' : 'أقل'} من متوسط 30 يوم بنسبة ${Math.abs(volumeData.percentageChange).toFixed(1)}%`,
    },
    {
      title: "زخم الحركة",
      status: momentumStatus,
      statusColor: momentumColor,
      description: momentumDescription,
    },
    {
      title: "توزيع الفريمات",
      status: `${trendData.length} فريمات`,
      statusColor: "text-secondary",
      description: null,
      zones: [
        { label: "صاعد", value: `${bullishCount} فريم`, color: "text-success" },
        { label: "هابط", value: `${bearishCount} فريم`, color: "text-destructive" },
        { label: "تذبذب", value: `${rangingCount} فريم`, color: "text-warning" },
      ],
    },
  ];

  return (
    <Card className="p-3 grid grid-cols-3 gap-3 text-[11px] shadow-soft">
      {insights.map((insight, index) => (
        <div key={index} className="col-span-3 sm:col-span-1 bg-muted/50 rounded-xl p-2.5 border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">{insight.title}</span>
            <span className={`font-semibold ${insight.statusColor}`}>{insight.status}</span>
          </div>
          {insight.description && (
            <p className="text-[11px] text-muted-foreground">{insight.description}</p>
          )}
          {insight.zones && (
            <ul className="space-y-0.5 mt-1">
              {insight.zones.map((zone, zIndex) => (
                <li key={zIndex} className="flex justify-between">
                  <span className="text-muted-foreground">{zone.label}</span>
                  <span className={`font-semibold text-[11px] ${zone.color}`}>{zone.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </Card>
  );
};

export default MarketInsights;
