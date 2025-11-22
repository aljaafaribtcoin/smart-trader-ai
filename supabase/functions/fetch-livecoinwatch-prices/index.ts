import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
  delta: {
    hour: number;
    day: number;
    week: number;
    month: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const liveCoinWatchKey = Deno.env.get('LIVECOINWATCH_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get symbols from request or use defaults
    const { symbols } = await req.json().catch(() => ({ 
      symbols: ['BTC', 'ETH', 'AVAX', 'SEI', 'SOL', 'BNB'] 
    }));

    console.log('Fetching prices for symbols:', symbols);

    // Fetch prices from LiveCoinWatch
    const response = await fetch('https://api.livecoinwatch.com/coins/list', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': liveCoinWatchKey,
      },
      body: JSON.stringify({
        currency: 'USD',
        sort: 'rank',
        order: 'ascending',
        offset: 0,
        limit: 100,
        meta: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`LiveCoinWatch API error: ${response.statusText}`);
    }

    const allCoins: LiveCoinWatchCoin[] = await response.json();
    console.log(`Fetched ${allCoins.length} coins from LiveCoinWatch`);

    // Filter for requested symbols
    const filteredCoins = allCoins.filter(coin => 
      symbols.includes(coin.code)
    );

    console.log(`Filtered to ${filteredCoins.length} requested coins`);

    // Prepare data for insertion
    const priceData = filteredCoins.map(coin => ({
      symbol: coin.code + 'USDT', // Add USDT suffix for consistency
      price: coin.rate,
      volume_24h: coin.volume,
      change_24h: coin.delta.day,
      change_7d: coin.delta.week,
      change_30d: coin.delta.month,
      high_24h: null, // Not provided by LiveCoinWatch
      low_24h: null, // Not provided by LiveCoinWatch
      market_cap: coin.cap,
      source: 'livecoinwatch',
      last_updated: new Date().toISOString(),
    }));

    // Upsert into market_prices table
    const { data, error } = await supabase
      .from('market_prices')
      .upsert(priceData, {
        onConflict: 'symbol,source',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully updated ${data?.length || 0} prices`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: data?.length || 0,
        prices: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-livecoinwatch-prices:', error);
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
