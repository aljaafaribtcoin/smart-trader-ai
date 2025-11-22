import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LiveCoinWatchCoin {
  code: string;
  name: string;
  rate: number;
  volume: number;
  cap: number;
  delta: {
    hour: number;
    day: number;
    week: number;
    month: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting market data initialization...");

    const liveCoinWatchKey = Deno.env.get("LIVECOINWATCH_API_KEY")!;

    const results = {
      prices: 0,
      candles: 0,
      errors: [] as string[],
    };

    // 1. Fetch prices from LiveCoinWatch directly
    try {
      console.log("Fetching prices from LiveCoinWatch...");
      const symbols = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "AVAX", "DOT"];
      
      const response = await fetch("https://api.livecoinwatch.com/coins/list", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": liveCoinWatchKey,
        },
        body: JSON.stringify({
          currency: "USD",
          sort: "rank",
          order: "ascending",
          offset: 0,
          limit: 100,
          meta: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`LiveCoinWatch API error: ${response.statusText}`);
      }

      const allCoins: LiveCoinWatchCoin[] = await response.json();
      const filteredCoins = allCoins.filter((coin) => symbols.includes(coin.code));

      const priceData = filteredCoins.map((coin) => ({
        symbol: coin.code + "USDT",
        price: coin.rate,
        volume_24h: coin.volume,
        change_24h: coin.delta.day,
        change_7d: coin.delta.week,
        change_30d: coin.delta.month,
        market_cap: coin.cap,
        source: "livecoinwatch",
        last_updated: new Date().toISOString(),
      }));

      const { data: pricesInserted, error: pricesError } = await supabase
        .from("market_prices")
        .upsert(priceData, {
          onConflict: "symbol,source",
          ignoreDuplicates: false,
        })
        .select();

      if (pricesError) throw pricesError;
      results.prices = pricesInserted?.length || 0;
      console.log(`Inserted ${results.prices} prices`);
    } catch (error) {
      const msg = `Prices error: ${error instanceof Error ? error.message : "Unknown"}`;
      console.error(msg);
      results.errors.push(msg);
    }

    // 2. Fetch candles from Bybit directly
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];
    const timeframes = ["5m", "15m", "1h", "4h"];
    const intervalMap: Record<string, string> = {
      "5m": "5",
      "15m": "15",
      "1h": "60",
      "4h": "240",
    };

    for (const symbol of symbols) {
      for (const timeframe of timeframes) {
        try {
          console.log(`Fetching candles for ${symbol} ${timeframe}...`);
          const interval = intervalMap[timeframe];
          const bybitUrl = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=100`;

          const response = await fetch(bybitUrl);
          if (!response.ok) {
            throw new Error(`Bybit API error: ${response.statusText}`);
          }

          const bybitData = await response.json();
          if (bybitData.retCode !== 0) {
            throw new Error(`Bybit API error: ${bybitData.retMsg}`);
          }

          const candleData = bybitData.result.list.map((candle: string[]) => ({
            symbol: symbol,
            timeframe: timeframe,
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
            timestamp: new Date(parseInt(candle[0])).toISOString(),
            source: "bybit",
          }));

          const { data: candlesInserted, error: candlesError } = await supabase
            .from("market_candles")
            .upsert(candleData, {
              onConflict: "symbol,timeframe,timestamp,source",
              ignoreDuplicates: false,
            })
            .select();

          if (candlesError) throw candlesError;
          results.candles += candlesInserted?.length || 0;
        } catch (error) {
          const msg = `Candles error for ${symbol} ${timeframe}: ${error instanceof Error ? error.message : "Unknown"}`;
          console.error(msg);
          results.errors.push(msg);
        }
      }
    }

    console.log(`Fetched ${results.candles} candles`);
    console.log("Market data initialization complete");

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `تم تحميل ${results.prices} أسعار و ${results.candles} شموع`,
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
