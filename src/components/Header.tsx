import { Button } from "./ui/button";
import { Notifications } from "./Notifications";
import { ThemeToggle } from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { NavLink } from "./NavLink";
import { SymbolsDropdown } from "./SymbolsDropdown";

const Header = () => {
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink 
            to="/" 
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            🏠 الرئيسية
          </NavLink>
          <NavLink 
            to="/dashboard"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            📊 الإحصائيات
          </NavLink>
          <NavLink 
            to="/charts"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            📈 الرسوم البيانية
          </NavLink>
          <NavLink 
            to="/trades"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            💼 الصفقات
          </NavLink>
          <NavLink 
            to="/patterns"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            ✨ الأنماط
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <SymbolsDropdown />
          
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">مصدر البيانات</span>
            <Button variant="outline" size="sm" className="h-auto px-2.5 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-1"></span>
              3 Sources Active
            </Button>
          </div>

          <Notifications />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
