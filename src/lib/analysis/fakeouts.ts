/**
 * Fakeout Detection
 * Identifies fake breakouts and liquidity sweeps
 */

import type { Candle, Fakeout, LiquidityZone, TimeframeId } from './types';
import { getCandleBody, getUpperWick, getLowerWick, getCandleRange, isBullishCandle, isBearishCandle } from './utils/candles';

/**
 * Detect fakeout at a resistance level
 */
function detectResistanceFakeout(
  candles: Candle[],
  resistance: number,
  timeframe: TimeframeId
): Fakeout | null {
  if (candles.length < 3) return null;

  const recentCandles = candles.slice(-3);

  for (const candle of recentCandles) {
    // Price pierced above resistance
    if (candle.high > resistance) {
      // But closed below it
      if (candle.close < resistance) {
        const wickSize = getUpperWick(candle);
        const bodySize = getCandleBody(candle);
        const range = getCandleRange(candle);

        // Strong rejection: long upper wick
        if (wickSize > bodySize * 2 && wickSize / range > 0.6) {
          return {
            type: 'resistance',
            price: resistance,
            timestamp: candle.timestamp,
            timeframe,
            wickSize,
            bodySize,
            reversal: isBearishCandle(candle),
            liquiditySwept: true,
            confidence: 75,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Detect fakeout at a support level
 */
function detectSupportFakeout(
  candles: Candle[],
  support: number,
  timeframe: TimeframeId
): Fakeout | null {
  if (candles.length < 3) return null;

  const recentCandles = candles.slice(-3);

  for (const candle of recentCandles) {
    // Price pierced below support
    if (candle.low < support) {
      // But closed above it
      if (candle.close > support) {
        const wickSize = getLowerWick(candle);
        const bodySize = getCandleBody(candle);
        const range = getCandleRange(candle);

        // Strong rejection: long lower wick
        if (wickSize > bodySize * 2 && wickSize / range > 0.6) {
          return {
            type: 'support',
            price: support,
            timestamp: candle.timestamp,
            timeframe,
            wickSize,
            bodySize,
            reversal: isBullishCandle(candle),
            liquiditySwept: true,
            confidence: 75,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Detect fakeout at swing high
 */
function detectHighFakeout(
  candles: Candle[],
  swingHigh: number,
  timeframe: TimeframeId
): Fakeout | null {
  return detectResistanceFakeout(candles, swingHigh, timeframe);
}

/**
 * Detect fakeout at swing low
 */
function detectLowFakeout(
  candles: Candle[],
  swingLow: number,
  timeframe: TimeframeId
): Fakeout | null {
  return detectSupportFakeout(candles, swingLow, timeframe);
}

/**
 * Main fakeout detection function
 */
export function detectFakeouts(
  candles: Candle[],
  keyLevels: number[],
  liquidityZones: LiquidityZone[],
  timeframe: TimeframeId
): Fakeout[] {
  const fakeouts: Fakeout[] = [];

  if (candles.length < 10) return fakeouts;

  // Check for fakeouts at key levels
  for (const level of keyLevels) {
    const currentPrice = candles[candles.length - 1].close;

    // Determine if level is resistance or support
    if (level > currentPrice) {
      const fakeout = detectResistanceFakeout(candles, level, timeframe);
      if (fakeout) fakeouts.push(fakeout);
    } else {
      const fakeout = detectSupportFakeout(candles, level, timeframe);
      if (fakeout) fakeouts.push(fakeout);
    }
  }

  // Check for fakeouts at liquidity zones
  for (const zone of liquidityZones) {
    if (zone.type === 'equal_highs' || zone.type === 'swing_high') {
      const fakeout = detectHighFakeout(candles, zone.price, timeframe);
      if (fakeout) {
        fakeout.liquiditySwept = zone.swept;
        fakeout.confidence = zone.swept ? 85 : 70;
        fakeouts.push(fakeout);
      }
    }

    if (zone.type === 'equal_lows' || zone.type === 'swing_low') {
      const fakeout = detectLowFakeout(candles, zone.price, timeframe);
      if (fakeout) {
        fakeout.liquiditySwept = zone.swept;
        fakeout.confidence = zone.swept ? 85 : 70;
        fakeouts.push(fakeout);
      }
    }
  }

  // Return unique fakeouts sorted by confidence
  const uniqueFakeouts = fakeouts.filter((f, index, self) =>
    index === self.findIndex(t => Math.abs(t.price - f.price) < f.price * 0.001)
  );

  return uniqueFakeouts.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

/**
 * Check if recent fakeout supports a direction
 */
export function doesFakeoutSupport(
  fakeouts: Fakeout[],
  direction: 'long' | 'short'
): boolean {
  if (fakeouts.length === 0) return false;

  const recentFakeout = fakeouts[0];

  if (direction === 'long') {
    return (recentFakeout.type === 'support' || recentFakeout.type === 'low') && recentFakeout.reversal;
  } else {
    return (recentFakeout.type === 'resistance' || recentFakeout.type === 'high') && recentFakeout.reversal;
  }
}
