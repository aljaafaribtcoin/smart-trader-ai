import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Advanced RSI Calculation with Wilder's Smoothing
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Exponential Moving Average
function calculateEMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

// MACD Calculation
function calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12 - ema26;
  
  const macdValues: number[] = [];
  for (let i = 26; i < closes.length; i++) {
    const slice = closes.slice(0, i + 1);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdValues.push(e12 - e26);
  }
  
  const signal = calculateEMA(macdValues, 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

// Bollinger Bands
function calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} {
  if (closes.length < period) {
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    return { upper: avg, middle: avg, lower: avg };
  }
  
  const slice = closes.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: middle + (std * stdDev),
    middle,
    lower: middle - (std * stdDev),
  };
}

// Average True Range
function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 0;
  
  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trueRanges.push(tr);
  }
  
  return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
}

// Stochastic Oscillator
function calculateStochastic(candles: Candle[], period: number = 14, smoothK: number = 3): {
  k: number;
  d: number;
} {
  if (candles.length < period) return { k: 50, d: 50 };
  
  const slice = candles.slice(-period);
  const currentClose = slice[slice.length - 1].close;
  const lowestLow = Math.min(...slice.map(c => c.low));
  const highestHigh = Math.max(...slice.map(c => c.high));
  
  const k = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  const kValues: number[] = [];
  for (let i = period; i <= candles.length; i++) {
    const s = candles.slice(i - period, i);
    const close = s[s.length - 1].close;
    const low = Math.min(...s.map(c => c.low));
    const high = Math.max(...s.map(c => c.high));
    const kVal = high === low ? 50 : ((close - low) / (high - low)) * 100;
    kValues.push(kVal);
  }
  
  const d = kValues.slice(-smoothK).reduce((a, b) => a + b, 0) / smoothK;
  return { k, d };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { symbol, timeframe } = await req.json().catch(() => ({}));
    
    if (!symbol || !timeframe) {
      throw new Error('Symbol and timeframe are required');
    }

    console.log(`[Indicators] Calculating for ${symbol} ${timeframe}`);

    await supabase.from('data_sync_status').upsert({
      data_type: 'indicators',
      symbol,
      timeframe,
      source: 'calculation',
      status: 'syncing',
      last_sync_at: new Date().toISOString(),
    }, { onConflict: 'data_type,symbol,timeframe,source' });

    const { data: candles, error: candlesError } = await supabase
      .from('market_candles')
      .select('*')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .order('timestamp', { ascending: true })
      .limit(500);

    if (candlesError) throw candlesError;
    if (!candles || candles.length < 50) {
      throw new Error(`Insufficient data: ${candles?.length || 0} candles`);
    }

    console.log(`[Indicators] Processing ${candles.length} candles`);

    const closes = candles.map(c => c.close);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes);
    const bb = calculateBollingerBands(closes, 20, 2);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const ema200 = calculateEMA(closes, 200);
    const atr = calculateATR(candles, 14);
    const stochastic = calculateStochastic(candles, 14, 3);

    console.log(`[Indicators] RSI=${rsi.toFixed(2)}, MACD=${macd.macd.toFixed(2)}`);

    const indicatorData = {
      symbol,
      timeframe,
      rsi: Math.round(rsi * 100) / 100,
      macd_value: Math.round(macd.macd * 100) / 100,
      macd_signal: Math.round(macd.signal * 100) / 100,
      macd_histogram: Math.round(macd.histogram * 100) / 100,
      bb_upper: Math.round(bb.upper * 100) / 100,
      bb_middle: Math.round(bb.middle * 100) / 100,
      bb_lower: Math.round(bb.lower * 100) / 100,
      ema_20: Math.round(ema20 * 100) / 100,
      ema_50: Math.round(ema50 * 100) / 100,
      ema_200: Math.round(ema200 * 100) / 100,
      atr: Math.round(atr * 100) / 100,
      stochastic_k: Math.round(stochastic.k * 100) / 100,
      stochastic_d: Math.round(stochastic.d * 100) / 100,
      calculated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('technical_indicators')
      .upsert(indicatorData, { onConflict: 'symbol,timeframe' });

    if (insertError) throw insertError;

    await supabase.from('data_sync_status').upsert({
      data_type: 'indicators',
      symbol,
      timeframe,
      source: 'calculation',
      status: 'success',
      error_message: null,
      retry_count: 0,
      last_sync_at: new Date().toISOString(),
      next_sync_at: new Date(Date.now() + 300000).toISOString(),
      metadata: { candles_used: candles.length, indicators_calculated: 13 }
    }, { onConflict: 'data_type,symbol,timeframe,source' });

    console.log(`[Indicators] Successfully stored for ${symbol} ${timeframe}`);

    return new Response(JSON.stringify({
      success: true,
      symbol,
      timeframe,
      indicators: indicatorData,
      candlesUsed: candles.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[Indicators] Error:', error);
    
    try {
      const { symbol, timeframe } = await req.json().catch(() => ({}));
      if (symbol && timeframe) {
        await supabase.from('data_sync_status').upsert({
          data_type: 'indicators',
          symbol,
          timeframe,
          source: 'calculation',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          last_sync_at: new Date().toISOString(),
          next_sync_at: new Date(Date.now() + 60000).toISOString(),
        }, { onConflict: 'data_type,symbol,timeframe,source' });
      }
    } catch {}

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
