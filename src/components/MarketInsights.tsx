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

  const volumeTrend = volumeData?.trend === 'increasing' ? 'قوي' : volumeData?.trend === 'decreasing' ? 'ضعيف' : 'متوسط';
  const volumeColor = volumeData?.trend === 'increasing' ? 'text-success' : 'text-warning';
  
  const insights = [
    {
      title: "حجم السيولة",
      status: volumeTrend,
      statusColor: volumeColor,
      description: `السيولة الحالية ${volumeData?.percentageChange && volumeData.percentageChange > 0 ? 'أعلى' : 'أقل'} من المتوسط 30 يوم`,
    },
    {
      title: "زخم الحركة",
      status: "يتعافى",
      statusColor: "text-warning",
      description: "المؤشرات تظهر تحسناً تدريجياً على الفريمات الصغيرة",
    },
    {
      title: "مناطق السعر المهمة",
      status: "3 مناطق",
      statusColor: "text-secondary",
      description: null,
      zones: [
        { label: "منطقة طلب قوية", value: "14.20 - 14.40", color: "text-success" },
        { label: "مقاومة قريبة", value: "15.80", color: "text-warning" },
        { label: "كسر سلبي", value: "< 14.10", color: "text-destructive" },
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
