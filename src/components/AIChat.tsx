import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AIChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !user) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      // Save user message to database
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: input,
      });

      // Stream AI response
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل الاتصال بـ AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (!reader) throw new Error("لا يوجد رد من الخادم");

      // Create assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "خطأ في الدردشة",
        description: error.message || "حدث خطأ أثناء الاتصال بـ AI",
        variant: "destructive",
      });
      // Remove the empty assistant message
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Card className="p-3 flex-1 flex flex-col shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground">مساعد التداول الذكي (Chat AI)</h3>
        <span className="text-[10px] text-success flex items-center gap-1 animate-pulse">● متصل</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-1 mb-2 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="mb-2">👋 مرحباً! أنا مساعد التداول الذكي</p>
            <p className="text-xs">اسألني عن أي شيء يتعلق بالتداول والعملات الرقمية</p>
          </div>
        )}
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
              {msg.role === "assistant" ? "AI" : "أنت"}
            </span>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
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
          disabled={isStreaming}
        />
        <Button 
          type="submit" 
          disabled={isStreaming || !input.trim()}
          className="h-auto px-3 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-200 hover:scale-105"
        >
          {isStreaming ? "..." : "إرسال"}
        </Button>
      </form>
    </Card>
  );
};

export default AIChat;
