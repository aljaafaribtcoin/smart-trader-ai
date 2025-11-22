import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting market data initialization...");

    const results = {
      prices: 0,
      candles: 0,
      indicators: 0,
      errors: [] as string[],
    };

    // 1. Fetch prices from LiveCoinWatch
    try {
      const pricesResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-livecoinwatch-prices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbols: ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "AVAX", "DOT"],
        }),
      });

      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json();
        results.prices = pricesData.updated || 0;
        console.log(`Fetched ${results.prices} prices`);
      } else {
        throw new Error(`Prices fetch failed: ${pricesResponse.statusText}`);
      }
    } catch (error) {
      const msg = `Prices error: ${error instanceof Error ? error.message : "Unknown"}`;
      console.error(msg);
      results.errors.push(msg);
    }

    // 2. Fetch candles for main symbols
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];
    const timeframes = ["5m", "15m", "1h", "4h"];

    for (const symbol of symbols) {
      for (const timeframe of timeframes) {
        try {
          const candlesResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-bybit-candles`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              symbol,
              timeframe,
              limit: 100,
            }),
          });

          if (candlesResponse.ok) {
            const candlesData = await candlesResponse.json();
            results.candles += candlesData.updated || 0;
          }
        } catch (error) {
          const msg = `Candles error for ${symbol} ${timeframe}: ${error instanceof Error ? error.message : "Unknown"}`;
          console.error(msg);
          results.errors.push(msg);
        }
      }
    }

    console.log(`Fetched ${results.candles} candles`);

    // 3. Calculate indicators for main symbols and timeframes
    for (const symbol of symbols) {
      for (const timeframe of timeframes) {
        try {
          const indicatorsResponse = await fetch(`${supabaseUrl}/functions/v1/calculate-technical-indicators`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              symbol,
              timeframe,
            }),
          });

          if (indicatorsResponse.ok) {
            const indicatorsData = await indicatorsResponse.json();
            if (indicatorsData.success) {
              results.indicators++;
            }
          }
        } catch (error) {
          const msg = `Indicators error for ${symbol} ${timeframe}: ${error instanceof Error ? error.message : "Unknown"}`;
          console.error(msg);
          results.errors.push(msg);
        }
      }
    }

    console.log(`Calculated ${results.indicators} indicators`);
    console.log("Market data initialization complete");

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `تم تحميل ${results.prices} أسعار، ${results.candles} شموع، ${results.indicators} مؤشرات`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Fatal error in initialize-market-data:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
