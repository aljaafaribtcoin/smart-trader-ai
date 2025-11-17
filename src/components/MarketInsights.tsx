import { Card } from "./ui/card";

const MarketInsights = () => {
  const insights = [
    {
      title: "حجم السيولة",
      status: "قوي",
      statusColor: "text-success",
      description: "السيولة الحالية أعلى من المتوسط 30 يوم، مع زيادة ملحوظة في عقود الشراء.",
    },
    {
      title: "زخم الحركة",
      status: "يتعافى",
      statusColor: "text-warning",
      description: "المؤشرات (RSI, Stoch, MACD) تظهر خروجاً تدريجياً من منطقة التشبع البيعي على الفريمات الصغيرة.",
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
