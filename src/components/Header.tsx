import { useState } from "react";
import { Button } from "./ui/button";

const Header = () => {
  const [isDark, setIsDark] = useState(true);
  return (
    <header className="h-16 border-b border-border backdrop-blur bg-background/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-xs font-bold text-primary-foreground">AI</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold">Smart Trader AI</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-success/15 text-success border border-success/30">
                v1.0 Alpha
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              مساعد تداول ذكي لتحليل جميع العملات والفريمات بنسبة ثقة عالية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">البورصة</span>
            <Button variant="outline" size="sm" className="h-auto px-2.5 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-1"></span>
              Binance Futures
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-2xl transition-all duration-200 hover:scale-110 hover:rotate-12"
          >
            {isDark ? "☾" : "☀️"}
          </Button>

          <div className="flex items-center gap-2">
            <div className="text-right text-xs hidden sm:block">
              <div className="font-semibold">حساب المتداول</div>
              <div className="text-[10px] text-muted-foreground">خطة: Pro</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-xs font-bold">
              K
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
