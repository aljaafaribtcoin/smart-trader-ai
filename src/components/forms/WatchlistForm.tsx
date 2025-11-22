import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { watchlistSchema, type WatchlistFormData } from '@/lib/validations/watchlistSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAddToWatchlist } from '@/hooks/api/useWatchlist';
import { useUserStore } from '@/store/userStore';

interface WatchlistFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const POPULAR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'DOTUSDT',
];

const TIMEFRAMES = [
  { value: '1m', label: '1 دقيقة' },
  { value: '5m', label: '5 دقائق' },
  { value: '15m', label: '15 دقيقة' },
  { value: '1h', label: '1 ساعة' },
  { value: '4h', label: '4 ساعات' },
  { value: '1d', label: '1 يوم' },
  { value: '1w', label: '1 أسبوع' },
];

export const WatchlistForm = ({ onSuccess, onCancel }: WatchlistFormProps) => {
  const { toast } = useToast();
  const { userId } = useUserStore();
  const { mutate: addToWatchlist, isPending } = useAddToWatchlist();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WatchlistFormData>({
    resolver: zodResolver(watchlistSchema),
    defaultValues: {
      timeframe: '1h',
    },
  });

  const watchSymbol = watch('symbol');
  const watchAlertType = watch('alertType');

  const onSubmit = (data: WatchlistFormData) => {
    addToWatchlist(
      {
        symbol: data.symbol,
        timeframe: data.timeframe,
      },
      {
        onSuccess: () => {
          toast({
            title: 'تمت الإضافة',
            description: `تمت إضافة ${data.symbol} لقائمة المراقبة`,
          });
          onSuccess?.();
        },
        onError: () => {
          toast({
            title: 'خطأ',
            description: 'فشل في إضافة العملة لقائمة المراقبة',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">معلومات العملة</h3>

        <div className="space-y-2">
          <Label htmlFor="symbol">اختر العملة</Label>
          <Select
            value={watchSymbol}
            onValueChange={(value) => setValue('symbol', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر العملة" />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_SYMBOLS.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.symbol && (
            <p className="text-sm text-destructive">{errors.symbol.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">الإطار الزمني</Label>
          <Select
            defaultValue="1h"
            onValueChange={(value) => setValue('timeframe', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timeframe && (
            <p className="text-sm text-destructive">{errors.timeframe.message}</p>
          )}
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">تنبيه السعر (اختياري)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceAlert">السعر المستهدف</Label>
            <Input
              id="priceAlert"
              type="number"
              step="0.01"
              {...register('priceAlert', { valueAsNumber: true })}
              placeholder="0.00"
              className="text-right"
            />
            {errors.priceAlert && (
              <p className="text-sm text-destructive">{errors.priceAlert.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertType">نوع التنبيه</Label>
            <Select
              value={watchAlertType}
              onValueChange={(value) => setValue('alertType', value as 'above' | 'below')}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">أعلى من</SelectItem>
                <SelectItem value="below">أقل من</SelectItem>
              </SelectContent>
            </Select>
            {errors.alertType && (
              <p className="text-sm text-destructive">{errors.alertType.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="أضف ملاحظاتك هنا..."
            className="text-right resize-none"
            rows={3}
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'جاري الإضافة...' : 'إضافة لقائمة المراقبة'}
        </Button>
      </div>
    </form>
  );
};
