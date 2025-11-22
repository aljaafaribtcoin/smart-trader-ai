import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple RSI calculation
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default to neutral

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) gains += changes[i];
    else losses += Math.abs(changes[i]);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Simple EMA calculation
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const k = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

// MACD calculation
function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdValue = ema12 - ema26;

  // Simple signal line (9-period EMA of MACD)
  const macdSignal = macdValue * 0.2; // Simplified
  const histogram = macdValue - macdSignal;

  return {
    value: macdValue,
    signal: macdSignal,
    histogram: histogram,
  };
}

// Bollinger Bands calculation
function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const sma = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  const squaredDiffs = prices.slice(-period).map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: sma + (stdDev * std),
    middle: sma,
    lower: sma - (stdDev * std),
  };
}

// ATR calculation
function calculateATR(candles: any[], period: number = 14): number {
  if (candles.length < period) return 0;

  const trueRanges = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
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
    const { symbol, timeframe } = await req.json().catch(() => ({
      symbol: 'BTCUSDT',
      timeframe: '1h',
    }));

    console.log(`Calculating indicators for ${symbol}, timeframe: ${timeframe}`);

    // Fetch candles from database
    const { data: candles, error: candlesError } = await supabase
      .from('market_candles')
      .select('*')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .order('timestamp', { ascending: false })
      .limit(200);

    if (candlesError) {
      console.error('Error fetching candles:', candlesError);
      throw candlesError;
    }

    if (!candles || candles.length < 50) {
      throw new Error('Not enough candle data to calculate indicators');
    }

    console.log(`Found ${candles.length} candles for calculation`);

    // Reverse to get chronological order
    const sortedCandles = [...candles].reverse();
    const closePrices = sortedCandles.map(c => parseFloat(c.close.toString()));

    // Calculate all indicators
    const rsi = calculateRSI(closePrices);
    const macd = calculateMACD(closePrices);
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    const ema200 = calculateEMA(closePrices, 200);
    const bb = calculateBollingerBands(closePrices);
    const atr = calculateATR(sortedCandles);

    // Stochastic calculation (simplified)
    const recentCandles = sortedCandles.slice(-14);
    const highestHigh = Math.max(...recentCandles.map(c => parseFloat(c.high.toString())));
    const lowestLow = Math.min(...recentCandles.map(c => parseFloat(c.low.toString())));
    const currentClose = parseFloat(sortedCandles[sortedCandles.length - 1].close.toString());
    const stochasticK = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const stochasticD = stochasticK * 0.7; // Simplified

    const indicators = {
      symbol,
      timeframe,
      rsi: rsi.toFixed(2),
      macd_value: macd.value.toFixed(2),
      macd_signal: macd.signal.toFixed(2),
      macd_histogram: macd.histogram.toFixed(2),
      stochastic_k: stochasticK.toFixed(2),
      stochastic_d: stochasticD.toFixed(2),
      ema_20: ema20.toFixed(2),
      ema_50: ema50.toFixed(2),
      ema_200: ema200.toFixed(2),
      bb_upper: bb.upper.toFixed(2),
      bb_middle: bb.middle.toFixed(2),
      bb_lower: bb.lower.toFixed(2),
      atr: atr.toFixed(2),
      calculated_at: new Date().toISOString(),
    };

    // Upsert into technical_indicators table
    const { data, error } = await supabase
      .from('technical_indicators')
      .upsert(indicators, {
        onConflict: 'symbol,timeframe',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully calculated and stored indicators`);

    return new Response(
      JSON.stringify({
        success: true,
        indicators: data?.[0] || indicators,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in calculate-technical-indicators:', error);
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
