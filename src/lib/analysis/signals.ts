/**
 * Signal Generation
 * Creates trading signals with entry, stop loss, and targets
 */

import type { Signal, TimeframeAnalysisData, MultiTimeframeSummary, AnalysisConfig, TimeframeId } from './types';
import { calculateConfidenceScore, buildScoringFactors, isSufficientConfidence } from './scoring';
import { v4 as uuidv4 } from 'uuid';

export function generateSignals(
  symbol: string,
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>,
  mtf: MultiTimeframeSummary,
  config: AnalysisConfig
): Signal[] {
  const signals: Signal[] = [];
  const minConfidence = config.minConfidenceForSignal || 65;

  // Try long signal
  const longFactors = buildScoringFactors('long', timeframeData, mtf);
  const longConfidence = calculateConfidenceScore(longFactors);

  if (isSufficientConfidence(longConfidence, minConfidence) && mtf.globalBias === 'long') {
    signals.push(createLongSignal(symbol, timeframeData, mtf, longConfidence));
  }

  // Try short signal
  const shortFactors = buildScoringFactors('short', timeframeData, mtf);
  const shortConfidence = calculateConfidenceScore(shortFactors);

  if (isSufficientConfidence(shortConfidence, minConfidence) && mtf.globalBias === 'short') {
    signals.push(createShortSignal(symbol, timeframeData, mtf, shortConfidence));
  }

  return signals;
}

function createLongSignal(
  symbol: string,
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>,
  mtf: MultiTimeframeSummary,
  confidence: number
): Signal {
  const primaryData = timeframeData.get('1h') || timeframeData.values().next().value;
  const structure = primaryData.structure;
  const orderBlocks = primaryData.orderBlocks.filter(ob => ob.direction === 'bullish');

  const currentPrice = structure.lastSwingLow * 1.01;
  const entryZone = orderBlocks.length > 0 
    ? { from: orderBlocks[0].priceFrom, to: orderBlocks[0].priceTo }
    : { from: structure.lastSwingLow, to: structure.lastSwingLow * 1.02 };

  const stopLoss = structure.lastSwingLow * 0.98;
  const riskDistance = entryZone.to - stopLoss;
  const targets = {
    tp1: entryZone.to + riskDistance * 1.5,
    tp2: entryZone.to + riskDistance * 2.5,
    tp3: entryZone.to + riskDistance * 4,
  };

  return {
    id: uuidv4(),
    symbol,
    direction: 'long',
    confidence,
    timestamp: Date.now(),
    entryZone,
    stopLoss,
    targets,
    riskReward: 2.5,
    originatingTimeframe: '1h',
    alignedTimeframes: mtf.alignedTimeframes,
    conflictingTimeframes: mtf.conflictingTimeframes,
    supportingFactors: ['اتجاه صاعد', 'OB قوي', 'تصحيح صحي'],
    tags: ['trend_follow', 'order_block'],
    mainScenario: 'السعر في منطقة طلب قوية مع اتجاه صاعد على الفريمات الكبيرة',
    alternativeScenario: 'قد يختبر السعر القاع مرة أخرى قبل الصعود',
    invalidationPrice: stopLoss,
    invalidationReason: 'كسر القاع الأخير يلغي السيناريو الصاعد',
  };
}

function createShortSignal(
  symbol: string,
  timeframeData: Map<TimeframeId, TimeframeAnalysisData>,
  mtf: MultiTimeframeSummary,
  confidence: number
): Signal {
  const primaryData = timeframeData.get('1h') || timeframeData.values().next().value;
  const structure = primaryData.structure;
  const orderBlocks = primaryData.orderBlocks.filter(ob => ob.direction === 'bearish');

  const entryZone = orderBlocks.length > 0
    ? { from: orderBlocks[0].priceFrom, to: orderBlocks[0].priceTo }
    : { from: structure.lastSwingHigh * 0.98, to: structure.lastSwingHigh };

  const stopLoss = structure.lastSwingHigh * 1.02;
  const riskDistance = stopLoss - entryZone.from;
  const targets = {
    tp1: entryZone.from - riskDistance * 1.5,
    tp2: entryZone.from - riskDistance * 2.5,
    tp3: entryZone.from - riskDistance * 4,
  };

  return {
    id: uuidv4(),
    symbol,
    direction: 'short',
    confidence,
    timestamp: Date.now(),
    entryZone,
    stopLoss,
    targets,
    riskReward: 2.5,
    originatingTimeframe: '1h',
    alignedTimeframes: mtf.alignedTimeframes,
    conflictingTimeframes: mtf.conflictingTimeframes,
    supportingFactors: ['اتجاه هابط', 'مقاومة قوية', 'ضغط بيعي'],
    tags: ['trend_follow', 'resistance'],
    mainScenario: 'السعر في منطقة عرض قوية مع اتجاه هابط على الفريمات الكبيرة',
    alternativeScenario: 'قد يختبر السعر القمة مرة أخرى قبل الهبوط',
    invalidationPrice: stopLoss,
    invalidationReason: 'كسر القمة الأخيرة يلغي السيناريو الهابط',
  };
}
