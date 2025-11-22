/**
 * Mathematical Utilities
 * Helper functions for calculations
 */

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] || 0;
  
  const recentValues = values.slice(-period);
  const sum = recentValues.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(values: number[], period: number): number {
  if (values.length === 0) return 0;
  if (values.length < period) return calculateSMA(values, values.length);
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(values.slice(0, period), period);
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: number[]): number {
  const mean = calculateSMA(values, values.length);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = calculateSMA(squaredDiffs, squaredDiffs.length);
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate price distance percentage
 */
export function calculatePriceDistance(price1: number, price2: number): number {
  return Math.abs(price1 - price2) / price1;
}

/**
 * Normalize value to 0-100 range
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate average of array
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Find maximum value in array
 */
export function max(values: number[]): number {
  return Math.max(...values);
}

/**
 * Find minimum value in array
 */
export function min(values: number[]): number {
  return Math.min(...values);
}

/**
 * Calculate sum of array
 */
export function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Check if values are approximately equal (within tolerance)
 */
export function areApproximatelyEqual(a: number, b: number, tolerance: number = 0.001): boolean {
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) <= tolerance;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Calculate slope (rate of change)
 */
export function calculateSlope(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = sum(values);
  const xySum = values.reduce((acc, y, x) => acc + x * y, 0);
  const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  return slope;
}
