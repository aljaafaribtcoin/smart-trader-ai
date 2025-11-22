/**
 * Order Block Detection
 * Identifies demand and supply zones (Order Blocks)
 */

import type { Candle, OrderBlock, StructureSummary, LiquidityZone, TimeframeId } from './types';
import { isBullishCandle, isBearishCandle, getCandleBody } from './utils/candles';
import { v4 as uuidv4 } from 'uuid';

/**
 * Detect Bullish Order Block (Demand Zone)
 */
export function detectBullishOrderBlock(
  candles: Candle[],
  breakIndex: number,
  timeframe: TimeframeId
): OrderBlock | null {
  if (breakIndex < 5) return null;

  // Look for last bearish/neutral candle before strong bullish move
  let obIndex = breakIndex - 1;
  
  // Find the last down/neutral candle before the break
  while (obIndex > 0 && isBullishCandle(candles[obIndex])) {
    obIndex--;
  }

  if (obIndex < 0) return null;

  const obCandle = candles[obIndex];
  const moveSize = candles[breakIndex].high - candles[obIndex].low;
  const avgBody = candles.slice(obIndex - 20, obIndex).reduce((sum, c) => sum + getCandleBody(c), 0) / 20;

  // Validate: the move should be significant
  if (moveSize < avgBody * 2) return null;

  return {
    id: uuidv4(),
    direction: 'bullish',
    timeframe,
    priceFrom: Math.min(obCandle.open, obCandle.close),
    priceTo: Math.max(obCandle.open, obCandle.close),
    timestamp: obCandle.timestamp,
    strength: 70,
    volume: obCandle.volume,
    brokeStructure: false,
    clearedLiquidity: false,
    tested: 0,
    status: 'valid',
  };
}

/**
 * Detect Bearish Order Block (Supply Zone)
 */
export function detectBearishOrderBlock(
  candles: Candle[],
  breakIndex: number,
  timeframe: TimeframeId
): OrderBlock | null {
  if (breakIndex < 5) return null;

  // Look for last bullish/neutral candle before strong bearish move
  let obIndex = breakIndex - 1;
  
  // Find the last up/neutral candle before the break
  while (obIndex > 0 && isBearishCandle(candles[obIndex])) {
    obIndex--;
  }

  if (obIndex < 0) return null;

  const obCandle = candles[obIndex];
  const moveSize = candles[obIndex].high - candles[breakIndex].low;
  const avgBody = candles.slice(obIndex - 20, obIndex).reduce((sum, c) => sum + getCandleBody(c), 0) / 20;

  // Validate: the move should be significant
  if (moveSize < avgBody * 2) return null;

  return {
    id: uuidv4(),
    direction: 'bearish',
    timeframe,
    priceFrom: Math.min(obCandle.open, obCandle.close),
    priceTo: Math.max(obCandle.open, obCandle.close),
    timestamp: obCandle.timestamp,
    strength: 70,
    volume: obCandle.volume,
    brokeStructure: false,
    clearedLiquidity: false,
    tested: 0,
    status: 'valid',
  };
}

/**
 * Evaluate Order Block strength based on context
 */
export function evaluateOrderBlockStrength(
  ob: OrderBlock,
  candles: Candle[],
  brokeStructure: boolean,
  clearedLiquidity: boolean
): number {
  let strength = 50;

  // Volume factor
  const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
  if (ob.volume > avgVolume * 1.5) strength += 15;
  if (ob.volume > avgVolume * 2) strength += 10;

  // Structure break adds strength
  if (brokeStructure) strength += 20;

  // Liquidity sweep adds strength
  if (clearedLiquidity) strength += 15;

  // Size of the zone (smaller = stronger)
  const zoneSize = Math.abs(ob.priceTo - ob.priceFrom);
  const avgPrice = (ob.priceFrom + ob.priceTo) / 2;
  const sizePercent = (zoneSize / avgPrice) * 100;
  
  if (sizePercent < 0.5) strength += 10;

  return Math.min(strength, 100);
}

/**
 * Check if Order Block has been tested
 */
function isOrderBlockTested(ob: OrderBlock, candles: Candle[]): boolean {
  const recentCandles = candles.slice(-20);
  
  for (const candle of recentCandles) {
    if (candle.timestamp <= ob.timestamp) continue;

    const candleLow = candle.low;
    const candleHigh = candle.high;

    // Check if price touched the OB zone
    if (ob.direction === 'bullish') {
      if (candleLow <= ob.priceTo && candleHigh >= ob.priceFrom) {
        return true;
      }
    } else {
      if (candleHigh >= ob.priceFrom && candleLow <= ob.priceTo) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if Order Block has been broken
 */
function isOrderBlockBroken(ob: OrderBlock, candles: Candle[]): boolean {
  const recentCandles = candles.slice(-10);
  
  for (const candle of recentCandles) {
    if (candle.timestamp <= ob.timestamp) continue;

    if (ob.direction === 'bullish') {
      // Broken if price closes below the zone
      if (candle.close < ob.priceFrom) return true;
    } else {
      // Broken if price closes above the zone
      if (candle.close > ob.priceTo) return true;
    }
  }

  return false;
}

/**
 * Main Order Block analysis function
 */
export function analyzeOrderBlocks(
  candles: Candle[],
  structure: StructureSummary,
  liquidityZones: LiquidityZone[],
  timeframe: TimeframeId
): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];

  if (candles.length < 30) return orderBlocks;

  // Detect bullish OBs around swing lows
  const swingLows = structure.swingPoints.filter(p => !p.isHigh);
  for (const low of swingLows) {
    // Find candles after this swing low that show strong bullish move
    for (let i = low.candleIndex + 1; i < Math.min(low.candleIndex + 10, candles.length); i++) {
      if (candles[i].close > low.price * 1.02) {
        const ob = detectBullishOrderBlock(candles.slice(0, i + 1), i, timeframe);
        if (ob) {
          // Check if it broke structure
          ob.brokeStructure = structure.recentBreak?.type === 'BOS' || structure.recentBreak?.type === 'CHOCH';
          
          // Check if it cleared liquidity
          ob.clearedLiquidity = liquidityZones.some(z => z.swept && z.type === 'equal_lows');
          
          // Evaluate strength
          ob.strength = evaluateOrderBlockStrength(ob, candles, ob.brokeStructure, ob.clearedLiquidity);
          
          // Check status
          if (isOrderBlockBroken(ob, candles)) {
            ob.status = 'broken';
          } else if (isOrderBlockTested(ob, candles)) {
            ob.status = 'tested';
            ob.tested++;
          }

          orderBlocks.push(ob);
        }
        break;
      }
    }
  }

  // Detect bearish OBs around swing highs
  const swingHighs = structure.swingPoints.filter(p => p.isHigh);
  for (const high of swingHighs) {
    for (let i = high.candleIndex + 1; i < Math.min(high.candleIndex + 10, candles.length); i++) {
      if (candles[i].close < high.price * 0.98) {
        const ob = detectBearishOrderBlock(candles.slice(0, i + 1), i, timeframe);
        if (ob) {
          ob.brokeStructure = structure.recentBreak?.type === 'BOS' || structure.recentBreak?.type === 'CHOCH';
          ob.clearedLiquidity = liquidityZones.some(z => z.swept && z.type === 'equal_highs');
          ob.strength = evaluateOrderBlockStrength(ob, candles, ob.brokeStructure, ob.clearedLiquidity);
          
          if (isOrderBlockBroken(ob, candles)) {
            ob.status = 'broken';
          } else if (isOrderBlockTested(ob, candles)) {
            ob.status = 'tested';
            ob.tested++;
          }

          orderBlocks.push(ob);
        }
        break;
      }
    }
  }

  // Return only valid or tested OBs, sorted by strength
  return orderBlocks
    .filter(ob => ob.status !== 'broken')
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5); // Keep top 5
}
