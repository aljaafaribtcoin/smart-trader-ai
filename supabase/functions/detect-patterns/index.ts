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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { symbols, timeframes } = await req.json().catch(() => ({
      symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
      timeframes: ['1d', '4h', '1h']
    }));

    console.log('[detect-patterns] Starting pattern detection for:', symbols, timeframes);

    const detectedPatterns = [];

    for (const symbol of symbols) {
      for (const timeframe of timeframes) {
        // Fetch recent candles
        const { data: candles, error } = await supabaseClient
          .from('market_candles')
          .select('*')
          .eq('symbol', symbol)
          .eq('timeframe', timeframe)
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error || !candles || candles.length < 20) {
          console.log(`[detect-patterns] Skipping ${symbol} ${timeframe} - insufficient data`);
          continue;
        }

        // Detect patterns
        const patterns = await detectAllPatterns(candles, symbol, timeframe);
        detectedPatterns.push(...patterns);
      }
    }

    console.log(`[detect-patterns] Detected ${detectedPatterns.length} patterns in total`);

    // Update sync status
    await supabaseClient
      .from('data_sync_status')
      .upsert({
        data_type: 'patterns',
        symbol: symbols.join(','),
        timeframe: timeframes.join(','),
        source: 'detect-patterns',
        status: 'success',
        last_sync_at: new Date().toISOString(),
        metadata: { patterns_detected: detectedPatterns.length }
      });

    // Save detected patterns to database
    if (detectedPatterns.length > 0) {
      const { data: insertedPatterns, error: insertError } = await supabaseClient
        .from('patterns')
        .insert(detectedPatterns)
        .select();

      if (insertError) {
        console.error('[detect-patterns] Error saving patterns:', insertError);
      } else {
        console.log(`[detect-patterns] Saved ${detectedPatterns.length} patterns`);

        // Create notifications for high-confidence patterns (>70%)
        const highConfidencePatterns = insertedPatterns.filter(p => p.confidence >= 70);
        
        if (highConfidencePatterns.length > 0) {
          const notifications = highConfidencePatterns.map(pattern => ({
            user_id: pattern.user_id,
            title: `🎯 نمط جديد: ${pattern.pattern_name}`,
            message: `تم اكتشاف نمط ${pattern.pattern_name} على ${pattern.symbol} (${pattern.timeframe}) بثقة ${pattern.confidence}%`,
            type: 'pattern',
            metadata: {
              pattern_id: pattern.id,
              symbol: pattern.symbol,
              confidence: pattern.confidence,
              target_price: pattern.target_price,
            },
            action_url: `/patterns`,
          }));

          const { error: notifError } = await supabaseClient
            .from('notifications')
            .insert(notifications);

          if (notifError) {
            console.error('[detect-patterns] Error creating notifications:', notifError);
          } else {
            console.log(`[detect-patterns] Created ${notifications.length} notifications`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        patternsDetected: detectedPatterns.length,
        patterns: detectedPatterns
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[detect-patterns] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

// Pattern detection functions
async function detectAllPatterns(candles: Candle[], symbol: string, timeframe: string) {
  const patterns = [];

  // Head and Shoulders
  const headAndShoulders = detectHeadAndShoulders(candles);
  if (headAndShoulders) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'reversal',
      pattern_name: 'Head and Shoulders',
      confidence: headAndShoulders.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'نموذج رأس وكتفين - إشارة انعكاس هابطة محتملة',
      target_price: headAndShoulders.target,
      stop_loss: headAndShoulders.stopLoss,
    });
  }

  // Inverse Head and Shoulders
  const invHeadShoulders = detectInverseHeadAndShoulders(candles);
  if (invHeadShoulders) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'reversal',
      pattern_name: 'Inverse Head and Shoulders',
      confidence: invHeadShoulders.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'رأس وكتفين معكوس - إشارة انعكاس صاعدة قوية',
      target_price: invHeadShoulders.target,
      stop_loss: invHeadShoulders.stopLoss,
    });
  }

  // Double Top
  const doubleTop = detectDoubleTop(candles);
  if (doubleTop) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'reversal',
      pattern_name: 'Double Top',
      confidence: doubleTop.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'قمة مزدوجة - إشارة انعكاس هابطة',
      target_price: doubleTop.target,
      stop_loss: doubleTop.stopLoss,
    });
  }

  // Double Bottom
  const doubleBottom = detectDoubleBottom(candles);
  if (doubleBottom) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'reversal',
      pattern_name: 'Double Bottom',
      confidence: doubleBottom.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'قاع مزدوج - إشارة انعكاس صاعدة',
      target_price: doubleBottom.target,
      stop_loss: doubleBottom.stopLoss,
    });
  }

  // Ascending Triangle
  const ascTriangle = detectAscendingTriangle(candles);
  if (ascTriangle) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'continuation',
      pattern_name: 'Ascending Triangle',
      confidence: ascTriangle.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'مثلث صاعد - إشارة اختراق صاعد محتملة',
      target_price: ascTriangle.target,
      stop_loss: ascTriangle.stopLoss,
    });
  }

  // Descending Triangle
  const descTriangle = detectDescendingTriangle(candles);
  if (descTriangle) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'continuation',
      pattern_name: 'Descending Triangle',
      confidence: descTriangle.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'مثلث هابط - إشارة كسر هابط محتملة',
      target_price: descTriangle.target,
      stop_loss: descTriangle.stopLoss,
    });
  }

  // Symmetrical Triangle
  const symTriangle = detectSymmetricalTriangle(candles);
  if (symTriangle) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'continuation',
      pattern_name: 'Symmetrical Triangle',
      confidence: symTriangle.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'مثلث متماثل - إشارة اختراق في اتجاه الترند',
      target_price: symTriangle.target,
      stop_loss: symTriangle.stopLoss,
    });
  }

  // Rising Wedge
  const risingWedge = detectRisingWedge(candles);
  if (risingWedge) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'reversal',
      pattern_name: 'Rising Wedge',
      confidence: risingWedge.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'إسفين صاعد - إشارة انعكاس هابط محتملة',
      target_price: risingWedge.target,
      stop_loss: risingWedge.stopLoss,
    });
  }

  // Falling Wedge
  const fallingWedge = detectFallingWedge(candles);
  if (fallingWedge) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'reversal',
      pattern_name: 'Falling Wedge',
      confidence: fallingWedge.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'إسفين هابط - إشارة انعكاس صاعد محتملة',
      target_price: fallingWedge.target,
      stop_loss: fallingWedge.stopLoss,
    });
  }

  // Cup and Handle
  const cupHandle = detectCupAndHandle(candles);
  if (cupHandle) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'continuation',
      pattern_name: 'Cup and Handle',
      confidence: cupHandle.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'كوب ومقبض - إشارة صاعدة قوية',
      target_price: cupHandle.target,
      stop_loss: cupHandle.stopLoss,
    });
  }

  // Bull Flag
  const bullFlag = detectBullFlag(candles);
  if (bullFlag) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'continuation',
      pattern_name: 'Bull Flag',
      confidence: bullFlag.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'علم صاعد - إشارة استمرار الاتجاه الصاعد',
      target_price: bullFlag.target,
      stop_loss: bullFlag.stopLoss,
    });
  }

  // Bear Flag
  const bearFlag = detectBearFlag(candles);
  if (bearFlag) {
    patterns.push({
      symbol,
      timeframe,
      pattern_type: 'continuation',
      pattern_name: 'Bear Flag',
      confidence: bearFlag.confidence,
      detected_at: new Date().toISOString(),
      status: 'active',
      description: 'علم هابط - إشارة استمرار الاتجاه الهابط',
      target_price: bearFlag.target,
      stop_loss: bearFlag.stopLoss,
    });
  }

  return patterns;
}

function detectHeadAndShoulders(candles: Candle[]) {
  if (candles.length < 50) return null;

  const highs = candles.map(c => c.high);
  const peaks = findPeaks(highs);

  if (peaks.length < 3) return null;

  // Find potential head and shoulders pattern
  for (let i = 1; i < peaks.length - 1; i++) {
    const leftShoulder = highs[peaks[i - 1]];
    const head = highs[peaks[i]];
    const rightShoulder = highs[peaks[i + 1]];

    // Check if head is higher than shoulders
    if (head > leftShoulder && head > rightShoulder) {
      // Check if shoulders are roughly equal (within 2%)
      const shoulderDiff = Math.abs(leftShoulder - rightShoulder) / leftShoulder;
      
      if (shoulderDiff < 0.02) {
        const neckline = Math.min(leftShoulder, rightShoulder);
        const target = neckline - (head - neckline);
        
        return {
          confidence: 75,
          target,
          stopLoss: head * 1.02,
        };
      }
    }
  }

  return null;
}

function detectDoubleTop(candles: Candle[]) {
  if (candles.length < 30) return null;

  const highs = candles.map(c => c.high);
  const peaks = findPeaks(highs);

  if (peaks.length < 2) return null;

  // Check last two peaks
  const peak1 = highs[peaks[peaks.length - 2]];
  const peak2 = highs[peaks[peaks.length - 1]];
  const priceDiff = Math.abs(peak1 - peak2) / peak1;

  if (priceDiff < 0.015) { // Within 1.5%
    const support = Math.min(...highs.slice(peaks[peaks.length - 2], peaks[peaks.length - 1]));
    const target = support - (peak1 - support);
    
    return {
      confidence: 70,
      target,
      stopLoss: peak1 * 1.02,
    };
  }

  return null;
}

function detectDoubleBottom(candles: Candle[]) {
  if (candles.length < 30) return null;

  const lows = candles.map(c => c.low);
  const troughs = findTroughs(lows);

  if (troughs.length < 2) return null;

  // Check last two troughs
  const trough1 = lows[troughs[troughs.length - 2]];
  const trough2 = lows[troughs[troughs.length - 1]];
  const priceDiff = Math.abs(trough1 - trough2) / trough1;

  if (priceDiff < 0.015) { // Within 1.5%
    const resistance = Math.max(...lows.slice(troughs[troughs.length - 2], troughs[troughs.length - 1]));
    const target = resistance + (resistance - trough1);
    
    return {
      confidence: 70,
      target,
      stopLoss: trough1 * 0.98,
    };
  }

  return null;
}

function detectBullFlag(candles: Candle[]) {
  if (candles.length < 20) return null;

  const closes = candles.map(c => c.close);
  
  // Check for strong uptrend (flagpole)
  const recentTrend = (closes[0] - closes[10]) / closes[10];
  if (recentTrend < 0.05) return null; // Need at least 5% move

  // Check for consolidation (flag)
  const consolidationRange = closes.slice(0, 10);
  const rangeHigh = Math.max(...consolidationRange);
  const rangeLow = Math.min(...consolidationRange);
  const consolidation = (rangeHigh - rangeLow) / rangeLow;

  if (consolidation < 0.03 && consolidation > 0.005) { // 0.5% to 3% range
    const flagpoleHeight = closes[0] - closes[10];
    const target = closes[0] + flagpoleHeight;
    
    return {
      confidence: 65,
      target,
      stopLoss: rangeLow * 0.98,
    };
  }

  return null;
}

function detectBearFlag(candles: Candle[]) {
  if (candles.length < 20) return null;

  const closes = candles.map(c => c.close);
  
  // Check for strong downtrend (flagpole)
  const recentTrend = (closes[10] - closes[0]) / closes[10];
  if (recentTrend < 0.05) return null; // Need at least 5% move down

  // Check for consolidation (flag)
  const consolidationRange = closes.slice(0, 10);
  const rangeHigh = Math.max(...consolidationRange);
  const rangeLow = Math.min(...consolidationRange);
  const consolidation = (rangeHigh - rangeLow) / rangeLow;

  if (consolidation < 0.03 && consolidation > 0.005) { // 0.5% to 3% range
    const flagpoleHeight = closes[10] - closes[0];
    const target = closes[0] - flagpoleHeight;
    
    return {
      confidence: 65,
      target,
      stopLoss: rangeHigh * 1.02,
    };
  }

  return null;
}

function detectInverseHeadAndShoulders(candles: Candle[]) {
  if (candles.length < 50) return null;

  const lows = candles.map(c => c.low);
  const troughs = findTroughs(lows);

  if (troughs.length < 3) return null;

  for (let i = 1; i < troughs.length - 1; i++) {
    const leftShoulder = lows[troughs[i - 1]];
    const head = lows[troughs[i]];
    const rightShoulder = lows[troughs[i + 1]];

    if (head < leftShoulder && head < rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder - rightShoulder) / leftShoulder;
      
      if (shoulderDiff < 0.02) {
        const neckline = Math.max(leftShoulder, rightShoulder);
        const target = neckline + (neckline - head);
        
        return {
          confidence: 78,
          target,
          stopLoss: head * 0.98,
        };
      }
    }
  }

  return null;
}

function detectAscendingTriangle(candles: Candle[]) {
  if (candles.length < 40) return null;

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  // Find horizontal resistance
  const recentHighs = highs.slice(0, 20);
  const maxHigh = Math.max(...recentHighs);
  const highsNearResistance = recentHighs.filter(h => Math.abs(h - maxHigh) / maxHigh < 0.015);
  
  if (highsNearResistance.length < 2) return null;

  // Check for rising lows
  const recentLows = lows.slice(0, 20);
  let risingLowsCount = 0;
  for (let i = 1; i < Math.min(recentLows.length, 10); i++) {
    if (recentLows[i - 1] < recentLows[i]) risingLowsCount++;
  }

  if (risingLowsCount >= 4) {
    const triangleHeight = maxHigh - Math.min(...recentLows);
    const target = maxHigh + triangleHeight;
    
    return {
      confidence: 72,
      target,
      stopLoss: Math.min(...recentLows) * 0.98,
    };
  }

  return null;
}

function detectDescendingTriangle(candles: Candle[]) {
  if (candles.length < 40) return null;

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  // Find horizontal support
  const recentLows = lows.slice(0, 20);
  const minLow = Math.min(...recentLows);
  const lowsNearSupport = recentLows.filter(l => Math.abs(l - minLow) / minLow < 0.015);
  
  if (lowsNearSupport.length < 2) return null;

  // Check for falling highs
  const recentHighs = highs.slice(0, 20);
  let fallingHighsCount = 0;
  for (let i = 1; i < Math.min(recentHighs.length, 10); i++) {
    if (recentHighs[i - 1] > recentHighs[i]) fallingHighsCount++;
  }

  if (fallingHighsCount >= 4) {
    const triangleHeight = Math.max(...recentHighs) - minLow;
    const target = minLow - triangleHeight;
    
    return {
      confidence: 72,
      target,
      stopLoss: Math.max(...recentHighs) * 1.02,
    };
  }

  return null;
}

function detectSymmetricalTriangle(candles: Candle[]) {
  if (candles.length < 40) return null;

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  const recentHighs = highs.slice(0, 20);
  const recentLows = lows.slice(0, 20);

  // Check for converging highs and lows
  let fallingHighsCount = 0;
  let risingLowsCount = 0;

  for (let i = 1; i < 10; i++) {
    if (recentHighs[i - 1] > recentHighs[i]) fallingHighsCount++;
    if (recentLows[i - 1] < recentLows[i]) risingLowsCount++;
  }

  if (fallingHighsCount >= 4 && risingLowsCount >= 4) {
    const avgHigh = recentHighs.reduce((a, b) => a + b, 0) / recentHighs.length;
    const avgLow = recentLows.reduce((a, b) => a + b, 0) / recentLows.length;
    const triangleHeight = avgHigh - avgLow;
    
    // Breakout direction based on recent momentum
    const lastClose = candles[0].close;
    const avgPrice = (avgHigh + avgLow) / 2;
    const target = lastClose > avgPrice 
      ? avgHigh + triangleHeight 
      : avgLow - triangleHeight;
    
    return {
      confidence: 68,
      target,
      stopLoss: lastClose > avgPrice ? avgLow * 0.98 : avgHigh * 1.02,
    };
  }

  return null;
}

function detectRisingWedge(candles: Candle[]) {
  if (candles.length < 40) return null;

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  const recentHighs = highs.slice(0, 20);
  const recentLows = lows.slice(0, 20);

  // Both highs and lows should be rising
  let risingHighsCount = 0;
  let risingLowsCount = 0;

  for (let i = 1; i < 10; i++) {
    if (recentHighs[i - 1] < recentHighs[i]) risingHighsCount++;
    if (recentLows[i - 1] < recentLows[i]) risingLowsCount++;
  }

  // But highs rising slower (converging)
  const highSlope = (recentHighs[0] - recentHighs[9]) / 9;
  const lowSlope = (recentLows[0] - recentLows[9]) / 9;

  if (risingHighsCount >= 5 && risingLowsCount >= 6 && lowSlope > highSlope * 1.3) {
    const wedgeHeight = Math.max(...recentHighs) - Math.min(...recentLows);
    const target = Math.min(...recentLows) - wedgeHeight;
    
    return {
      confidence: 70,
      target,
      stopLoss: Math.max(...recentHighs) * 1.02,
    };
  }

  return null;
}

function detectFallingWedge(candles: Candle[]) {
  if (candles.length < 40) return null;

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  const recentHighs = highs.slice(0, 20);
  const recentLows = lows.slice(0, 20);

  // Both highs and lows should be falling
  let fallingHighsCount = 0;
  let fallingLowsCount = 0;

  for (let i = 1; i < 10; i++) {
    if (recentHighs[i - 1] > recentHighs[i]) fallingHighsCount++;
    if (recentLows[i - 1] > recentLows[i]) fallingLowsCount++;
  }

  // But lows falling slower (converging)
  const highSlope = Math.abs(recentHighs[0] - recentHighs[9]) / 9;
  const lowSlope = Math.abs(recentLows[0] - recentLows[9]) / 9;

  if (fallingHighsCount >= 6 && fallingLowsCount >= 5 && highSlope > lowSlope * 1.3) {
    const wedgeHeight = Math.max(...recentHighs) - Math.min(...recentLows);
    const target = Math.max(...recentHighs) + wedgeHeight;
    
    return {
      confidence: 70,
      target,
      stopLoss: Math.min(...recentLows) * 0.98,
    };
  }

  return null;
}

function detectCupAndHandle(candles: Candle[]) {
  if (candles.length < 60) return null;

  const lows = candles.map(c => c.low);
  const highs = candles.map(c => c.high);
  
  // Find cup formation (U-shape in lows)
  const cupLows = lows.slice(20, 50);
  const cupBottom = Math.min(...cupLows);
  const cupTop = Math.max(lows[20], lows[50]);
  
  // Check for cup shape - bottom should be significantly lower
  if (cupTop - cupBottom < cupTop * 0.1) return null;

  // Check for handle (recent consolidation)
  const handleCandles = candles.slice(0, 15);
  const handleRange = Math.max(...handleCandles.map(c => c.high)) - 
                      Math.min(...handleCandles.map(c => c.low));
  const handleRelativeRange = handleRange / cupBottom;
  
  if (handleRelativeRange > 0.05 || handleRelativeRange < 0.01) return null;

  const cupDepth = cupTop - cupBottom;
  const target = cupTop + cupDepth;
  
  return {
    confidence: 75,
    target,
    stopLoss: Math.min(...handleCandles.map(c => c.low)) * 0.98,
  };
}

// Helper functions
function findPeaks(data: number[]): number[] {
  const peaks: number[] = [];
  for (let i = 2; i < data.length - 2; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i - 2] &&
        data[i] > data[i + 1] && data[i] > data[i + 2]) {
      peaks.push(i);
    }
  }
  return peaks;
}

function findTroughs(data: number[]): number[] {
  const troughs: number[] = [];
  for (let i = 2; i < data.length - 2; i++) {
    if (data[i] < data[i - 1] && data[i] < data[i - 2] &&
        data[i] < data[i + 1] && data[i] < data[i + 2]) {
      troughs.push(i);
    }
  }
  return troughs;
}
