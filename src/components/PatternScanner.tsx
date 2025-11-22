import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import { useActivePatterns } from "@/hooks/api/usePatterns";
import { LoadingSkeleton } from "./common/LoadingSkeleton";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";

const PatternScanner = () => {
  const { data: patterns, isLoading } = useActivePatterns();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSkeleton className="h-64" />;
  }

  const recentPatterns = patterns?.slice(0, 3) || [];

  return (
    <Card className="p-4 flex-1 flex flex-col gap-3 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          الأنماط المكتشفة تلقائياً
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto px-2 py-1 text-xs"
          onClick={() => navigate('/patterns')}
        >
          عرض الكل
        </Button>
      </div>

      {recentPatterns.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">لم يتم اكتشاف أنماط جديدة</p>
          <p className="text-[10px] mt-1">يعمل النظام على الكشف كل 15 دقيقة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentPatterns.map((pattern) => (
            <div 
              key={pattern.id} 
              className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate('/patterns')}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {pattern.symbol}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {pattern.timeframe}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium">{pattern.pattern_name}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(pattern.detected_at), { 
                      addSuffix: true, 
                      locale: ar 
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {pattern.pattern_type === 'reversal' ? 'نمط انعكاس' : 'نمط استمرار'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">الثقة:</span>
                  <span className={`font-semibold ${
                    pattern.confidence >= 75 ? 'text-success' : 
                    pattern.confidence >= 60 ? 'text-warning' : 
                    'text-muted-foreground'
                  }`}>
                    {pattern.confidence}%
                  </span>
                </div>
              </div>

              {pattern.target_price && (
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">الهدف:</span>
                  <span className="font-medium text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {pattern.target_price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        يعمل النظام على كشف الأنماط تلقائياً كل 15 دقيقة
      </p>
    </Card>
  );
};

export default PatternScanner;
