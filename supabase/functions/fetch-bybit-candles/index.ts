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

    // Get parameters from request
    const { symbol, timeframe, limit } = await req.json().catch(() => ({
      symbol: 'BTCUSDT',
      timeframe: '1', // 1 minute
      limit: 200,
    }));

    console.log(`Fetching candles for ${symbol}, timeframe: ${timeframe}, limit: ${limit}`);

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
      throw new Error(`Bybit API error: ${response.statusText}`);
    }

    const bybitData: BybitResponse = await response.json();

    if (bybitData.retCode !== 0) {
      throw new Error(`Bybit API error: ${bybitData.retMsg}`);
    }

    console.log(`Fetched ${bybitData.result.list.length} candles from Bybit`);

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
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully updated ${data?.length || 0} candles`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: data?.length || 0,
        candles: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-bybit-candles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
