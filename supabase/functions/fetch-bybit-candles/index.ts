import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BybitKline {
  startTime: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  closePrice: string;
  volume: string;
  turnover: string;
}

interface BybitResponse {
  retCode: number;
  retMsg: string;
  result: {
    symbol: string;
    category: string;
    list: string[][]; // [timestamp, open, high, low, close, volume, turnover]
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get parameters from request or use defaults
    const requestBody = await req.json().catch(() => ({}));
    
    // Define the 7 target symbols - PEPE in Bybit is 1000PEPEUSDT
    const targetSymbols = ['BTCUSDT', 'ETHUSDT', 'CAKEUSDT', 'AVAXUSDT', 'SUIUSDT', 'SEIUSDT', '1000PEPEUSDT'];
    
    // Get symbol from request or process all
    const symbols = requestBody.symbol ? [requestBody.symbol] : targetSymbols;
    const timeframe = requestBody.timeframe || '1m';
    const limit = requestBody.limit || 200;

    // Map timeframe to Bybit interval
    const intervalMap: Record<string, string> = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D',
      '1w': 'W',
    };

    const interval = intervalMap[timeframe] || '1';
    
    let totalUpdated = 0;
    const results: Array<{ symbol: string; updated: number; candles?: any[] }> = [];

    // Process each symbol
    for (const symbol of symbols) {
      console.log(`Fetching candles for ${symbol}, timeframe: ${timeframe}, limit: ${limit}`);

      // Fetch candles from Bybit
      const bybitUrl = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
      
      console.log('Fetching from Bybit:', bybitUrl);

      const response = await fetch(bybitUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Bybit API error for ${symbol}: ${response.statusText}`);
        continue;
      }

      const bybitData: BybitResponse = await response.json();

      if (bybitData.retCode !== 0) {
        console.error(`Bybit API error for ${symbol}: ${bybitData.retMsg}`);
        continue;
      }

      console.log(`Fetched ${bybitData.result.list.length} candles for ${symbol}`);

      // Transform Bybit data to our format
      const candleData = bybitData.result.list.map((candle: string[]) => ({
        symbol: symbol,
        timeframe: timeframe,
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
        timestamp: new Date(parseInt(candle[0])).toISOString(),
        source: 'bybit',
      }));

      // Upsert into market_candles table
      const { data, error } = await supabase
        .from('market_candles')
        .upsert(candleData, {
          onConflict: 'symbol,timeframe,timestamp,source',
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        console.error(`Database error for ${symbol}:`, error);
        continue;
      }

      const updated = data?.length || 0;
      totalUpdated += updated;
      console.log(`Successfully updated ${updated} candles for ${symbol}`);
      
      results.push({
        symbol,
        updated,
        candles: candleData,
      });
    }

    // Return candles data along with results
    const allCandles = results.flatMap(r => r.candles || []);
    
    return new Response(
      JSON.stringify({
        success: true,
        totalUpdated,
        candles: allCandles,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-bybit-candles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Detailed error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: {
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
