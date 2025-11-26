import { useState } from 'react';
import { Settings, Bell, BellOff } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface NotificationPreferences {
  patterns_enabled: boolean;
  signals_enabled: boolean;
  indicators_enabled: boolean;
  price_alerts_enabled: boolean;
}

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    patterns_enabled: true,
    signals_enabled: true,
    indicators_enabled: true,
    price_alerts_enabled: true,
  });

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('تم حفظ الإعدادات');
  };

  const allEnabled = Object.values(preferences).every((v) => v);
  const allDisabled = Object.values(preferences).every((v) => !v);

  const toggleAll = () => {
    const newValue = allDisabled;
    setPreferences({
      patterns_enabled: newValue,
      signals_enabled: newValue,
      indicators_enabled: newValue,
      price_alerts_enabled: newValue,
    });
    toast.success(newValue ? 'تم تفعيل جميع الإشعارات' : 'تم إيقاف جميع الإشعارات');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-2xl">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات الإشعارات
          </DialogTitle>
          <DialogDescription>
            تحكم في نوع الإشعارات التي تريد استلامها
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">التحكم السريع</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  className="h-8"
                >
                  {allDisabled ? (
                    <>
                      <Bell className="h-3 w-3 mr-2" />
                      تفعيل الكل
                    </>
                  ) : (
                    <>
                      <BellOff className="h-3 w-3 mr-2" />
                      إيقاف الكل
                    </>
                  )}
                </Button>
              </div>
              <CardDescription className="text-xs">
                تفعيل أو إيقاف جميع الإشعارات دفعة واحدة
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">أنواع الإشعارات</CardTitle>
              <CardDescription className="text-xs">
                اختر أنواع الإشعارات التي تريد استلامها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2 space-x-reverse">
                <Label htmlFor="patterns" className="flex-1 cursor-pointer">
                  <div className="font-medium">الأنماط</div>
                  <div className="text-xs text-muted-foreground">
                    إشعارات عند اكتشاف أنماط جديدة
                  </div>
                </Label>
                <Switch
                  id="patterns"
                  checked={preferences.patterns_enabled}
                  onCheckedChange={() => handleToggle('patterns_enabled')}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 space-x-reverse">
                <Label htmlFor="signals" className="flex-1 cursor-pointer">
                  <div className="font-medium">التوصيات</div>
                  <div className="text-xs text-muted-foreground">
                    إشعارات عند توليد توصيات جديدة
                  </div>
                </Label>
                <Switch
                  id="signals"
                  checked={preferences.signals_enabled}
                  onCheckedChange={() => handleToggle('signals_enabled')}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 space-x-reverse">
                <Label htmlFor="indicators" className="flex-1 cursor-pointer">
                  <div className="font-medium">المؤشرات الفنية</div>
                  <div className="text-xs text-muted-foreground">
                    إشعارات عند تغييرات مهمة في المؤشرات (RSI، MACD)
                  </div>
                </Label>
                <Switch
                  id="indicators"
                  checked={preferences.indicators_enabled}
                  onCheckedChange={() => handleToggle('indicators_enabled')}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 space-x-reverse">
                <Label htmlFor="price_alerts" className="flex-1 cursor-pointer">
                  <div className="font-medium">تنبيهات الأسعار</div>
                  <div className="text-xs text-muted-foreground">
                    إشعارات عند وصول السعر لمستويات معينة
                  </div>
                </Label>
                <Switch
                  id="price_alerts"
                  checked={preferences.price_alerts_enabled}
                  onCheckedChange={() => handleToggle('price_alerts_enabled')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  سيتم عرض الإشعارات في الوقت الفعلي مع صوت تنبيه. يمكنك إدارة الإشعارات
                  المستلمة من خلال النقر على أيقونة الجرس في الأعلى.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
