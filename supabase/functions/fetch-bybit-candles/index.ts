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

// Get sync interval based on timeframe (in milliseconds)
function getSyncInterval(timeframe: string): number {
  const intervals: Record<string, number> = {
    '3m': 180000,      // 3 minutes
    '5m': 300000,      // 5 minutes
    '15m': 900000,     // 15 minutes
    '30m': 1800000,    // 30 minutes
    '1h': 3600000,     // 1 hour
    '4h': 14400000,    // 4 hours
    '1d': 86400000,    // 1 day
  };
  return intervals[timeframe] || 300000; // Default 5 minutes
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get parameters from request or use defaults
    const requestBody = await req.json().catch(() => ({}));
    
    // Define the 7 target symbols - PEPE in Bybit is 1000PEPEUSDT
    const targetSymbols = ['BTCUSDT', 'ETHUSDT', 'CAKEUSDT', 'AVAXUSDT', 'SUIUSDT', 'SEIUSDT', '1000PEPEUSDT'];
    
    // Get symbol from request or process all
    const symbols = requestBody.symbol ? [requestBody.symbol] : targetSymbols;
    const timeframe = requestBody.timeframe || '1m';
    const limit = requestBody.limit || 200;

    console.log(`[Fetch Candles] Starting sync for ${symbols.length} symbols, timeframe: ${timeframe}`);

    // Update sync status to 'syncing'
    for (const symbol of symbols) {
      await supabase.from('data_sync_status').upsert({
        data_type: 'candles',
        symbol,
        timeframe,
        source: 'bybit',
        status: 'syncing',
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'data_type,symbol,timeframe,source'
      });
    }

    // Map timeframe to Bybit interval
    const intervalMap: Record<string, string> = {
      '1m': '1',
      '3m': '3',
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
      try {
        console.log(`[Fetch Candles] Processing ${symbol}...`);

        // Fetch candles from Bybit
        const bybitUrl = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
        
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

        console.log(`[Fetch Candles] Fetched ${bybitData.result.list.length} candles for ${symbol}`);

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
          throw error;
        }

        const updated = data?.length || 0;
        totalUpdated += updated;
        console.log(`[Fetch Candles] Successfully updated ${updated} candles for ${symbol}`);
        
        results.push({
          symbol,
          updated,
          candles: candleData,
        });

        // Update sync status to 'success'
        await supabase.from('data_sync_status').upsert({
          data_type: 'candles',
          symbol,
          timeframe,
          source: 'bybit',
          status: 'success',
          error_message: null,
          retry_count: 0,
          last_sync_at: new Date().toISOString(),
          next_sync_at: new Date(Date.now() + getSyncInterval(timeframe)).toISOString(),
          metadata: {
            candles_updated: updated,
          }
        }, {
          onConflict: 'data_type,symbol,timeframe,source'
        });

      } catch (symbolError) {
        console.error(`[Fetch Candles] Error processing ${symbol}:`, symbolError);
        
        // Update sync status to 'error'
        await supabase.from('data_sync_status').upsert({
          data_type: 'candles',
          symbol,
          timeframe,
          source: 'bybit',
          status: 'error',
          error_message: symbolError instanceof Error ? symbolError.message : 'Unknown error',
          last_sync_at: new Date().toISOString(),
          next_sync_at: new Date(Date.now() + 60000).toISOString(), // Retry in 1 minute
        }, {
          onConflict: 'data_type,symbol,timeframe,source'
        });
      }
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
    console.error('[Fetch Candles] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
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
