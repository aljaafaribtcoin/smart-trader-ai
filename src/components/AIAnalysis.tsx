import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap, AlertTriangle, Target } from 'lucide-react';
import { useTradingStore } from '@/store/tradingStore';
import { useAIAnalysis, useAnalyzeSymbol } from '@/hooks/api/useAIAnalysis';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { Separator } from '@/components/ui/separator';

export const AIAnalysis = () => {
  const { selectedSymbol, selectedTimeframe } = useTradingStore();
  const { data: analysisData, isLoading, error } = useAIAnalysis(selectedSymbol, selectedTimeframe);
  const analyzeSymbol = useAnalyzeSymbol();

  const handleAnalyze = () => {
    analyzeSymbol.mutate({
      symbol: selectedSymbol,
      timeframe: selectedTimeframe,
    });
  };

  if (isLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">فشل في تحميل التحليل</p>
          <Button onClick={handleAnalyze} disabled={analyzeSymbol.isPending}>
            {analyzeSymbol.isPending ? 'جاري التحليل...' : 'إعادة المحاولة'}
          </Button>
        </div>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">لا توجد بيانات تحليل متاحة</p>
          <Button onClick={handleAnalyze} disabled={analyzeSymbol.isPending}>
            {analyzeSymbol.isPending ? 'جاري التحليل...' : 'بدء التحليل'}
          </Button>
        </div>
      </Card>
    );
  }

  const { bias, confidence, marketCondition, narrative, signals, multiTimeframe } = analysisData;
  
  // Determine colors based on bias
  const biasColor = bias === 'long' 
    ? 'text-success' 
    : bias === 'short' 
    ? 'text-destructive'
    : 'text-warning';
    
  const biasIcon = bias === 'long' 
    ? TrendingUp 
    : bias === 'short' 
    ? TrendingDown
    : Activity;
    
  const BiasIcon = biasIcon;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          تحليل AI متقدم
        </h3>
        <Button 
          size="sm" 
          onClick={handleAnalyze}
          disabled={analyzeSymbol.isPending}
        >
          {analyzeSymbol.isPending ? 'جاري التحليل...' : 'إعادة التحليل'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header - Bias & Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BiasIcon className={`h-8 w-8 ${biasColor}`} />
            <div>
              <p className="text-sm text-muted-foreground">الاتجاه المتوقع</p>
              <p className={`text-xl font-bold ${biasColor}`}>
                {bias === 'long' ? 'صاعد' : bias === 'short' ? 'هابط' : 'محايد'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">درجة الثقة</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${confidence > 70 ? 'bg-success' : confidence > 50 ? 'bg-warning' : 'bg-destructive'}`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-xl font-bold">{confidence}%</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Market Condition */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">حالة السوق</p>
          <Badge variant="outline" className="text-base">
            {marketCondition === 'trending' ? '📊 في اتجاه' : 
             marketCondition === 'ranging' ? '↔️ في نطاق' : 
             marketCondition === 'choppy' ? '🌊 متذبذب' : 
             '⚡ تذبذب عالي'}
          </Badge>
        </div>

        {/* Multi-Timeframe Summary */}
        <div>
          <h4 className="text-sm font-medium mb-3">تحليل الفريمات المتعددة</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الفريمات المتوافقة:</span>
              <div className="flex gap-1">
                {multiTimeframe.alignedTimeframes.map(tf => (
                  <Badge key={tf} variant="default" className="text-xs">{tf}</Badge>
                ))}
              </div>
            </div>
            {multiTimeframe.conflictingTimeframes.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الفريمات المتعارضة:</span>
                <div className="flex gap-1">
                  {multiTimeframe.conflictingTimeframes.map(tf => (
                    <Badge key={tf} variant="destructive" className="text-xs">{tf}</Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">{multiTimeframe.comment}</p>
          </div>
        </div>

        <Separator />

        {/* Narrative Overview */}
        <div>
          <h4 className="text-sm font-medium mb-3">ملخص التحليل</h4>
          <p className="text-sm leading-relaxed">{narrative.overview}</p>
        </div>

        {/* Strength Points */}
        {narrative.strengthPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-success">✅ نقاط القوة</h4>
            <ul className="space-y-1">
              {narrative.strengthPoints.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weak Points */}
        {narrative.weakPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-warning">⚠️ نقاط الضعف</h4>
            <ul className="space-y-1">
              {narrative.weakPoints.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {narrative.warnings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-destructive">🚨 تحذيرات</h4>
            <ul className="space-y-1">
              {narrative.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Signals */}
        {signals.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                الإشارات المقترحة
              </h4>
              {signals.map((signal) => (
                <div key={signal.id} className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={signal.direction === 'long' ? 'default' : 'destructive'}>
                      {signal.direction === 'long' ? '📈 شراء' : '📉 بيع'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">الثقة: {signal.confidence}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">منطقة الدخول:</span>
                      <p className="font-medium">{signal.entryZone.from.toFixed(2)} - {signal.entryZone.to.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">وقف الخسارة:</span>
                      <p className="font-medium text-destructive">{signal.stopLoss.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">الأهداف:</span>
                      <p className="font-medium text-success">
                        TP1: {signal.targets.tp1.toFixed(2)} | TP2: {signal.targets.tp2.toFixed(2)} | TP3: {signal.targets.tp3.toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">نسبة المخاطرة/العائد:</span>
                      <p className="font-medium">1:{signal.riskReward.toFixed(1)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{signal.mainScenario}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default AIAnalysis;
