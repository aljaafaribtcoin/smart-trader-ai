/**
 * Technical Indicators
 * Core indicator calculations for market analysis
 */

import type { Candle } from './types';
import { calculateSMA, calculateEMA, calculateStdDev } from './utils/math';

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);

  let avgGain = calculateSMA(gains.slice(0, period), period);
  let avgLoss = calculateSMA(losses.slice(0, period), period);

  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): {
  value: number;
  signal: number;
  histogram: number;
} {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;

  // Calculate signal line (9-period EMA of MACD)
  const macdValues: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdValues.push(e12 - e26);
  }

  const signalLine = calculateEMA(macdValues, 9);
  const histogram = macdLine - signalLine;

  return {
    value: macdLine,
    signal: signalLine,
    histogram,
  };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: number;
  middle: number;
  lower: number;
} {
  const middle = calculateSMA(prices, period);
  const stdDev = calculateStdDev(prices.slice(-period));

  return {
    upper: middle + (stdDev * stdDevMultiplier),
    middle,
    lower: middle - (stdDev * stdDevMultiplier),
  };
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 0;

  const trueRanges: number[] = [];

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

  return calculateSMA(trueRanges, Math.min(period, trueRanges.length));
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  candles: Candle[],
  period: number = 14,
  smoothK: number = 3,
  smoothD: number = 3
): {
  k: number;
  d: number;
} {
  if (candles.length < period) {
    return { k: 50, d: 50 };
  }

  const recentCandles = candles.slice(-period);
  const currentClose = candles[candles.length - 1].close;
  const lowestLow = Math.min(...recentCandles.map(c => c.low));
  const highestHigh = Math.max(...recentCandles.map(c => c.high));

  let k = 50;
  if (highestHigh - lowestLow !== 0) {
    k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  }

  // Calculate %D (smoothed %K)
  const kValues: number[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const close = candles[i].close;
    const low = Math.min(...slice.map(c => c.low));
    const high = Math.max(...slice.map(c => c.high));

    if (high - low !== 0) {
      kValues.push(((close - low) / (high - low)) * 100);
    } else {
      kValues.push(50);
    }
  }

  const d = calculateSMA(kValues, Math.min(smoothD, kValues.length));

  return { k, d };
}

/**
 * Calculate Volume Moving Average
 */
export function calculateVolumeMA(candles: Candle[], period: number = 20): number {
  const volumes = candles.map(c => c.volume);
  return calculateSMA(volumes, Math.min(period, volumes.length));
}

/**
 * Calculate Price Rate of Change (ROC)
 */
export function calculateROC(prices: number[], period: number = 12): number {
  if (prices.length < period + 1) return 0;

  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 1 - period];

  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Calculate Money Flow Index (MFI)
 */
export function calculateMFI(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 50;

  const typicalPrices: number[] = [];
  const moneyFlows: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    const tp = (candles[i].high + candles[i].low + candles[i].close) / 3;
    typicalPrices.push(tp);

    if (i > 0) {
      const mf = tp * candles[i].volume;
      moneyFlows.push(mf);
    }
  }

  let positiveFlow = 0;
  let negativeFlow = 0;

  for (let i = Math.max(0, moneyFlows.length - period); i < moneyFlows.length; i++) {
    if (typicalPrices[i + 1] > typicalPrices[i]) {
      positiveFlow += moneyFlows[i];
    } else {
      negativeFlow += moneyFlows[i];
    }
  }

  if (negativeFlow === 0) return 100;
  const mfr = positiveFlow / negativeFlow;
  return 100 - (100 / (1 + mfr));
}

/**
 * Detect RSI Divergence
 */
export function detectRSIDivergence(
  candles: Candle[],
  rsiValues: number[]
): 'bullish' | 'bearish' | null {
  if (candles.length < 10 || rsiValues.length < 10) return null;

  const recentCandles = candles.slice(-10);
  const recentRSI = rsiValues.slice(-10);

  const priceHighs = recentCandles.map(c => c.high);
  const priceLows = recentCandles.map(c => c.low);

  // Bullish divergence: price makes lower low but RSI makes higher low
  const lastPriceLow = Math.min(...priceLows.slice(-3));
  const prevPriceLow = Math.min(...priceLows.slice(-6, -3));
  const lastRSILow = Math.min(...recentRSI.slice(-3));
  const prevRSILow = Math.min(...recentRSI.slice(-6, -3));

  if (lastPriceLow < prevPriceLow && lastRSILow > prevRSILow) {
    return 'bullish';
  }

  // Bearish divergence: price makes higher high but RSI makes lower high
  const lastPriceHigh = Math.max(...priceHighs.slice(-3));
  const prevPriceHigh = Math.max(...priceHighs.slice(-6, -3));
  const lastRSIHigh = Math.max(...recentRSI.slice(-3));
  const prevRSIHigh = Math.max(...recentRSI.slice(-6, -3));

  if (lastPriceHigh > prevPriceHigh && lastRSIHigh < prevRSIHigh) {
    return 'bearish';
  }

  return null;
}
