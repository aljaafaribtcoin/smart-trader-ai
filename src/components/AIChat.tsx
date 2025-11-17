import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "تحليلي الحالي لـ AVAXUSDT: السعر في ارتداد قصير من منطقة طلب قوية. يمكنك استغلال الحركة قصير المدى طالما لم يغلق اليومي أسفل 14.10.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "بناءً على التحليل الفني، أنصح بانتظار شمعة تأكيد على فريم 15 دقيقة فوق مستوى 14.50 قبل الدخول.",
        "المؤشرات الفنية تشير إلى قوة نسبية متزايدة. يمكن الدخول الآن مع وضع وقف خسارة محكم عند 14.18.",
        "السيولة الحالية داعمة للصعود، لكن احذر من مستوى المقاومة عند 15.80.",
        "اكتشفت نمط قاع مزدوج على فريم 15 دقيقة. هذه إشارة إيجابية للارتداد.",
        "حجم التداول يتزايد تدريجيًا. انتظر كسر مستوى 14.90 للتأكيد.",
      ];

      const aiMessage: Message = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Card className="p-3 flex-1 flex flex-col shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground">مساعد التداول الذكي (Chat AI)</h3>
        <span className="text-[10px] text-success flex items-center gap-1 animate-pulse">● متصل</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-1 mb-2 min-h-[200px] max-h-[400px]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1 animate-fade-in ${
              msg.role === "assistant" ? "items-start" : "items-end"
            }`}
          >
            <div
              className={`px-2 py-1 rounded-xl border max-w-[90%] transition-all duration-200 hover:scale-[1.02] ${
                msg.role === "assistant"
                  ? "bg-muted text-foreground border-border"
                  : "bg-primary text-primary-foreground border-primary"
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[9px] text-muted-foreground">
              {msg.role === "assistant" ? "AI" : "أنت"} • {msg.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start gap-1 animate-fade-in">
            <div className="px-2 py-1 rounded-xl bg-muted border border-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 text-[11px]">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل خبير التداول AI عن العملة أو الفريم أو الصفقة..."
          className="flex-1 h-auto px-3 py-2 text-xs bg-muted border"
          disabled={isTyping}
        />
        <Button 
          type="submit" 
          disabled={isTyping || !input.trim()}
          className="h-auto px-3 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-200 hover:scale-105"
        >
          إرسال
        </Button>
      </form>
    </Card>
  );
};

export default AIChat;
