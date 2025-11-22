/**
 * Momentum Analysis
 * Analyzes RSI, MACD, divergences, and momentum signals
 */

import type { Candle, MomentumAnalysis, TimeframeId } from './types';
import { calculateRSI, calculateMACD, calculateATR, detectRSIDivergence } from './indicators';
import { getClosePrices } from './utils/candles';

/**
 * Get RSI signal
 */
function getRSISignal(rsi: number): 'overbought' | 'oversold' | 'neutral' {
  if (rsi >= 70) return 'overbought';
  if (rsi <= 30) return 'oversold';
  return 'neutral';
}

/**
 * Get trend from MACD
 */
function getTrendFromMACD(macd: { value: number; signal: number; histogram: number }): 'bullish' | 'bearish' | 'neutral' {
  if (macd.histogram > 0 && macd.value > macd.signal) return 'bullish';
  if (macd.histogram < 0 && macd.value < macd.signal) return 'bearish';
  return 'neutral';
}

/**
 * Main momentum analysis function
 */
export function analyzeMomentum(
  candles: Candle[],
  timeframe: TimeframeId
): MomentumAnalysis {
  const closes = getClosePrices(candles);
  
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const volatility = calculateATR(candles);

  // Detect RSI divergence
  const rsiHistory: number[] = [];
  for (let i = Math.max(0, closes.length - 20); i < closes.length; i++) {
    const slice = closes.slice(0, i + 1);
    rsiHistory.push(calculateRSI(slice));
  }

  const divergence = detectRSIDivergence(candles.slice(-20), rsiHistory);

  return {
    rsi,
    rsiSignal: getRSISignal(rsi),
    macd,
    trend: getTrendFromMACD(macd),
    volatility,
    divergence,
  };
}

/**
 * Check if momentum confirms a direction
 */
export function doesMomentumConfirm(
  momentum: MomentumAnalysis,
  direction: 'long' | 'short'
): boolean {
  if (direction === 'long') {
    return (
      momentum.trend === 'bullish' &&
      momentum.rsiSignal !== 'overbought' &&
      (momentum.divergence === 'bullish' || momentum.divergence === null)
    );
  } else {
    return (
      momentum.trend === 'bearish' &&
      momentum.rsiSignal !== 'oversold' &&
      (momentum.divergence === 'bearish' || momentum.divergence === null)
    );
  }
}

/**
 * Calculate momentum strength (0-100)
 */
export function calculateMomentumStrength(momentum: MomentumAnalysis): number {
  let strength = 50;

  // RSI factor
  if (momentum.rsiSignal === 'oversold') strength += 15;
  if (momentum.rsiSignal === 'overbought') strength -= 15;

  // MACD factor
  if (momentum.trend === 'bullish') strength += 20;
  if (momentum.trend === 'bearish') strength -= 20;

  // Divergence factor
  if (momentum.divergence === 'bullish') strength += 15;
  if (momentum.divergence === 'bearish') strength -= 15;

  // MACD histogram strength
  const histogramStrength = Math.abs(momentum.macd.histogram);
  if (histogramStrength > 10) strength += 10;

  return Math.max(0, Math.min(100, strength));
}
