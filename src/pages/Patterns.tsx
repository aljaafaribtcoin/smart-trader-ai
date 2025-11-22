import { useState } from 'react';
import { Sparkles, Filter, RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatterns, useDetectPatterns } from '@/hooks/api/usePatterns';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { PatternCard } from '@/components/PatternCard';

export default function Patterns() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');

  const filters = {
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    patternType: selectedType !== 'all' ? selectedType : undefined,
    symbol: selectedSymbol !== 'all' ? selectedSymbol : undefined,
  };

  const { data: patterns, isLoading } = usePatterns(filters);
  const detectPatterns = useDetectPatterns();

  const activePatterns = patterns?.filter(p => p.status === 'active') || [];
  const completedPatterns = patterns?.filter(p => p.status === 'completed') || [];
  const invalidatedPatterns = patterns?.filter(p => p.status === 'invalidated') || [];

  const handleDetectPatterns = () => {
    detectPatterns.mutate({
      symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'AVAXUSDT', 'CAKEUSDT', 'SUIUSDT', 'SEIUSDT', 'PEPEUSDT'],
      timeframes: ['1d', '4h', '1h']
    });
  };

  const uniqueSymbols = [...new Set(patterns?.map(p => p.symbol) || [])];

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              كاشف الأنماط
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              اكتشاف تلقائي للأنماط الفنية (Head & Shoulders, Double Top/Bottom, Flags)
            </p>
          </div>
          <Button 
            onClick={handleDetectPatterns}
            disabled={detectPatterns.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${detectPatterns.isPending ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{detectPatterns.isPending ? 'جاري الكشف...' : 'كشف الأنماط الآن'}</span>
          </Button>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الأنماط</p>
              <p className="text-2xl font-bold">{patterns?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الأنماط النشطة</p>
              <p className="text-2xl font-bold">{activePatterns.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المكتملة</p>
              <p className="text-2xl font-bold">{completedPatterns.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الملغية</p>
              <p className="text-2xl font-bold">{invalidatedPatterns.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">الفلاتر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">نوع النمط</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="reversal">أنماط الانعكاس</SelectItem>
                <SelectItem value="continuation">أنماط الاستمرار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">العملة</label>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملات</SelectItem>
                {uniqueSymbols.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">الحالة</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="invalidated">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Patterns List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">الكل ({patterns?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">النشطة ({activePatterns.length})</TabsTrigger>
          <TabsTrigger value="completed">المكتملة ({completedPatterns.length})</TabsTrigger>
          <TabsTrigger value="invalidated">الملغية ({invalidatedPatterns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : patterns && patterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map(pattern => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">لم يتم اكتشاف أي أنماط بعد</p>
              <Button onClick={handleDetectPatterns} disabled={detectPatterns.isPending}>
                <RefreshCw className={`h-4 w-4 ml-2 ${detectPatterns.isPending ? 'animate-spin' : ''}`} />
                ابدأ الكشف الآن
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : activePatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePatterns.map(pattern => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">لا توجد أنماط نشطة حالياً</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : completedPatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedPatterns.map(pattern => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">لا توجد أنماط مكتملة</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invalidated" className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-48" />
          ) : invalidatedPatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invalidatedPatterns.map(pattern => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">لا توجد أنماط ملغية</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
