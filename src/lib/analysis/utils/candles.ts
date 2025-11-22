/**
 * Candle Utilities
 * Helper functions for working with candlestick data
 */

import type { Candle } from '../types';

/**
 * Get array of closing prices from candles
 */
export function getClosePrices(candles: Candle[]): number[] {
  return candles.map(c => c.close);
}

/**
 * Get array of high prices from candles
 */
export function getHighPrices(candles: Candle[]): number[] {
  return candles.map(c => c.high);
}

/**
 * Get array of low prices from candles
 */
export function getLowPrices(candles: Candle[]): number[] {
  return candles.map(c => c.low);
}

/**
 * Get array of volumes from candles
 */
export function getVolumes(candles: Candle[]): number[] {
  return candles.map(c => c.volume);
}

/**
 * Calculate the body size of a candle
 */
export function getCandleBody(candle: Candle): number {
  return Math.abs(candle.close - candle.open);
}

/**
 * Calculate upper wick size
 */
export function getUpperWick(candle: Candle): number {
  return candle.high - Math.max(candle.open, candle.close);
}

/**
 * Calculate lower wick size
 */
export function getLowerWick(candle: Candle): number {
  return Math.min(candle.open, candle.close) - candle.low;
}

/**
 * Get candle range (high - low)
 */
export function getCandleRange(candle: Candle): number {
  return candle.high - candle.low;
}

/**
 * Check if candle is bullish
 */
export function isBullishCandle(candle: Candle): boolean {
  return candle.close > candle.open;
}

/**
 * Check if candle is bearish
 */
export function isBearishCandle(candle: Candle): boolean {
  return candle.close < candle.open;
}

/**
 * Calculate average candle body size over a period
 */
export function getAverageCandleBody(candles: Candle[], period: number = 20): number {
  const recentCandles = candles.slice(-period);
  const totalBody = recentCandles.reduce((sum, c) => sum + getCandleBody(c), 0);
  return totalBody / recentCandles.length;
}

/**
 * Calculate average candle range over a period
 */
export function getAverageCandleRange(candles: Candle[], period: number = 20): number {
  const recentCandles = candles.slice(-period);
  const totalRange = recentCandles.reduce((sum, c) => sum + getCandleRange(c), 0);
  return totalRange / recentCandles.length;
}

/**
 * Check if candle is a doji (small body compared to wicks)
 */
export function isDoji(candle: Candle, threshold: number = 0.1): boolean {
  const body = getCandleBody(candle);
  const range = getCandleRange(candle);
  return range > 0 && (body / range) < threshold;
}

/**
 * Check if candle has long upper wick
 */
export function hasLongUpperWick(candle: Candle): boolean {
  const upperWick = getUpperWick(candle);
  const body = getCandleBody(candle);
  return upperWick > body * 2;
}

/**
 * Check if candle has long lower wick
 */
export function hasLongLowerWick(candle: Candle): boolean {
  const lowerWick = getLowerWick(candle);
  const body = getCandleBody(candle);
  return lowerWick > body * 2;
}

/**
 * Get the highest high in a range of candles
 */
export function getHighestHigh(candles: Candle[]): number {
  return Math.max(...candles.map(c => c.high));
}

/**
 * Get the lowest low in a range of candles
 */
export function getLowestLow(candles: Candle[]): number {
  return Math.min(...candles.map(c => c.low));
}

/**
 * Find the index of the highest high
 */
export function findHighestHighIndex(candles: Candle[]): number {
  const highest = getHighestHigh(candles);
  return candles.findIndex(c => c.high === highest);
}

/**
 * Find the index of the lowest low
 */
export function findLowestLowIndex(candles: Candle[]): number {
  const lowest = getLowestLow(candles);
  return candles.findIndex(c => c.low === lowest);
}

/**
 * Check if price is within a range (with tolerance)
 */
export function isPriceNear(price: number, target: number, tolerance: number = 0.001): boolean {
  const diff = Math.abs(price - target) / target;
  return diff <= tolerance;
}

/**
 * Get last N candles
 */
export function getLastCandles(candles: Candle[], count: number): Candle[] {
  return candles.slice(-count);
}

/**
 * Sort candles by timestamp (ascending)
 */
export function sortCandlesByTime(candles: Candle[]): Candle[] {
  return [...candles].sort((a, b) => a.timestamp - b.timestamp);
}
