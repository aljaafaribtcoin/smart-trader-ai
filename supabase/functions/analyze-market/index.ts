import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Import analysis types
type TimeframeId = '1d' | '4h' | '1h' | '15m' | '5m' | '3m' | '1m';

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TimeframeData {
  timeframe: TimeframeId;
  candles: Candle[];
}

interface SymbolMarketData {
  symbol: string;
  timeframes: TimeframeData[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { symbol, timeframes, userId } = await req.json();
    
    console.log(`[analyze-market] Starting analysis for ${symbol}, timeframes:`, timeframes);

    // Validate inputs
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const requestedTimeframes: TimeframeId[] = timeframes || ['1d', '4h', '1h', '15m'];

    // Fetch candles from database for each timeframe
    const marketData: SymbolMarketData = {
      symbol,
      timeframes: []
    };

    for (const tf of requestedTimeframes) {
      const { data: candles, error } = await supabaseClient
        .from('market_candles')
        .select('timestamp, open, high, low, close, volume')
        .eq('symbol', symbol)
        .eq('timeframe', tf)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) {
        console.error(`[analyze-market] Error fetching ${tf} candles:`, error);
        continue;
      }

      if (candles && candles.length > 0) {
        // Convert to proper format and sort ascending
        const formattedCandles: Candle[] = candles
          .reverse()
          .map(c => ({
            timestamp: new Date(c.timestamp).getTime(),
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
            volume: Number(c.volume)
          }));

        marketData.timeframes.push({
          timeframe: tf,
          candles: formattedCandles
        });
        
        console.log(`[analyze-market] Loaded ${formattedCandles.length} candles for ${tf}`);
      }
    }

    if (marketData.timeframes.length === 0) {
      throw new Error(`No candle data found for ${symbol}`);
    }

    // Call the analysis engine
    // Note: In production, you would import the actual analysis engine
    // For now, we'll invoke it through a separate function call or use a simplified version
    const { data: analysisData, error: analysisError } = await supabaseClient.functions.invoke(
      'run-analysis-engine',
      { body: { marketData } }
    );

    let analysisResult;
    
    if (analysisError || !analysisData) {
      console.log('[analyze-market] Using fallback analysis');
      // Fallback: Create a basic analysis result
      analysisResult = createFallbackAnalysis(marketData);
    } else {
      analysisResult = analysisData;
    }

    // Save analysis result
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from('analysis_results')
      .insert({
        symbol,
        timeframe: requestedTimeframes[0],
        bias: analysisResult.bias,
        confidence: analysisResult.confidence,
        market_condition: analysisResult.marketCondition,
        analysis_data: analysisResult,
        user_id: userId || null
      })
      .select()
      .single();

    if (saveError) {
      console.error('[analyze-market] Error saving analysis:', saveError);
    }

    // Save signals if any
    if (analysisResult.signals && analysisResult.signals.length > 0) {
      const signalsToInsert = analysisResult.signals.map((signal: any) => ({
        symbol,
        direction: signal.direction,
        confidence: signal.confidence,
        entry_from: signal.entryZone.from,
        entry_to: signal.entryZone.to,
        stop_loss: signal.stopLoss,
        tp1: signal.targets.tp1,
        tp2: signal.targets.tp2,
        tp3: signal.targets.tp3,
        risk_reward: signal.riskReward,
        main_scenario: signal.mainScenario,
        alternative_scenario: signal.alternativeScenario,
        invalidation_price: signal.invalidationPrice,
        telegram_summary: analysisResult.telegramSummary,
        supporting_factors: signal.supportingFactors,
        tags: signal.tags,
        user_id: userId || null
      }));

      const { error: signalsError } = await supabaseClient
        .from('trading_signals')
        .insert(signalsToInsert);

      if (signalsError) {
        console.error('[analyze-market] Error saving signals:', signalsError);
      } else {
        console.log(`[analyze-market] Saved ${signalsToInsert.length} signals`);
      }
    }

    console.log(`[analyze-market] Analysis completed for ${symbol}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[analyze-market] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

// Fallback analysis when main engine is unavailable
function createFallbackAnalysis(marketData: SymbolMarketData) {
  const primaryTf = marketData.timeframes[0];
  const candles = primaryTf.candles;
  const lastCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  
  // Simple trend detection
  const closes = candles.slice(-20).map(c => c.close);
  const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length;
  const trend = lastCandle.close > avgClose ? 'bullish' : 'bearish';
  
  // Simple RSI calculation
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < Math.min(14, candles.length); i++) {
    const change = candles[candles.length - i].close - candles[candles.length - i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }
  const rs = gains / (losses || 1);
  const rsi = 100 - (100 / (1 + rs));
  
  const bias = trend === 'bullish' ? 'long' : 'short';
  const confidence = Math.min(Math.max(Math.round(50 + Math.abs(rsi - 50)), 40), 85);

  return {
    symbol: marketData.symbol,
    generatedAt: Date.now(),
    bias,
    confidence,
    marketCondition: 'trending' as const,
    timeframeAnalysis: {
      [primaryTf.timeframe]: {
        structure: {
          trend,
          lastSwingHigh: Math.max(...candles.slice(-20).map(c => c.high)),
          lastSwingLow: Math.min(...candles.slice(-20).map(c => c.low))
        },
        momentum: {
          rsi,
          rsiSignal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'
        }
      }
    },
    multiTimeframe: {
      globalBias: bias,
      alignedTimeframes: [primaryTf.timeframe],
      conflictingTimeframes: [],
      dominantTimeframe: primaryTf.timeframe,
      confluenceScore: confidence,
      comment: `التحليل الأساسي يظهر اتجاه ${trend === 'bullish' ? 'صاعد' : 'هابط'}`
    },
    keyLevels: [],
    signals: [],
    narrative: {
      overview: `السعر الحالي ${lastCandle.close.toFixed(2)} في اتجاه ${trend === 'bullish' ? 'صاعد' : 'هابط'}`,
      strengthPoints: [
        `مؤشر RSI عند ${rsi.toFixed(1)}`
      ],
      weakPoints: [],
      warnings: ['هذا تحليل أساسي - استخدم المحرك المتقدم للحصول على نتائج أفضل']
    },
    telegramSummary: `${marketData.symbol}: ${trend === 'bullish' ? '📈' : '📉'} | الثقة: ${confidence}%`
  };
}
