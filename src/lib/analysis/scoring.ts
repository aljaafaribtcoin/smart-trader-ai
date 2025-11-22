/**
 * Confidence Scoring System
 * Calculates confidence score based on multiple factors
 */

import type { ScoringFactors, TimeframeAnalysisData, MultiTimeframeSummary } from './types';

/**
 * Calculate confidence score from various factors
 */
export function calculateConfidenceScore(factors: ScoringFactors): number {
  let score = 0;

  // Multi-timeframe alignment (max 25 points)
  score += factors.multiTimeframeAlignment * 0.25;

  // Order Block presence (15 points)
  if (factors.orderBlockPresence) score += 15;

  // Liquidity sweep (15 points)
  if (factors.liquiditySweep) score += 15;

  // Momentum confirmation (10 points)
  if (factors.momentumConfirmation) score += 10;

  // Structure break (10 points)
  if (factors.structureBreak) score += 10;

  // Volume confirmation (10 points)
  if (factors.volumeConfirmation) score += 10;

  // Near key level (5 points)
  if (factors.nearKeyLevel) score += 5;

  // Fakeout detected (10 points)
  if (factors.fakeoutDetected) score += 10;

  // Trend strength (max 10 points)
  score += (factors.trendStrength / 100) * 10;

  // RSI confirmation (5 points)
  if (factors.rsiConfirmation) score += 5;

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Build scoring factors from analysis data
 */
export function buildScoringFactors(
  direction: 'long' | 'short',
  timeframeData: Map<string, TimeframeAnalysisData>,
  mtf: MultiTimeframeSummary
): ScoringFactors {
  // Get primary timeframe data (1h as default)
  const primaryData = timeframeData.get('1h') || timeframeData.get('4h');
  
  if (!primaryData) {
    return {
      multiTimeframeAlignment: 0,
      orderBlockPresence: false,
      liquiditySweep: false,
      momentumConfirmation: false,
      structureBreak: false,
      volumeConfirmation: false,
      nearKeyLevel: false,
      fakeoutDetected: false,
      trendStrength: 0,
      rsiConfirmation: false,
    };
  }

  // Multi-timeframe alignment
  const multiTimeframeAlignment = mtf.confluenceScore;

  // Order Block presence
  const relevantOBs = primaryData.orderBlocks.filter(ob => 
    ob.direction === (direction === 'long' ? 'bullish' : 'bearish') &&
    ob.status !== 'broken'
  );
  const orderBlockPresence = relevantOBs.length > 0 && relevantOBs[0].strength >= 65;

  // Liquidity sweep
  const sweptZones = primaryData.liquidityZones.filter(z => z.swept);
  const liquiditySweep = sweptZones.length > 0;

  // Momentum confirmation
  const momentum = primaryData.momentum;
  const momentumConfirmation = direction === 'long' 
    ? momentum.trend === 'bullish' && momentum.rsiSignal !== 'overbought'
    : momentum.trend === 'bearish' && momentum.rsiSignal !== 'oversold';

  // Structure break
  const structureBreak = primaryData.structure.recentBreak !== undefined;

  // Volume confirmation (check if recent volume is above average)
  // This would need candle data, simplified here
  const volumeConfirmation = true; // Placeholder

  // Near key level
  const nearKeyLevel = primaryData.structure.isNearKeySwing;

  // Fakeout detected
  const fakeoutDetected = primaryData.fakeouts.some(f => 
    direction === 'long' 
      ? (f.type === 'support' || f.type === 'low') && f.reversal
      : (f.type === 'resistance' || f.type === 'high') && f.reversal
  );

  // Trend strength
  const trendStrength = primaryData.structure.structureStrength;

  // RSI confirmation
  const rsiConfirmation = direction === 'long'
    ? momentum.rsi < 70 && momentum.rsi > 40
    : momentum.rsi > 30 && momentum.rsi < 60;

  return {
    multiTimeframeAlignment,
    orderBlockPresence,
    liquiditySweep,
    momentumConfirmation,
    structureBreak,
    volumeConfirmation,
    nearKeyLevel,
    fakeoutDetected,
    trendStrength,
    rsiConfirmation,
  };
}

/**
 * Get confidence level category
 */
export function getConfidenceLevel(score: number): string {
  if (score >= 80) return 'عالية جداً';
  if (score >= 65) return 'جيدة';
  if (score >= 50) return 'متوسطة';
  return 'ضعيفة';
}

/**
 * Determine if confidence is sufficient for signal
 */
export function isSufficientConfidence(score: number, minThreshold: number = 65): boolean {
  return score >= minThreshold;
}
