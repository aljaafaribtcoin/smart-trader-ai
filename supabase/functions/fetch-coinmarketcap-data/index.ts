import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CMCCryptocurrency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      market_cap: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
    };
  };
}

interface CMCResponse {
  data: CMCCryptocurrency[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const cmcApiKey = Deno.env.get('COINMARKETCAP_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get limit from request or use default
    const { limit } = await req.json().catch(() => ({ limit: 100 }));

    console.log(`Fetching top ${limit} cryptocurrencies from CoinMarketCap`);

    // Fetch latest listings from CoinMarketCap
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${limit}&convert=USD`,
      {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': cmcApiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }

    const cmcData: CMCResponse = await response.json();
    console.log(`Fetched ${cmcData.data.length} cryptocurrencies from CoinMarketCap`);

    // Filter for only the 7 target symbols
    const targetSymbols = ['BTC', 'ETH', 'CAKE', 'AVAX', 'SUI', 'SEI', 'PEPE'];
    const filteredData = cmcData.data.filter(crypto => targetSymbols.includes(crypto.symbol));
    
    console.log(`Filtered to ${filteredData.length} target cryptocurrencies`);

    // Transform data for market_symbols table
    const symbolData = filteredData.map(crypto => ({
      symbol: crypto.symbol + 'USDT',
      name: crypto.name,
      description: `${crypto.name} (${crypto.symbol}) - Rank #${crypto.cmc_rank}`,
      logo_url: `https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`,
      website_url: `https://coinmarketcap.com/currencies/${crypto.slug}/`,
      market_cap: crypto.quote.USD.market_cap,
      rank: crypto.cmc_rank,
      circulating_supply: crypto.circulating_supply,
      max_supply: crypto.max_supply,
      total_supply: crypto.total_supply,
    }));

    // Upsert into market_symbols table
    const { data: symbolsData, error: symbolsError } = await supabase
      .from('market_symbols')
      .upsert(symbolData, {
        onConflict: 'symbol',
        ignoreDuplicates: false,
      })
      .select();

    if (symbolsError) {
      console.error('Database error (symbols):', symbolsError);
      throw symbolsError;
    }

    console.log(`Successfully updated ${symbolsData?.length || 0} symbols`);

    // Also update market_prices with CMC data
    const priceData = filteredData.map(crypto => ({
      symbol: crypto.symbol + 'USDT',
      price: crypto.quote.USD.price,
      volume_24h: crypto.quote.USD.volume_24h,
      change_24h: crypto.quote.USD.percent_change_24h,
      change_7d: crypto.quote.USD.percent_change_7d,
      market_cap: crypto.quote.USD.market_cap,
      source: 'coinmarketcap',
      last_updated: new Date().toISOString(),
    }));

    const { data: pricesData, error: pricesError } = await supabase
      .from('market_prices')
      .upsert(priceData, {
        onConflict: 'symbol,source',
        ignoreDuplicates: false,
      })
      .select();

    if (pricesError) {
      console.error('Database error (prices):', pricesError);
      throw pricesError;
    }

    console.log(`Successfully updated ${pricesData?.length || 0} prices`);

    return new Response(
      JSON.stringify({
        success: true,
        symbols_updated: symbolsData?.length || 0,
        prices_updated: pricesData?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-coinmarketcap-data:', error);
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
