import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

/**
 * Hook to automatically refresh Bybit candle data at different intervals
 * based on timeframe requirements
 */
export const useBybitCandlesRefresh = () => {
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const refreshCandles = async (timeframes: string[], intervalName: string) => {
      try {
        console.log(`Refreshing Bybit candles for ${intervalName}:`, timeframes);

        for (const timeframe of timeframes) {
          const { data, error } = await supabase.functions.invoke("fetch-bybit-candles", {
            body: { timeframe, limit: 100 },
          });

          if (error) {
            console.error(`Error refreshing ${timeframe} candles:`, error);
          } else {
            console.log(`Successfully refreshed ${timeframe} candles:`, data);
          }
        }
      } catch (error) {
        console.error(`Error in ${intervalName} refresh:`, error);
      }
    };

    // Initial fetch for all timeframes
    const initialFetch = async () => {
      console.log("Starting initial Bybit candles fetch...");
      const allTimeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];
      
      for (const timeframe of allTimeframes) {
        try {
          await supabase.functions.invoke("fetch-bybit-candles", {
            body: { timeframe, limit: 200 },
          });
        } catch (error) {
          console.error(`Error in initial fetch for ${timeframe}:`, error);
        }
      }
      
      toast({
        title: "تم تحميل بيانات الشموع",
        description: "تم جلب بيانات الشموع من Bybit بنجاح",
      });
    };

    initialFetch();

    // Set up refresh intervals based on timeframe requirements
    // Every 1 minute: 1m, 5m
    const interval1min = setInterval(() => {
      refreshCandles(["1m", "5m"], "1-minute");
    }, 60 * 1000);
    intervalRefs.current.push(interval1min);

    // Every 5 minutes: 15m, 30m
    const interval5min = setInterval(() => {
      refreshCandles(["15m", "30m"], "5-minute");
    }, 5 * 60 * 1000);
    intervalRefs.current.push(interval5min);

    // Every 15 minutes: 1h, 4h
    const interval15min = setInterval(() => {
      refreshCandles(["1h", "4h"], "15-minute");
    }, 15 * 60 * 1000);
    intervalRefs.current.push(interval15min);

    // Every 1 hour: 1d
    const interval1hour = setInterval(() => {
      refreshCandles(["1d"], "1-hour");
    }, 60 * 60 * 1000);
    intervalRefs.current.push(interval1hour);

    // Cleanup
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current = [];
    };
  }, [toast]);

  return null;
};
