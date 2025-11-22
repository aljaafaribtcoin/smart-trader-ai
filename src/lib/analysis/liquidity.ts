/**
 * Liquidity Zone Detection
 * Identifies equal highs/lows and sweep patterns
 */

import type { Candle, SwingPoint, LiquidityZone, TimeframeId } from './types';
import { arePricesEqual, findEqualHighs, findEqualLows } from './utils/levels';
import { v4 as uuidv4 } from 'uuid';

/**
 * Detect Equal Highs
 */
export function detectEqualHighs(
  candles: Candle[],
  swingPoints: SwingPoint[],
  timeframe: TimeframeId,
  tolerance: number = 0.002
): LiquidityZone[] {
  const zones: LiquidityZone[] = [];
  const highs = swingPoints.filter(p => p.isHigh);

  if (highs.length < 2) return zones;

  const equalHighGroups = findEqualHighs(highs, tolerance);

  for (const group of equalHighGroups) {
    const avgPrice = group.reduce((sum, p) => sum + p, 0) / group.length;
    const touched = group.length;

    zones.push({
      id: uuidv4(),
      type: 'equal_highs',
      price: avgPrice,
      timeframe,
      timestamp: Date.now(),
      strength: Math.min(touched * 25, 90),
      touched,
      swept: false,
      significance: touched >= 3 ? 'major' : touched === 2 ? 'moderate' : 'minor',
    });
  }

  return zones;
}

/**
 * Detect Equal Lows
 */
export function detectEqualLows(
  candles: Candle[],
  swingPoints: SwingPoint[],
  timeframe: TimeframeId,
  tolerance: number = 0.002
): LiquidityZone[] {
  const zones: LiquidityZone[] = [];
  const lows = swingPoints.filter(p => !p.isHigh);

  if (lows.length < 2) return zones;

  const equalLowGroups = findEqualLows(lows, tolerance);

  for (const group of equalLowGroups) {
    const avgPrice = group.reduce((sum, p) => sum + p, 0) / group.length;
    const touched = group.length;

    zones.push({
      id: uuidv4(),
      type: 'equal_lows',
      price: avgPrice,
      timeframe,
      timestamp: Date.now(),
      strength: Math.min(touched * 25, 90),
      touched,
      swept: false,
      significance: touched >= 3 ? 'major' : touched === 2 ? 'moderate' : 'minor',
    });
  }

  return zones;
}

/**
 * Identify significant swing points as liquidity zones
 */
export function identifySwingLiquidityZones(
  swingPoints: SwingPoint[],
  timeframe: TimeframeId
): LiquidityZone[] {
  const zones: LiquidityZone[] = [];

  // Get the most significant highs and lows
  const highs = swingPoints.filter(p => p.isHigh && (p.type === 'HH' || p.type === 'LH'));
  const lows = swingPoints.filter(p => !p.isHigh && (p.type === 'HL' || p.type === 'LL'));

  // Add significant highs
  for (const high of highs.slice(-5)) {
    zones.push({
      id: uuidv4(),
      type: 'swing_high',
      price: high.price,
      timeframe,
      timestamp: high.timestamp,
      strength: high.type === 'HH' ? 75 : 60,
      touched: 1,
      swept: false,
      significance: high.type === 'HH' ? 'major' : 'moderate',
    });
  }

  // Add significant lows
  for (const low of lows.slice(-5)) {
    zones.push({
      id: uuidv4(),
      type: 'swing_low',
      price: low.price,
      timeframe,
      timestamp: low.timestamp,
      strength: low.type === 'LL' ? 75 : 60,
      touched: 1,
      swept: false,
      significance: low.type === 'LL' ? 'major' : 'moderate',
    });
  }

  return zones;
}

/**
 * Detect if liquidity zone was swept
 */
export function detectLiquiditySweep(
  candles: Candle[],
  zone: LiquidityZone
): boolean {
  if (candles.length < 5) return false;

  const recentCandles = candles.slice(-5);

  for (const candle of recentCandles) {
    // Check if price swept above equal highs or swing high
    if ((zone.type === 'equal_highs' || zone.type === 'swing_high')) {
      if (candle.high > zone.price && candle.close < zone.price) {
        return true; // Swept and rejected
      }
    }

    // Check if price swept below equal lows or swing low
    if ((zone.type === 'equal_lows' || zone.type === 'swing_low')) {
      if (candle.low < zone.price && candle.close > zone.price) {
        return true; // Swept and rejected
      }
    }
  }

  return false;
}

/**
 * Update liquidity zones with sweep status
 */
function updateLiquidityZones(
  zones: LiquidityZone[],
  candles: Candle[]
): LiquidityZone[] {
  return zones.map(zone => ({
    ...zone,
    swept: detectLiquiditySweep(candles, zone),
  }));
}

/**
 * Main liquidity analysis function
 */
export function analyzeLiquidity(
  candles: Candle[],
  swingPoints: SwingPoint[],
  timeframe: TimeframeId
): LiquidityZone[] {
  const equalHighs = detectEqualHighs(candles, swingPoints, timeframe);
  const equalLows = detectEqualLows(candles, swingPoints, timeframe);
  const swingZones = identifySwingLiquidityZones(swingPoints, timeframe);

  const allZones = [...equalHighs, ...equalLows, ...swingZones];

  // Update sweep status
  const updatedZones = updateLiquidityZones(allZones, candles);

  // Sort by strength
  return updatedZones.sort((a, b) => b.strength - a.strength);
}
