/**
 * Smart Trader AI - Market Analyst Engine
 * Main analysis orchestrator
 */

import type { SymbolMarketData, AnalysisConfig, AnalysisResult, TimeframeAnalysisData, TimeframeId } from './types';
import { analyzeStructure } from './structure';
import { analyzeLiquidity } from './liquidity';
import { analyzeOrderBlocks } from './orderBlocks';
import { analyzeMomentum } from './momentum';
import { detectFakeouts } from './fakeouts';
import { analyzeMultiTimeframe } from './confluence';
import { generateSignals } from './signals';
import { generateNarrative, generateTelegramSummary } from './narratives';

const DEFAULT_CONFIG: AnalysisConfig = {
  maxLookbackCandles: 500,
  riskProfile: 'balanced',
  minConfidenceForSignal: 65,
  enableOrderBlocks: true,
  enableLiquidityZones: true,
};

export async function analyzeSymbol(
  data: SymbolMarketData,
  config: AnalysisConfig = {}
): Promise<AnalysisResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const timeframeAnalysis: Record<string, TimeframeAnalysisData> = {};

  // Analyze each timeframe
  for (const tf of data.timeframes) {
    const candles = tf.candles.slice(-finalConfig.maxLookbackCandles!);
    
    const structure = analyzeStructure(candles, tf.timeframe);
    const liquidityZones = analyzeLiquidity(candles, structure.swingPoints, tf.timeframe);
    const orderBlocks = analyzeOrderBlocks(candles, structure, liquidityZones, tf.timeframe);
    const momentum = analyzeMomentum(candles, tf.timeframe);
    const keyLevels = [...liquidityZones.map(z => z.price), structure.lastSwingHigh, structure.lastSwingLow];
    const fakeouts = detectFakeouts(candles, keyLevels, liquidityZones, tf.timeframe);

    timeframeAnalysis[tf.timeframe] = {
      structure,
      orderBlocks,
      liquidityZones,
      fakeouts,
      momentum,
    };
  }

  // Multi-timeframe analysis
  const timeframeMap = new Map<TimeframeId, TimeframeAnalysisData>(
    Object.entries(timeframeAnalysis) as [TimeframeId, TimeframeAnalysisData][]
  );
  const multiTimeframe = analyzeMultiTimeframe(timeframeMap);

  // Generate signals
  const signals = generateSignals(data.symbol, timeframeMap, multiTimeframe, finalConfig);

  // Extract key levels
  const keyLevels = Object.entries(timeframeAnalysis).flatMap(([tf, analysis]) => 
    analysis.liquidityZones.map(z => ({
      type: 'liquidity' as const,
      price: z.price,
      timeframe: tf as TimeframeId,
      strength: z.strength,
    }))
  );

  // Determine market condition
  const marketCondition = determineMarketCondition(timeframeAnalysis);

  // Build result
  const result: AnalysisResult = {
    symbol: data.symbol,
    generatedAt: Date.now(),
    bias: multiTimeframe.globalBias,
    confidence: signals[0]?.confidence || 0,
    marketCondition,
    timeframeAnalysis,
    multiTimeframe,
    keyLevels: keyLevels.slice(0, 10),
    signals,
    narrative: { overview: '', strengthPoints: [], weakPoints: [], warnings: [] },
    telegramSummary: '',
  };

  result.narrative = generateNarrative(result);
  result.telegramSummary = signals[0] ? generateTelegramSummary(signals[0]) : 'لا توجد إشارات واضحة حالياً';

  return result;
}

function determineMarketCondition(
  timeframeAnalysis: Record<string, TimeframeAnalysisData>
): 'trending' | 'ranging' | 'choppy' | 'high_volatility' {
  const trends = Object.values(timeframeAnalysis).map(a => a.structure.trend);
  const trendingCount = trends.filter(t => t === 'bullish' || t === 'bearish').length;
  
  if (trendingCount >= trends.length * 0.7) return 'trending';
  if (trends.filter(t => t === 'choppy').length > trends.length / 2) return 'choppy';
  return 'ranging';
}

export * from './types';
