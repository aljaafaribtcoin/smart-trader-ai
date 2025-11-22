/**
 * Market Structure Analysis
 * Detects swing points, trends, BOS, and CHOCH
 */

import type { Candle, SwingPoint, StructureSummary, TimeframeId, StructureBreak } from './types';
import { getHighPrices, getLowPrices } from './utils/candles';

/**
 * Detect swing high at a specific index
 */
function isSwingHigh(candles: Candle[], index: number, leftBars: number, rightBars: number): boolean {
  if (index < leftBars || index >= candles.length - rightBars) return false;

  const currentHigh = candles[index].high;

  // Check left bars
  for (let i = index - leftBars; i < index; i++) {
    if (candles[i].high > currentHigh) return false;
  }

  // Check right bars
  for (let i = index + 1; i <= index + rightBars; i++) {
    if (candles[i].high > currentHigh) return false;
  }

  return true;
}

/**
 * Detect swing low at a specific index
 */
function isSwingLow(candles: Candle[], index: number, leftBars: number, rightBars: number): boolean {
  if (index < leftBars || index >= candles.length - rightBars) return false;

  const currentLow = candles[index].low;

  // Check left bars
  for (let i = index - leftBars; i < index; i++) {
    if (candles[i].low < currentLow) return false;
  }

  // Check right bars
  for (let i = index + 1; i <= index + rightBars; i++) {
    if (candles[i].low < currentLow) return false;
  }

  return true;
}

/**
 * Detect all swing points in candles
 */
export function detectSwingPoints(
  candles: Candle[],
  leftBars: number = 5,
  rightBars: number = 5
): SwingPoint[] {
  const swingPoints: SwingPoint[] = [];

  for (let i = leftBars; i < candles.length - rightBars; i++) {
    if (isSwingHigh(candles, i, leftBars, rightBars)) {
      swingPoints.push({
        type: 'HH', // Will be classified later
        price: candles[i].high,
        timestamp: candles[i].timestamp,
        candleIndex: i,
        isHigh: true,
      });
    }

    if (isSwingLow(candles, i, leftBars, rightBars)) {
      swingPoints.push({
        type: 'LL', // Will be classified later
        price: candles[i].low,
        timestamp: candles[i].timestamp,
        candleIndex: i,
        isHigh: false,
      });
    }
  }

  // Classify swing points (HH, HL, LH, LL)
  classifySwingPoints(swingPoints);

  return swingPoints.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Classify swing points as HH, HL, LH, LL
 */
function classifySwingPoints(swingPoints: SwingPoint[]): void {
  const highs = swingPoints.filter(p => p.isHigh);
  const lows = swingPoints.filter(p => !p.isHigh);

  // Classify highs
  for (let i = 1; i < highs.length; i++) {
    if (highs[i].price > highs[i - 1].price) {
      highs[i].type = 'HH';
    } else {
      highs[i].type = 'LH';
    }
  }

  // Classify lows
  for (let i = 1; i < lows.length; i++) {
    if (lows[i].price > lows[i - 1].price) {
      lows[i].type = 'HL';
    } else {
      lows[i].type = 'LL';
    }
  }
}

/**
 * Determine overall trend from swing points
 */
function determineTrend(swingPoints: SwingPoint[]): 'bullish' | 'bearish' | 'range' | 'choppy' {
  if (swingPoints.length < 4) return 'range';

  const recentPoints = swingPoints.slice(-6);
  const highs = recentPoints.filter(p => p.isHigh);
  const lows = recentPoints.filter(p => !p.isHigh);

  if (highs.length < 2 || lows.length < 2) return 'choppy';

  const hhCount = highs.filter(h => h.type === 'HH').length;
  const lhCount = highs.filter(h => h.type === 'LH').length;
  const hlCount = lows.filter(l => l.type === 'HL').length;
  const llCount = lows.filter(l => l.type === 'LL').length;

  // Bullish: HH + HL pattern
  if (hhCount >= lhCount && hlCount >= llCount) {
    return 'bullish';
  }

  // Bearish: LH + LL pattern
  if (lhCount >= hhCount && llCount >= hlCount) {
    return 'bearish';
  }

  return 'range';
}

/**
 * Detect Break of Structure (BOS)
 */
export function detectBreakOfStructure(
  candles: Candle[],
  swingPoints: SwingPoint[]
): StructureBreak | null {
  if (swingPoints.length < 3 || candles.length < 10) return null;

  const recentCandles = candles.slice(-10);
  const currentPrice = recentCandles[recentCandles.length - 1].close;

  // Find last significant swing high and low
  const highs = swingPoints.filter(p => p.isHigh);
  const lows = swingPoints.filter(p => !p.isHigh);

  if (highs.length < 1 || lows.length < 1) return null;

  const lastHigh = highs[highs.length - 1];
  const lastLow = lows[lows.length - 1];

  // Bullish BOS: price breaks above last swing high
  if (currentPrice > lastHigh.price && lastHigh.type === 'HH') {
    return 'BOS';
  }

  // Bearish BOS: price breaks below last swing low
  if (currentPrice < lastLow.price && lastLow.type === 'LL') {
    return 'BOS';
  }

  return null;
}

/**
 * Detect Change of Character (CHOCH)
 */
export function detectChangeOfCharacter(
  candles: Candle[],
  swingPoints: SwingPoint[]
): StructureBreak | null {
  if (swingPoints.length < 4 || candles.length < 10) return null;

  const recentPoints = swingPoints.slice(-4);
  const currentPrice = candles[candles.length - 1].close;

  // CHOCH occurs when trend changes direction
  // Example: After LH + LL, price breaks above last LH (bullish CHOCH)
  // Example: After HH + HL, price breaks below last HL (bearish CHOCH)

  const highs = recentPoints.filter(p => p.isHigh);
  const lows = recentPoints.filter(p => !p.isHigh);

  if (highs.length < 2 || lows.length < 2) return null;

  // Bullish CHOCH
  if (lows[lows.length - 1].type === 'LL' && highs[highs.length - 1].type === 'LH') {
    if (currentPrice > highs[highs.length - 1].price) {
      return 'CHOCH';
    }
  }

  // Bearish CHOCH
  if (highs[highs.length - 1].type === 'HH' && lows[lows.length - 1].type === 'HL') {
    if (currentPrice < lows[lows.length - 1].price) {
      return 'CHOCH';
    }
  }

  return null;
}

/**
 * Calculate structure strength (0-100)
 */
function calculateStructureStrength(swingPoints: SwingPoint[], trend: string): number {
  if (swingPoints.length < 3) return 30;

  const recentPoints = swingPoints.slice(-6);
  const highs = recentPoints.filter(p => p.isHigh);
  const lows = recentPoints.filter(p => !p.isHigh);

  let strength = 50;

  if (trend === 'bullish') {
    const hhCount = highs.filter(h => h.type === 'HH').length;
    const hlCount = lows.filter(l => l.type === 'HL').length;
    strength = Math.min(100, 50 + (hhCount + hlCount) * 10);
  } else if (trend === 'bearish') {
    const lhCount = highs.filter(h => h.type === 'LH').length;
    const llCount = lows.filter(l => l.type === 'LL').length;
    strength = Math.min(100, 50 + (lhCount + llCount) * 10);
  }

  return strength;
}

/**
 * Main structure analysis function
 */
export function analyzeStructure(
  candles: Candle[],
  timeframe: TimeframeId
): StructureSummary {
  const swingPoints = detectSwingPoints(candles);
  const trend = determineTrend(swingPoints);
  const structureBreak = detectBreakOfStructure(candles, swingPoints) || 
                        detectChangeOfCharacter(candles, swingPoints);

  const highs = swingPoints.filter(p => p.isHigh);
  const lows = swingPoints.filter(p => !p.isHigh);

  const lastSwingHigh = highs.length > 0 ? highs[highs.length - 1].price : candles[candles.length - 1].high;
  const lastSwingLow = lows.length > 0 ? lows[lows.length - 1].price : candles[candles.length - 1].low;

  const currentPrice = candles[candles.length - 1].close;
  const distanceToHigh = Math.abs(currentPrice - lastSwingHigh) / lastSwingHigh;
  const distanceToLow = Math.abs(currentPrice - lastSwingLow) / lastSwingLow;
  const isNearKeySwing = distanceToHigh < 0.01 || distanceToLow < 0.01;

  const structureStrength = calculateStructureStrength(swingPoints, trend);

  return {
    timeframe,
    trend,
    lastSwingHigh,
    lastSwingLow,
    swingPoints,
    recentBreak: structureBreak ? {
      type: structureBreak,
      price: currentPrice,
      timestamp: candles[candles.length - 1].timestamp,
    } : undefined,
    isNearKeySwing,
    structureStrength,
  };
}
