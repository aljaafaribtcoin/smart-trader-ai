import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const liveCoinWatchKey = Deno.env.get('LIVECOINWATCH_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request for optional symbol filter
    const { symbols } = await req.json().catch(() => ({ symbols: null }));
    
    const targetSymbols = symbols || ['BTC', 'ETH', 'CAKE', 'AVAX', 'SUI', 'SEI', 'PEPE'];
    
    console.log('[Sync Prices] Starting sync for symbols:', targetSymbols);

    // Update sync status to 'syncing'
    for (const symbol of targetSymbols) {
      await supabase.from('data_sync_status').upsert({
        data_type: 'prices',
        symbol,
        source: 'livecoinwatch',
        status: 'syncing',
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'data_type,symbol,timeframe,source'
      });
    }

    // Fetch from LiveCoinWatch API
    const response = await fetch('https://api.livecoinwatch.com/coins/list', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': liveCoinWatchKey || '',
      },
      body: JSON.stringify({
        currency: 'USD',
        sort: 'rank',
        order: 'ascending',
        offset: 0,
        limit: 100,
        meta: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LiveCoinWatch API error: ${response.status}`);
    }

    const coins: LiveCoinWatchCoin[] = await response.json();
    console.log(`[Sync Prices] Fetched ${coins.length} coins from LiveCoinWatch`);

    // Filter for target symbols
    const filteredCoins = coins.filter(coin => 
      targetSymbols.includes(coin.code)
    );

    console.log(`[Sync Prices] Filtered to ${filteredCoins.length} target coins`);

    if (filteredCoins.length === 0) {
      throw new Error('No coins found for target symbols');
    }

    // Prepare data for market_prices table
    const pricesData = filteredCoins.map(coin => ({
      symbol: coin.code,
      price: coin.rate,
      volume_24h: coin.volume,
      market_cap: coin.cap,
      change_24h: coin.delta?.day || 0,
      change_7d: coin.delta?.week || 0,
      change_30d: coin.delta?.month || 0,
      source: 'livecoinwatch',
      last_updated: new Date().toISOString(),
    }));

    // Upsert prices
    const { error: pricesError, data: pricesResult } = await supabase
      .from('market_prices')
      .upsert(pricesData, {
        onConflict: 'symbol,source',
      });

    if (pricesError) {
      console.error('[Sync Prices] Error upserting prices:', pricesError);
      
      // Update sync status to 'error'
      for (const symbol of targetSymbols) {
        await supabase.from('data_sync_status').upsert({
          data_type: 'prices',
          symbol,
          source: 'livecoinwatch',
          status: 'error',
          error_message: pricesError.message,
          retry_count: 0,
          last_sync_at: new Date().toISOString(),
          next_sync_at: new Date(Date.now() + 60000).toISOString(), // Retry in 1 minute
        }, {
          onConflict: 'data_type,symbol,timeframe,source'
        });
      }
      
      throw pricesError;
    }

    // Update sync status to 'success'
    for (const symbol of targetSymbols) {
      await supabase.from('data_sync_status').upsert({
        data_type: 'prices',
        symbol,
        source: 'livecoinwatch',
        status: 'success',
        error_message: null,
        retry_count: 0,
        last_sync_at: new Date().toISOString(),
        next_sync_at: new Date(Date.now() + 300000).toISOString(), // Next sync in 5 minutes
        metadata: {
          coins_updated: filteredCoins.length,
        }
      }, {
        onConflict: 'data_type,symbol,timeframe,source'
      });
    }

    console.log(`[Sync Prices] Successfully synced ${filteredCoins.length} prices`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: filteredCoins.length,
        symbols: filteredCoins.map(c => c.code),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Sync Prices] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
