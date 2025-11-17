import { Button } from "./ui/button";
import { Card } from "./ui/card";

const AIAnalysis = () => {
  return (
    <Card className="p-3 flex-1 flex flex-col gap-2 text-[11px] shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">ملخص تحليلي من الذكاء الاصطناعي</h3>
        <Button variant="outline" size="sm" className="h-auto px-2 py-0.5 text-[10px]">
          إعادة التحليل
        </Button>
      </div>
      <p className="text-foreground leading-relaxed">
        يلاحظ النظام أن AVAXUSDT يتحرك داخل موجة هبوط رئيسية على الفريمات الكبيرة (4H, 1D)، لكنه يظهر
        <span className="text-success font-semibold"> إشارات ارتداد قصيرة</span> على فريم 15m و 1H بعد دخول حجم
        شراء واضح من منطقة 14.20 - 14.40.
      </p>
      <ul className="list-disc pr-4 space-y-1 text-muted-foreground">
        <li>تقاطع إيجابي محتمل في MACD على فريم 1H مع تحسن تدريجي في الزخم.</li>
        <li>ظهور نموذج قاع مزدوج صغير على فريم 15m عند منطقة 14.20 - 14.25.</li>
        <li>RSI يخرج من التشبع البيعي على الفريمات القصيرة مع ارتفاع تدريجي في الفوليوم.</li>
      </ul>
      <p className="text-foreground">
        <span className="font-semibold text-success">الخلاصة:</span> الصفقة مناسبة أكثر للمتداول قصير المدى الذي
        يقبل مخاطرة متوسطة مع التزام صارم بوقف الخسارة وعدم ملاحقة السعر في حال فشل الاختراق فوق 14.90.
      </p>
    </Card>
  );
};

export default AIAnalysis;
