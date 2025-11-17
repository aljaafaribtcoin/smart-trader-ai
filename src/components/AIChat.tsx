import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

const AIChat = () => {
  return (
    <Card className="p-3 flex-1 flex flex-col shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground">مساعد التداول الذكي (Chat AI)</h3>
        <span className="text-[10px] text-success flex items-center gap-1">● متصل</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-1 mb-2">
        <div className="flex flex-col items-start gap-1">
          <div className="px-2 py-1 rounded-xl bg-muted border max-w-[90%]">
            تحليلي الحالي لـ AVAXUSDT: السعر في ارتداد قصير من منطقة طلب قوية. يمكنك استغلال الحركة قصير المدى
            طالما لم يغلق اليومي أسفل 14.10.
          </div>
          <span className="text-[9px] text-muted-foreground">AI • الآن</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="px-2 py-1 rounded-xl bg-primary text-primary-foreground border border-primary max-w-[90%]">
            هل تنصحني بالدخول الآن أم انتظار شمعة تأكيد إضافية على 15 دقيقة؟
          </div>
          <span className="text-[9px] text-muted-foreground">أنت</span>
        </div>
      </div>

      <form className="flex items-center gap-2 text-[11px]">
        <Input
          type="text"
          placeholder="اسأل خبير التداول AI عن العملة أو الفريم أو الصفقة..."
          className="flex-1 h-auto px-3 py-2 text-xs bg-muted border"
        />
        <Button type="submit" className="h-auto px-3 py-2 bg-secondary text-secondary-foreground">
          إرسال
        </Button>
      </form>
    </Card>
  );
};

export default AIChat;
