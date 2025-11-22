import { supabase } from '@/integrations/supabase/client';
import { Candle, FetchCandlesParams } from '@/core/types';

/**
 * Map internal timeframe to LiveCoinWatch format
 */
function mapTimeframeToLcw(timeframe: string): string {
  const mapping: Record<string, string> = {
    '3m': '3m',
    '5m': '5m',
    '15m': '15m',
    '1H': '1h',
    '4H': '4h',
    '1D': '1d',
  };
  return mapping[timeframe] || '1h';
}

/**
 * Transform LiveCoinWatch response to standard Candle format
 */
function transformToStandardCandles(data: any[]): Candle[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item: any) => ({
    timestamp: typeof item.date === 'string' 
      ? new Date(item.date).getTime()
      : item.timestamp || item.time,
    open: parseFloat(item.open || item.rate),
    high: parseFloat(item.high || item.rate),
    low: parseFloat(item.low || item.rate),
    close: parseFloat(item.close || item.rate),
    volume: parseFloat(item.volume || 0),
  }));
}

/**
 * Fetch candles from LiveCoinWatch via Edge Function
 */
export async function fetchLcwCandles(
  params: FetchCandlesParams
): Promise<Candle[]> {
  try {
    const lcwTimeframe = mapTimeframeToLcw(params.timeframe);
    
    const { data, error } = await supabase.functions.invoke('fetch-livecoinwatch-prices', {
      body: {
        symbols: [params.symbol],
        timeframe: lcwTimeframe,
        limit: params.limit || 500,
      },
    });

    if (error) {
      throw new Error(`LiveCoinWatch adapter error: ${error.message}`);
    }

    if (!data?.candles && !data?.history) {
      throw new Error('LiveCoinWatch: Invalid response format');
    }

    return transformToStandardCandles(data.candles || data.history || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch LiveCoinWatch candles: ${message}`);
  }
}
