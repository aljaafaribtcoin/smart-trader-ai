import { Card } from "./ui/card";

const PatternScanner = () => {
  const patterns = [
    {
      name: "قاع مزدوج (Double Bottom)",
      timeframe: "فريم 15m - القوة: متوسطة",
      signal: "إشارة صعود",
      signalColor: "bg-success/10 text-success border-success/40",
    },
    {
      name: "قناة هابطة",
      timeframe: "فريم 4H - لم يكسر بعد",
      signal: "تحت المراقبة",
      signalColor: "bg-warning/10 text-warning border-warning/40",
    },
  ];

  return (
    <Card className="p-3 flex flex-col gap-2 text-[11px] shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">النماذج الفنية المكتشفة تلقائياً</h3>
        <span className="px-2 py-0.5 rounded-xl bg-muted border text-[10px]">Auto Pattern Scanner</span>
      </div>
      <div className="space-y-1.5">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-xl px-2 py-1.5 border ${
              index === 0 ? "bg-muted/50" : "bg-muted/30"
            }`}
          >
            <div>
              <div className="font-semibold">{pattern.name}</div>
              <div className="text-[10px] text-muted-foreground">{pattern.timeframe}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full border ${pattern.signalColor}`}>{pattern.signal}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PatternScanner;
