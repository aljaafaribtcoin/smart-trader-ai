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
  delta?: {
    hour?: number;
    day?: number;
    week?: number;
    month?: number;
  };
  png64?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 بدء تهيئة البيانات من LiveCoinWatch...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const liveCoinWatchKey = Deno.env.get("LIVECOINWATCH_API_KEY");

    if (!liveCoinWatchKey) {
      throw new Error("LIVECOINWATCH_API_KEY غير موجود");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // العملات المطلوبة (7 عملات محددة فقط)
    const symbols = ["BTC", "ETH", "CAKE", "AVAX", "SUI", "SEI", "PEPE"];
    
    console.log(`📊 جلب بيانات ${symbols.length} عملة من LiveCoinWatch...`);

    // جلب البيانات من LiveCoinWatch
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
      const errorText = await response.text();
      console.error("❌ خطأ في استجابة LiveCoinWatch:", errorText);
      throw new Error(`LiveCoinWatch API error: ${response.status}`);
    }

    const allCoins: LiveCoinWatchCoin[] = await response.json();
    console.log(`✅ تم جلب ${allCoins.length} عملة من LiveCoinWatch`);

    // تصفية العملات المطلوبة فقط
    const requestedCoins = allCoins.filter((coin) => 
      symbols.includes(coin.code)
    );

    console.log(`🔍 تم العثور على ${requestedCoins.length} عملة من القائمة المطلوبة`);

    // تحديث جدول market_prices
    const pricesData = requestedCoins.map((coin) => ({
      symbol: `${coin.code}USDT`,
      price: coin.rate || 0,
      volume_24h: coin.volume || 0,
      market_cap: coin.cap || 0,
      change_24h: coin.delta?.day || 0,
      change_7d: coin.delta?.week || 0,
      change_30d: coin.delta?.month || 0,
      high_24h: coin.rate ? coin.rate * (1 + ((coin.delta?.day || 0) / 100) / 2) : null,
      low_24h: coin.rate ? coin.rate * (1 - ((coin.delta?.day || 0) / 100) / 2) : null,
      source: "livecoinwatch",
      last_updated: new Date().toISOString(),
    }));

    console.log("💾 تحديث جدول market_prices...");
    const { error: pricesError } = await supabase
      .from("market_prices")
      .upsert(pricesData, {
        onConflict: "symbol,source",
        ignoreDuplicates: false,
      });

    if (pricesError) {
      console.error("❌ خطأ في تحديث الأسعار:", pricesError);
      throw pricesError;
    }

    console.log(`✅ تم تحديث ${pricesData.length} سعر في market_prices`);

    // تحديث جدول market_symbols
    const symbolsData = requestedCoins.map((coin) => ({
      symbol: `${coin.code}USDT`,
      name: coin.name || coin.code,
      market_cap: coin.cap || 0,
      logo_url: coin.png64 ? `data:image/png;base64,${coin.png64}` : null,
      rank: allCoins.findIndex((c) => c.code === coin.code) + 1,
      updated_at: new Date().toISOString(),
    }));

    console.log("💾 تحديث جدول market_symbols...");
    const { error: symbolsError } = await supabase
      .from("market_symbols")
      .upsert(symbolsData, {
        onConflict: "symbol",
        ignoreDuplicates: false,
      });

    if (symbolsError) {
      console.error("❌ خطأ في تحديث الرموز:", symbolsError);
      throw symbolsError;
    }

    console.log(`✅ تم تحديث ${symbolsData.length} رمز في market_symbols`);

    // ملاحظة: لم نعد ننشئ شموع وهمية من LiveCoinWatch
    // سيتم جلب الشموع الحقيقية من Bybit عبر fetch-bybit-candles
    console.log("ℹ️ تم تخطي إنشاء الشموع - سيتم جلبها من Bybit");

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      prices_updated: pricesData.length,
      symbols_updated: symbolsData.length,
      candles_inserted: 0, // Bybit will handle candles
      source: "livecoinwatch",
    };

    console.log("🎉 اكتمل التهيئة بنجاح:", summary);

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ خطأ في initialize-market-data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorStack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
