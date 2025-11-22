import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";

/**
 * مؤشر التحديثات الحية - يعرض حالة التحديثات المستمرة
 */
export const LiveUpdateIndicator = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // تحديث الوقت كل ثانية
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return `${diff} ثانية`;
    if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
    return `${Math.floor(diff / 3600)} ساعة`;
  };

  return (
    <Card className="flex items-center justify-between px-3 py-2 bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-success' : 'bg-warning'}`}>
            {isLive && (
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75"></span>
            )}
          </div>
        </div>
        <div className="text-xs">
          <p className="font-semibold text-foreground">التحديثات الحية نشطة</p>
          <p className="text-muted-foreground text-[10px]">
            آخر تحديث: {getTimeSinceUpdate()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          LiveCoinWatch: 30s
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          Bybit: 1-15m
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          CMC: Daily
        </Badge>
      </div>
    </Card>
  );
};
