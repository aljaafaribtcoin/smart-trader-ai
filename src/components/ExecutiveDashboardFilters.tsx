import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useBacktestRuns } from '@/hooks/api/useBacktesting';

export interface DashboardFilters {
  startDate: Date | undefined;
  endDate: Date | undefined;
  strategy: string;
  symbol: string;
  timeframe: string;
}

interface ExecutiveDashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export const ExecutiveDashboardFilters = ({ filters, onFiltersChange }: ExecutiveDashboardFiltersProps) => {
  const { data: runs } = useBacktestRuns();
  
  // Extract unique values from runs
  const strategies = Array.from(new Set(runs?.map(r => r.strategy_type) || []));
  const symbols = Array.from(new Set(runs?.map(r => r.symbol) || []));
  const timeframes = Array.from(new Set(runs?.map(r => r.timeframe) || []));

  const handleReset = () => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      strategy: '',
      symbol: '',
      timeframe: '',
    });
  };

  const hasActiveFilters = 
    filters.startDate || 
    filters.endDate || 
    filters.strategy || 
    filters.symbol || 
    filters.timeframe;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">الفلاتر</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-2"
            >
              <X className="h-3 w-3" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>تاريخ البداية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !filters.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(filters.startDate, 'PPP', { locale: ar })
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => onFiltersChange({ ...filters, startDate: date })}
                  initialFocus
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>تاريخ النهاية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !filters.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(filters.endDate, 'PPP', { locale: ar })
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => onFiltersChange({ ...filters, endDate: date })}
                  initialFocus
                  locale={ar}
                  disabled={(date) =>
                    filters.startDate ? date < filters.startDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Strategy */}
          <div className="space-y-2">
            <Label>الاستراتيجية</Label>
            <Select
              value={filters.strategy}
              onValueChange={(value) => onFiltersChange({ ...filters, strategy: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="كل الاستراتيجيات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الاستراتيجيات</SelectItem>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Symbol */}
          <div className="space-y-2">
            <Label>الرمز</Label>
            <Select
              value={filters.symbol}
              onValueChange={(value) => onFiltersChange({ ...filters, symbol: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="كل الرموز" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الرموز</SelectItem>
                {symbols.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label>الإطار الزمني</Label>
            <Select
              value={filters.timeframe}
              onValueChange={(value) => onFiltersChange({ ...filters, timeframe: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="كل الأطر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الأطر</SelectItem>
                {timeframes.map((timeframe) => (
                  <SelectItem key={timeframe} value={timeframe}>
                    {timeframe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
              {filters.startDate && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  من: {format(filters.startDate, 'dd/MM/yyyy')}
                </span>
              )}
              {filters.endDate && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  إلى: {format(filters.endDate, 'dd/MM/yyyy')}
                </span>
              )}
              {filters.strategy && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  استراتيجية: {filters.strategy}
                </span>
              )}
              {filters.symbol && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  رمز: {filters.symbol}
                </span>
              )}
              {filters.timeframe && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  إطار: {filters.timeframe}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
