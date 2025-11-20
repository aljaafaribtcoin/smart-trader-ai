import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Minus } from 'lucide-react';
import { tradeSchema, type TradeFormData } from '@/lib/validations/tradeSchema';
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
import { useTradingStore } from '@/store/tradingStore';
import { useUserStore } from '@/store/userStore';

interface TradeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TradeForm = ({ onSuccess, onCancel }: TradeFormProps) => {
  const { toast } = useToast();
  const { selectedSymbol } = useTradingStore();
  const { preferences } = useUserStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: selectedSymbol,
      type: 'long',
      leverage: preferences.defaultLeverage,
      takeProfits: [{ price: 0, percentage: 100 }],
    },
  });

  const watchType = watch('type');
  const watchEntry = watch('entryPrice');
  const watchSL = watch('stopLoss');
  const takeProfits = watch('takeProfits') || [];

  // حساب المخاطرة
  const calculateRisk = () => {
    if (!watchEntry || !watchSL) return 0;
    const risk = Math.abs((watchEntry - watchSL) / watchEntry) * 100;
    return risk.toFixed(2);
  };

  // حساب نسبة المكافأة للمخاطرة
  const calculateRR = (tpPrice: number) => {
    if (!watchEntry || !watchSL || !tpPrice) return 0;
    const risk = Math.abs(watchEntry - watchSL);
    const reward = Math.abs(tpPrice - watchEntry);
    return (reward / risk).toFixed(2);
  };

  const onSubmit = async (data: TradeFormData) => {
    try {
      // TODO: استدعاء API لتنفيذ الصفقة
      console.log('Trade data:', data);
      
      toast({
        title: 'تم إنشاء الصفقة',
        description: `صفقة ${data.type} على ${data.symbol} بنجاح`,
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الصفقة',
        variant: 'destructive',
      });
    }
  };

  const addTakeProfit = () => {
    const current = takeProfits || [];
    setValue('takeProfits', [...current, { price: 0, percentage: 50 }]);
  };

  const removeTakeProfit = (index: number) => {
    const current = takeProfits || [];
    if (current.length > 1) {
      setValue('takeProfits', current.filter((_, i) => i !== index));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">العملة</Label>
            <Input
              id="symbol"
              {...register('symbol')}
              placeholder="BTCUSDT"
              className="text-right"
            />
            {errors.symbol && (
              <p className="text-sm text-destructive">{errors.symbol.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع الصفقة</Label>
            <Select
              value={watchType}
              onValueChange={(value) => setValue('type', value as 'long' | 'short')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">شراء (Long)</SelectItem>
                <SelectItem value="short">بيع (Short)</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">أسعار الدخول والخروج</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entryPrice">سعر الدخول</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.01"
              {...register('entryPrice', { valueAsNumber: true })}
              placeholder="0.00"
              className="text-right"
            />
            {errors.entryPrice && (
              <p className="text-sm text-destructive">{errors.entryPrice.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopLoss">وقف الخسارة</Label>
            <Input
              id="stopLoss"
              type="number"
              step="0.01"
              {...register('stopLoss', { valueAsNumber: true })}
              placeholder="0.00"
              className="text-right"
            />
            {errors.stopLoss && (
              <p className="text-sm text-destructive">{errors.stopLoss.message}</p>
            )}
            {watchEntry && watchSL && (
              <p className="text-xs text-muted-foreground">
                المخاطرة: {calculateRisk()}%
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>أهداف الربح</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addTakeProfit}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة هدف
            </Button>
          </div>

          {takeProfits.map((tp, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  {...register(`takeProfits.${index}.price`, { valueAsNumber: true })}
                  placeholder={`الهدف ${index + 1}`}
                  className="text-right"
                />
                {tp.price > 0 && (
                  <p className="text-xs text-muted-foreground">
                    R:R = 1:{calculateRR(tp.price)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  {...register(`takeProfits.${index}.percentage`, { valueAsNumber: true })}
                  placeholder="%"
                  className="text-right"
                />
              </div>
              {takeProfits.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTakeProfit(index)}
                  className="col-span-3"
                >
                  <Minus className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              )}
            </div>
          ))}
          {errors.takeProfits && (
            <p className="text-sm text-destructive">
              {errors.takeProfits.message || errors.takeProfits.root?.message}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">إعدادات الصفقة</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="positionSize">حجم الصفقة (USDT)</Label>
            <Input
              id="positionSize"
              type="number"
              step="0.01"
              {...register('positionSize', { valueAsNumber: true })}
              placeholder="100.00"
              className="text-right"
            />
            {errors.positionSize && (
              <p className="text-sm text-destructive">{errors.positionSize.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leverage">الرافعة المالية</Label>
            <Input
              id="leverage"
              type="number"
              {...register('leverage', { valueAsNumber: true })}
              placeholder="10"
              className="text-right"
            />
            {errors.leverage && (
              <p className="text-sm text-destructive">{errors.leverage.message}</p>
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
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'جاري التنفيذ...' : 'تنفيذ الصفقة'}
        </Button>
      </div>
    </form>
  );
};
