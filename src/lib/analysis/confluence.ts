/**
 * Multi-Timeframe Confluence Analysis
 * Combines analysis from multiple timeframes to determine overall bias
 */

import type { TimeframeId, TimeframeAnalysisData, MultiTimeframeSummary } from './types';

/**
 * Calculate alignment score between timeframes
 */
function calculateAlignmentScore(
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>
): number {
  const timeframes = Array.from(timeframeData.keys());
  if (timeframes.length < 2) return 50;

  let alignedCount = 0;
  let totalComparisons = 0;

  const biases = timeframes.map(tf => {
    const data = timeframeData.get(tf)!;
    return data.structure.trend;
  });

  // Count how many timeframes agree
  for (let i = 0; i < biases.length - 1; i++) {
    for (let j = i + 1; j < biases.length; j++) {
      totalComparisons++;
      if (biases[i] === biases[j] && biases[i] !== 'range' && biases[i] !== 'choppy') {
        alignedCount++;
      }
    }
  }

  return (alignedCount / totalComparisons) * 100;
}

/**
 * Determine global bias from multiple timeframes
 */
function determineGlobalBias(
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>
): 'long' | 'short' | 'neutral' {
  const timeframes = Array.from(timeframeData.keys());
  
  let bullishCount = 0;
  let bearishCount = 0;

  for (const tf of timeframes) {
    const data = timeframeData.get(tf)!;
    const trend = data.structure.trend;

    if (trend === 'bullish') bullishCount++;
    if (trend === 'bearish') bearishCount++;
  }

  // Weighted by timeframe importance (higher timeframes have more weight)
  const weights: Record<TimeframeId, number> = {
    '1d': 5,
    '4h': 4,
    '1h': 3,
    '15m': 2,
    '5m': 1,
    '3m': 1,
    '1m': 1,
  };

  let bullishScore = 0;
  let bearishScore = 0;

  for (const tf of timeframes) {
    const data = timeframeData.get(tf)!;
    const weight = weights[tf] || 1;

    if (data.structure.trend === 'bullish') bullishScore += weight;
    if (data.structure.trend === 'bearish') bearishScore += weight;
  }

  if (bullishScore > bearishScore && bullishScore >= 7) return 'long';
  if (bearishScore > bullishScore && bearishScore >= 7) return 'short';
  return 'neutral';
}

/**
 * Find dominant timeframe (highest structure strength)
 */
function findDominantTimeframe(
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>
): TimeframeId {
  let dominant: TimeframeId = '1h';
  let maxStrength = 0;

  for (const [tf, data] of timeframeData.entries()) {
    if (data.structure.structureStrength > maxStrength) {
      maxStrength = data.structure.structureStrength;
      dominant = tf;
    }
  }

  return dominant;
}

/**
 * Generate confluence comment
 */
function generateConfluenceComment(
  globalBias: 'long' | 'short' | 'neutral',
  alignedTimeframes: TimeframeId[],
  conflictingTimeframes: TimeframeId[]
): string {
  if (globalBias === 'neutral') {
    return 'الفريمات متعارضة، لا يوجد اتجاه واضح. يفضل الانتظار لإشارة أوضح.';
  }

  const direction = globalBias === 'long' ? 'صاعد' : 'هابط';
  const alignedCount = alignedTimeframes.length;
  const conflictCount = conflictingTimeframes.length;

  if (conflictCount === 0) {
    return `جميع الفريمات متفقة على اتجاه ${direction} قوي. إشارة قوية جداً.`;
  }

  if (alignedCount > conflictCount * 2) {
    return `معظم الفريمات تشير لاتجاه ${direction}، مع بعض التعارض في الفريمات الأصغر. إشارة جيدة.`;
  }

  return `الفريمات الكبيرة تشير لاتجاه ${direction} لكن هناك تعارض في الفريمات الصغيرة. حذر معتدل.`;
}

/**
 * Main multi-timeframe confluence analysis
 */
export function analyzeMultiTimeframe(
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>
): MultiTimeframeSummary {
  const globalBias = determineGlobalBias(timeframeData);
  
  const alignedTimeframes: TimeframeId[] = [];
  const conflictingTimeframes: TimeframeId[] = [];

  // Categorize timeframes based on alignment with global bias
  for (const [tf, data] of timeframeData.entries()) {
    const trend = data.structure.trend;

    if (globalBias === 'long' && trend === 'bullish') {
      alignedTimeframes.push(tf);
    } else if (globalBias === 'short' && trend === 'bearish') {
      alignedTimeframes.push(tf);
    } else if (trend !== 'range' && trend !== 'choppy') {
      conflictingTimeframes.push(tf);
    }
  }

  const dominantTimeframe = findDominantTimeframe(timeframeData);
  const confluenceScore = calculateAlignmentScore(timeframeData);
  const comment = generateConfluenceComment(globalBias, alignedTimeframes, conflictingTimeframes);

  return {
    globalBias,
    alignedTimeframes,
    conflictingTimeframes,
    dominantTimeframe,
    confluenceScore,
    comment,
  };
}

/**
 * Check if multi-timeframe analysis supports a direction
 */
export function doesMTFSupport(
  mtf: MultiTimeframeSummary,
  direction: 'long' | 'short'
): boolean {
  if (direction === 'long') {
    return mtf.globalBias === 'long' && mtf.confluenceScore >= 60;
  } else {
    return mtf.globalBias === 'short' && mtf.confluenceScore >= 60;
  }
}
