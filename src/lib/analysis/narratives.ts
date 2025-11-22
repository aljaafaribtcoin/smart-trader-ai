/**
 * Narrative Generation
 * Creates Arabic text summaries and Telegram messages
 */

import type { AnalysisResult, Narrative, Signal } from './types';

export function generateNarrative(analysis: Partial<AnalysisResult>): Narrative {
  return {
    overview: generateOverview(analysis),
    strengthPoints: generateStrengthPoints(analysis),
    weakPoints: generateWeakPoints(analysis),
    warnings: generateWarnings(analysis),
  };
}

function generateOverview(analysis: Partial<AnalysisResult>): string {
  const bias = analysis.bias || 'neutral';
  const condition = analysis.marketCondition || 'ranging';
  
  const biasText = bias === 'long' ? 'صاعد' : bias === 'short' ? 'هابط' : 'محايد';
  const conditionText = condition === 'trending' ? 'ترند واضح' : 
                       condition === 'ranging' ? 'تذبذب' : 'تقلبات عالية';
  
  return `الاتجاه العام ${biasText} مع ${conditionText}. درجة الثقة: ${analysis.confidence || 0}%`;
}

function generateStrengthPoints(analysis: Partial<AnalysisResult>): string[] {
  const points: string[] = [];
  
  if (analysis.multiTimeframe?.confluenceScore && analysis.multiTimeframe.confluenceScore > 70) {
    points.push('توافق قوي بين الفريمات الزمنية المختلفة');
  }
  
  return points.length > 0 ? points : ['لا توجد نقاط قوة واضحة حالياً'];
}

function generateWeakPoints(analysis: Partial<AnalysisResult>): string[] {
  const points: string[] = [];
  
  if (analysis.marketCondition === 'choppy') {
    points.push('السوق متذبذب وغير واضح الاتجاه');
  }
  
  return points;
}

function generateWarnings(analysis: Partial<AnalysisResult>): string[] {
  const warnings: string[] = [];
  
  if (analysis.marketCondition === 'high_volatility') {
    warnings.push('⚠️ تقلبات عالية - احذر من حركات سعرية حادة');
  }
  
  return warnings;
}

export function generateTelegramSummary(signal: Signal): string {
  const emoji = signal.direction === 'long' ? '📈' : '📉';
  const directionAr = signal.direction === 'long' ? 'شراء' : 'بيع';
  
  return `
🎯 إشارة ${emoji} ${directionAr} - ${signal.symbol}
⚡ الثقة: ${signal.confidence}%
📍 الدخول: ${signal.entryZone.from.toFixed(2)} - ${signal.entryZone.to.toFixed(2)}
🛑 وقف الخسارة: ${signal.stopLoss.toFixed(2)}
🎯 الأهداف:
   TP1: ${signal.targets.tp1.toFixed(2)}
   TP2: ${signal.targets.tp2.toFixed(2)}
   TP3: ${signal.targets.tp3.toFixed(2)}
💰 العائد/المخاطرة: 1:${signal.riskReward.toFixed(1)}

${signal.mainScenario}
  `.trim();
}
