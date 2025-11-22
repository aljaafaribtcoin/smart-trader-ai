import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTradingStore } from "@/store/tradingStore";
import { ChevronDown } from "lucide-react";

/**
 * قائمة منسدلة لاختيار العملات السبعة المتاحة
 */
export const SymbolsDropdown = () => {
  const { selectedSymbol, setSymbol } = useTradingStore();

  // العملات السبعة المحددة فقط - مع ملاحظة أن PEPE في Bybit هو 1000PEPEUSDT
  const availableSymbols = [
    { symbol: "BTCUSDT", name: "Bitcoin", icon: "₿" },
    { symbol: "ETHUSDT", name: "Ethereum", icon: "Ξ" },
    { symbol: "CAKEUSDT", name: "PancakeSwap", icon: "🥞" },
    { symbol: "AVAXUSDT", name: "Avalanche", icon: "🔺" },
    { symbol: "SUIUSDT", name: "Sui", icon: "💧" },
    { symbol: "SEIUSDT", name: "Sei", icon: "⚡" },
    { symbol: "1000PEPEUSDT", name: "Pepe", icon: "🐸" },
  ];

  const currentSymbol = availableSymbols.find(s => s.symbol === selectedSymbol);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="px-3 py-2 h-auto rounded-xl flex items-center gap-2 hover:bg-muted/50"
        >
          <span className="text-base">{currentSymbol?.icon}</span>
          <div className="text-right">
            <p className="text-sm font-semibold leading-none">
              {currentSymbol?.symbol.replace('1000PEPEUSDT', 'PEPE').replace('USDT', '')}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {currentSymbol?.name}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableSymbols.map((item) => (
          <DropdownMenuItem
            key={item.symbol}
            onClick={() => setSymbol(item.symbol)}
            className={`flex items-center gap-2 cursor-pointer ${
              item.symbol === selectedSymbol ? "bg-primary/10 font-semibold" : ""
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {item.symbol.replace('1000PEPEUSDT', 'PEPE').replace('USDT', '')}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.name}</p>
            </div>
            {item.symbol === selectedSymbol && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
