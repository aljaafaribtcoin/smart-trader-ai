import { supabase } from '@/integrations/supabase/client';
import { Candle, FetchCandlesParams } from '@/core/types';

/**
 * Map internal timeframe to Bybit API format
 */
function mapTimeframeToBybit(timeframe: string): string {
  const mapping: Record<string, string> = {
    '3m': '3',
    '5m': '5',
    '15m': '15',
    '1H': '60',
    '4H': '240',
    '1D': 'D',
  };
  return mapping[timeframe] || '60';
}

/**
 * Transform Bybit response to standard Candle format
 */
function transformToStandardCandles(data: any[]): Candle[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item: any) => ({
    timestamp: typeof item.timestamp === 'string' 
      ? new Date(item.timestamp).getTime()
      : parseInt(item.timestamp || item.start_at || item[0]),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseFloat(item.volume),
  }));
}

/**
 * Fetch candles from Bybit via Edge Function
 */
export async function fetchBybitCandles(
  params: FetchCandlesParams
): Promise<Candle[]> {
  try {
    const bybitTimeframe = mapTimeframeToBybit(params.timeframe);
    
    const { data, error } = await supabase.functions.invoke('fetch-bybit-candles', {
      body: {
        symbol: params.symbol,
        timeframe: bybitTimeframe,
        limit: params.limit || 500,
      },
    });

    if (error) {
      throw new Error(`Bybit adapter error: ${error.message}`);
    }

    if (!data?.candles) {
      throw new Error('Bybit: Invalid response format');
    }

    return transformToStandardCandles(data.candles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch Bybit candles: ${message}`);
  }
}
