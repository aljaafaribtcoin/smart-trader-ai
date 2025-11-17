import { Button } from "./ui/button";
import { Card } from "./ui/card";

const TradeCard = () => {
  return (
    <Card className="p-3 flex flex-col gap-3 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">صفقة AI المقترحة (Confluence)</h3>
          <p className="text-[11px] text-muted-foreground">
            تجميع إشارات المؤشرات + النماذج + السيولة + السلوك السعري
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] text-muted-foreground mb-0.5">درجة الثقة</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-success">84 / 100</span>
            <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
              <div className="w-[84%] h-full bg-gradient-to-l from-success to-warning"></div>
            </div>
          </div>
        </div>
      </div>

      <Card className="flex items-center justify-between bg-muted/50 px-2.5 py-2 text-xs">
        <div>
          <div className="text-muted-foreground">نوع الصفقة المقترح</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/50 font-semibold">
              ✅ Long (شراء)
            </span>
            <span className="px-2 py-1 rounded-full bg-muted border">Swing / ارتداد متوسط</span>
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div>
            RR التقريبي: <span className="font-semibold text-success">3 : 1</span>
          </div>
          <div>
            قوة الإشارة: <span className="font-semibold text-success">قوية</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Card className="bg-muted/50 p-2 border-success/40">
          <div className="text-muted-foreground mb-0.5">منطقة الدخول</div>
          <div className="text-sm font-semibold text-success">14.40 - 14.55</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            يفضل انتظار شمعة تأكيد فوق EMA 8
          </div>
        </Card>
        <Card className="bg-muted/50 p-2 border-destructive/40">
          <div className="text-muted-foreground mb-0.5">وقف الخسارة الذكي</div>
          <div className="text-sm font-semibold text-destructive">14.18</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">أسفل آخر قاع + أسفل منطقة الطلب</div>
        </Card>
        <Card className="bg-muted/50 p-2 border-warning/40">
          <div className="text-muted-foreground mb-0.5">أهداف الربح</div>
          <div className="text-[10px]">
            TP1: <span className="font-semibold text-warning">14.90</span>
            <br />
            TP2: <span className="font-semibold text-warning">15.30</span>
            <br />
            TP3: <span className="font-semibold text-warning">15.80</span>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-2 mt-1 text-xs">
        <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
          تنفيذ صفقة Long مقترحة
        </Button>
        <Button variant="outline">تعديل يدوي</Button>
      </div>
    </Card>
  );
};

export default TradeCard;
