import { Button } from "./ui/button";
import { Notifications } from "./Notifications";
import { ThemeToggle } from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { NavLink } from "./NavLink";
import { SymbolsDropdown } from "./SymbolsDropdown";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border backdrop-blur bg-background/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <span className="text-xs font-bold text-primary-foreground">AI</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold truncate">Smart Trader AI</h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] bg-success/15 text-success border border-success/30 shrink-0">
                v1.0 Alpha
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-muted-foreground truncate">
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
            to="/signals"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            🎯 التوصيات
          </NavLink>
          <NavLink 
            to="/analysis"
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            🔍 التحليل الشامل
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

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <SymbolsDropdown />
          </div>
          
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">مصدر البيانات</span>
            <Button variant="outline" size="sm" className="h-auto px-2.5 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-1"></span>
              3 Sources Active
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Notifications />
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col gap-3 mt-8">
                <NavLink 
                  to="/" 
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏠 الرئيسية
                </NavLink>
                <NavLink 
                  to="/dashboard"
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 الإحصائيات
                </NavLink>
                <NavLink 
                  to="/signals"
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🎯 التوصيات
                </NavLink>
                <NavLink 
                  to="/analysis"
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔍 التحليل الشامل
                </NavLink>
                <NavLink 
                  to="/charts"
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📈 الرسوم البيانية
                </NavLink>
                <NavLink 
                  to="/trades"
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💼 الصفقات
                </NavLink>
                <NavLink 
                  to="/patterns"
                  className="px-4 py-3 rounded-lg text-sm transition-colors hover:bg-muted"
                  activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✨ الأنماط
                </NavLink>

                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  <div className="px-4">
                    <SymbolsDropdown />
                  </div>
                  <div className="flex items-center justify-around px-4">
                    <Notifications />
                    <ThemeToggle />
                    <UserMenu />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
