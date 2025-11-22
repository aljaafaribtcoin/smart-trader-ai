import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Clock, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TradeForm } from '@/components/forms/TradeForm';
import { useTrades, useCloseTrade } from '@/hooks/api/useTrades';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Trades() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'closed'>('all');
  
  const { data: allTrades, isLoading: loadingAll } = useTrades();
  const { data: openTrades, isLoading: loadingOpen } = useTrades('open');
  const { data: closedTrades, isLoading: loadingClosed } = useTrades('closed');
  const closeTrade = useCloseTrade();

  const handleCloseTrade = (tradeId: string, currentPrice: number) => {
    closeTrade.mutate({ tradeId, exitPrice: currentPrice });
  };

  const calculatePnL = (trade: any) => {
    if (!trade.exit_price) return 0;
    
    const priceDiff = trade.type === 'long' 
      ? trade.exit_price - trade.entry_price
      : trade.entry_price - trade.exit_price;
    
    return (priceDiff / trade.entry_price) * 100 * trade.leverage;
  };

  const renderTrade = (trade: any) => {
    const pnl = calculatePnL(trade);
    const isProfit = pnl > 0;
    
    return (
      <Card key={trade.id} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant={trade.type === 'long' ? 'default' : 'destructive'}>
              {trade.type === 'long' ? (
                <><TrendingUp className="h-3 w-3 ml-1" /> شراء</>
              ) : (
                <><TrendingDown className="h-3 w-3 ml-1" /> بيع</>
              )}
            </Badge>
            <div>
              <h3 className="font-semibold text-lg">{trade.symbol}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true, locale: ar })}
              </p>
            </div>
          </div>
          
          <Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
            {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">سعر الدخول</p>
            <p className="font-semibold">{trade.entry_price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">وقف الخسارة</p>
            <p className="font-semibold text-destructive">{trade.stop_loss.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">الحجم</p>
            <p className="font-semibold flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {trade.position_size.toFixed(2)}
            </p>
          </div>
        </div>

        {trade.status === 'closed' && trade.exit_price && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">سعر الخروج</p>
                <p className="font-semibold">{trade.exit_price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">الربح/الخسارة</p>
                <p className={`font-bold text-lg ${isProfit ? 'text-success' : 'text-destructive'}`}>
                  {isProfit ? '+' : ''}{pnl.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {trade.status === 'open' && (
          <div className="mt-3 pt-3 border-t">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => handleCloseTrade(trade.id, trade.entry_price * 1.05)}
            >
              <Target className="h-4 w-4 ml-2" />
              إغلاق الصفقة
            </Button>
          </div>
        )}

        {trade.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">{trade.notes}</p>
          </div>
        )}
      </Card>
    );
  };

  const isLoading = loadingAll || loadingOpen || loadingClosed;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الصفقات</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة صفقاتك المفتوحة والمغلقة
          </p>
        </div>
        <Button onClick={() => setShowTradeForm(true)}>
          <Plus className="h-4 w-4 ml-2" />
          صفقة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الصفقات المفتوحة</p>
              <p className="text-2xl font-bold">{openTrades?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الصفقات</p>
              <p className="text-2xl font-bold">{allTrades?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">معدل النجاح</p>
              <p className="text-2xl font-bold">
                {closedTrades && closedTrades.length > 0
                  ? `${((closedTrades.filter(t => calculatePnL(t) > 0).length / closedTrades.length) * 100).toFixed(0)}%`
                  : '0%'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Trades List */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">جميع الصفقات</TabsTrigger>
          <TabsTrigger value="open">المفتوحة ({openTrades?.length || 0})</TabsTrigger>
          <TabsTrigger value="closed">المغلقة ({closedTrades?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : allTrades && allTrades.length > 0 ? (
            allTrades.map(renderTrade)
          ) : (
            <Card className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">لا توجد صفقات حتى الآن</p>
              <Button onClick={() => setShowTradeForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء صفقة جديدة
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : openTrades && openTrades.length > 0 ? (
            openTrades.map(renderTrade)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">لا توجد صفقات مفتوحة</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : closedTrades && closedTrades.length > 0 ? (
            closedTrades.map(renderTrade)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">لا توجد صفقات مغلقة</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Trade Form Dialog */}
      <Dialog open={showTradeForm} onOpenChange={setShowTradeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>صفقة جديدة</DialogTitle>
          </DialogHeader>
          <TradeForm
            onSuccess={() => setShowTradeForm(false)}
            onCancel={() => setShowTradeForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
