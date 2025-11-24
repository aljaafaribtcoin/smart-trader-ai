import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SignalCard } from '@/components/SignalCard';
import { SignalGenerator } from '@/components/SignalGenerator';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import Header from '@/components/Header';
import { 
  Sparkles, 
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type FilterType = 'all' | 'active' | 'completed' | 'long' | 'short';

const Signals = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Fetch signals from Supabase
  const { data: signals = [], isLoading, refetch } = useQuery({
    queryKey: ['trading-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_signals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter signals
  const filteredSignals = signals.filter((signal) => {
    if (filter === 'all') return true;
    if (filter === 'active') return signal.status === 'active';
    if (filter === 'completed') return signal.status === 'completed';
    if (filter === 'long') return signal.direction.toLowerCase() === 'long';
    if (filter === 'short') return signal.direction.toLowerCase() === 'short';
    return true;
  });

  // Statistics
  const stats = {
    total: signals.length,
    active: signals.filter(s => s.status === 'active').length,
    completed: signals.filter(s => s.status === 'completed').length,
    long: signals.filter(s => s.direction.toLowerCase() === 'long').length,
    short: signals.filter(s => s.direction.toLowerCase() === 'short').length,
    avgConfidence: signals.length > 0
      ? signals.reduce((sum, s) => sum + (s.confidence || 0), 0) / signals.length
      : 0,
  };

  const filterButtons: Array<{ label: string; value: FilterType; icon: any; count: number }> = [
    { label: 'الكل', value: 'all', icon: Sparkles, count: stats.total },
    { label: 'نشط', value: 'active', icon: Clock, count: stats.active },
    { label: 'مكتمل', value: 'completed', icon: CheckCircle2, count: stats.completed },
    { label: 'LONG', value: 'long', icon: TrendingUp, count: stats.long },
    { label: 'SHORT', value: 'short', icon: TrendingDown, count: stats.short },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                  <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  توصيات التداول
                </h1>
                <p className="text-muted-foreground mt-2 text-base sm:text-lg">
                  إشارات تداول ذكية مدعومة بالذكاء الاصطناعي
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </Button>
            </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">إجمالي التوصيات</p>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <p className="text-xs text-muted-foreground mb-1">توصيات LONG</p>
              <p className="text-2xl font-bold text-success">{stats.long}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <p className="text-xs text-muted-foreground mb-1">توصيات SHORT</p>
              <p className="text-2xl font-bold text-destructive">{stats.short}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <p className="text-xs text-muted-foreground mb-1">متوسط الثقة</p>
              <p className="text-2xl font-bold text-accent">{stats.avgConfidence.toFixed(1)}%</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">تصفية التوصيات</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={btn.value}
                    variant={filter === btn.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(btn.value)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {btn.label}
                    <Badge 
                      variant={filter === btn.value ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {btn.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Signal Generator */}
        <SignalGenerator />

        {/* Signals Grid */}
        {isLoading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filteredSignals.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="لا توجد توصيات"
            description={
              filter === 'all'
                ? 'لم يتم إنشاء أي توصيات بعد'
                : `لا توجد توصيات ${filter === 'active' ? 'نشطة' : filter === 'completed' ? 'مكتملة' : filter === 'long' ? 'LONG' : 'SHORT'}`
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Signals;
