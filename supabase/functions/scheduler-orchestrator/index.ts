import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { task } = await req.json();
    const results: any = {};

    console.log(`[Scheduler] Running task: ${task || 'all'}`);

    // Define target symbols for all operations
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'AVAXUSDT'];
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

    // Task 1: Sync market prices (every minute)
    if (!task || task === 'sync-prices') {
      console.log('[Scheduler] Running: Sync market prices');
      const pricesResult = await supabase.functions.invoke('sync-market-prices', {
        body: { symbols }
      });
      results.syncPrices = {
        success: !pricesResult.error,
        data: pricesResult.data,
        error: pricesResult.error?.message
      };
    }

    // Task 2: Fetch candles (every 3 minutes)
    if (!task || task === 'fetch-candles') {
      console.log('[Scheduler] Running: Fetch candles');
      const candleResults = [];
      
      for (const timeframe of timeframes) {
        const result = await supabase.functions.invoke('fetch-bybit-candles', {
          body: { 
            timeframe,
            limit: timeframe === '1m' ? 200 : 500
          }
        });
        
        candleResults.push({
          timeframe,
          success: !result.error,
          updated: result.data?.totalUpdated || 0,
          error: result.error?.message
        });
      }
      
      results.fetchCandles = candleResults;
    }

    // Task 3: Calculate indicators (every 5 minutes)
    if (!task || task === 'calculate-indicators') {
      console.log('[Scheduler] Running: Calculate indicators');
      const indicatorResults = [];
      
      for (const symbol of symbols) {
        for (const timeframe of ['15m', '1h', '4h', '1d']) {
          const result = await supabase.functions.invoke('calculate-technical-indicators', {
            body: { symbol, timeframe }
          });
          
          indicatorResults.push({
            symbol,
            timeframe,
            success: !result.error,
            indicators: result.data?.indicators,
            error: result.error?.message
          });
        }
      }
      
      results.calculateIndicators = indicatorResults;
    }

    // Task 4: Detect patterns (every 15 minutes)
    if (!task || task === 'detect-patterns') {
      console.log('[Scheduler] Running: Detect patterns');
      const patternResults = [];
      
      for (const symbol of symbols) {
        for (const timeframe of ['1h', '4h', '1d']) {
          const result = await supabase.functions.invoke('detect-patterns', {
            body: { symbol, timeframe }
          });
          
          patternResults.push({
            symbol,
            timeframe,
            success: !result.error,
            patterns: result.data?.patterns,
            error: result.error?.message
          });
        }
      }
      
      results.detectPatterns = patternResults;
    }

    // Task 5: Generate signals (every hour)
    if (!task || task === 'generate-signals') {
      console.log('[Scheduler] Running: Generate signals');
      const signalResults = [];
      
      for (const symbol of symbols) {
        const result = await supabase.functions.invoke('generate-trading-signals', {
          body: { 
            symbol,
            timeframe: '1h'
          }
        });
        
        signalResults.push({
          symbol,
          success: !result.error,
          signal: result.data?.signal,
          error: result.error?.message
        });
      }
      
      results.generateSignals = signalResults;
    }

    console.log(`[Scheduler] Task completed: ${task || 'all'}`);

    return new Response(JSON.stringify({
      success: true,
      task: task || 'all',
      timestamp: new Date().toISOString(),
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[Scheduler] Error:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});