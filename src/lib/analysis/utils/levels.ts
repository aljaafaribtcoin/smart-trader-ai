/**
 * Price Level Utilities
 * Helper functions for working with price levels and zones
 */

import type { SwingPoint, LiquidityZone, OrderBlock } from '../types';
import { areApproximatelyEqual } from './math';

/**
 * Check if two prices are approximately equal
 */
export function arePricesEqual(price1: number, price2: number, tolerance: number = 0.002): boolean {
  return areApproximatelyEqual(price1, price2, tolerance);
}

/**
 * Find equal highs in swing points
 */
export function findEqualHighs(swingPoints: SwingPoint[], tolerance: number = 0.002): number[][] {
  const highs = swingPoints.filter(p => p.isHigh);
  const groups: number[][] = [];
  
  for (let i = 0; i < highs.length; i++) {
    let found = false;
    
    for (const group of groups) {
      if (arePricesEqual(highs[i].price, group[0], tolerance)) {
        group.push(highs[i].price);
        found = true;
        break;
      }
    }
    
    if (!found) {
      groups.push([highs[i].price]);
    }
  }
  
  return groups.filter(g => g.length >= 2);
}

/**
 * Find equal lows in swing points
 */
export function findEqualLows(swingPoints: SwingPoint[], tolerance: number = 0.002): number[][] {
  const lows = swingPoints.filter(p => !p.isHigh);
  const groups: number[][] = [];
  
  for (let i = 0; i < lows.length; i++) {
    let found = false;
    
    for (const group of groups) {
      if (arePricesEqual(lows[i].price, group[0], tolerance)) {
        group.push(lows[i].price);
        found = true;
        break;
      }
    }
    
    if (!found) {
      groups.push([lows[i].price]);
    }
  }
  
  return groups.filter(g => g.length >= 2);
}

/**
 * Check if current price is near a level
 */
export function isPriceNearLevel(
  currentPrice: number,
  level: number,
  tolerancePercent: number = 0.5
): boolean {
  const diff = Math.abs(currentPrice - level) / level;
  return diff <= (tolerancePercent / 100);
}

/**
 * Get the closest level to current price
 */
export function getClosestLevel(currentPrice: number, levels: number[]): number | null {
  if (levels.length === 0) return null;
  
  return levels.reduce((closest, level) => {
    const currentDiff = Math.abs(currentPrice - level);
    const closestDiff = Math.abs(currentPrice - closest);
    return currentDiff < closestDiff ? level : closest;
  });
}

/**
 * Check if price broke through a level
 */
export function didPriceBreakLevel(
  previousPrice: number,
  currentPrice: number,
  level: number,
  direction: 'up' | 'down'
): boolean {
  if (direction === 'up') {
    return previousPrice < level && currentPrice > level;
  } else {
    return previousPrice > level && currentPrice < level;
  }
}

/**
 * Calculate the strength of a level based on touches
 */
export function calculateLevelStrength(
  touches: number,
  timespan: number,
  volume: number = 1
): number {
  // More touches = stronger level
  const touchScore = Math.min(touches * 20, 50);
  
  // Longer timespan = more significant
  const timespanScore = Math.min(timespan / 100, 30);
  
  // Higher volume = stronger
  const volumeScore = Math.min(volume / 10, 20);
  
  return Math.min(touchScore + timespanScore + volumeScore, 100);
}

/**
 * Merge overlapping zones
 */
export function mergeOverlappingZones(
  zones: Array<{ priceFrom: number; priceTo: number }>
): Array<{ priceFrom: number; priceTo: number }> {
  if (zones.length === 0) return [];
  
  const sorted = [...zones].sort((a, b) => a.priceFrom - b.priceFrom);
  const merged: Array<{ priceFrom: number; priceTo: number }> = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const lastMerged = merged[merged.length - 1];
    
    if (current.priceFrom <= lastMerged.priceTo) {
      lastMerged.priceTo = Math.max(lastMerged.priceTo, current.priceTo);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

/**
 * Check if price is within a zone
 */
export function isPriceInZone(
  price: number,
  zoneFrom: number,
  zoneTo: number
): boolean {
  const min = Math.min(zoneFrom, zoneTo);
  const max = Math.max(zoneFrom, zoneTo);
  return price >= min && price <= max;
}

/**
 * Get the distance from price to zone (0 if inside)
 */
export function getDistanceToZone(
  price: number,
  zoneFrom: number,
  zoneTo: number
): number {
  if (isPriceInZone(price, zoneFrom, zoneTo)) return 0;
  
  const min = Math.min(zoneFrom, zoneTo);
  const max = Math.max(zoneFrom, zoneTo);
  
  if (price < min) return min - price;
  return price - max;
}

/**
 * Sort levels by proximity to current price
 */
export function sortLevelsByProximity(
  currentPrice: number,
  levels: number[]
): number[] {
  return [...levels].sort((a, b) => {
    const distA = Math.abs(currentPrice - a);
    const distB = Math.abs(currentPrice - b);
    return distA - distB;
  });
}

/**
 * Filter levels within a price range
 */
export function filterLevelsInRange(
  levels: number[],
  minPrice: number,
  maxPrice: number
): number[] {
  return levels.filter(level => level >= minPrice && level <= maxPrice);
}
