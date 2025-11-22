import { supabase } from '@/integrations/supabase/client';
import { Candle, FetchCandlesParams } from '@/core/types';

/**
 * Map internal timeframe to Binance API format
 */
function mapTimeframeToBinance(timeframe: string): string {
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
 * Transform Bybit/Binance response to standard Candle format
 */
function transformToStandardCandles(data: any[]): Candle[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item: any) => ({
    timestamp: typeof item.timestamp === 'string' 
      ? new Date(item.timestamp).getTime()
      : item.timestamp || item.time || item[0],
    open: parseFloat(item.open || item[1]),
    high: parseFloat(item.high || item[2]),
    low: parseFloat(item.low || item[3]),
    close: parseFloat(item.close || item[4]),
    volume: parseFloat(item.volume || item[5]),
  }));
}

/**
 * Fetch candles from Binance via Edge Function
 */
export async function fetchBinanceCandles(
  params: FetchCandlesParams
): Promise<Candle[]> {
  try {
    const binanceTimeframe = mapTimeframeToBinance(params.timeframe);
    
    // Call existing edge function (fetch-bybit-candles supports multiple sources)
    const { data, error } = await supabase.functions.invoke('fetch-bybit-candles', {
      body: {
        symbol: params.symbol,
        timeframe: binanceTimeframe,
        limit: params.limit || 500,
        source: 'binance'
      },
    });

    if (error) {
      throw new Error(`Binance adapter error: ${error.message}`);
    }

    if (!data?.candles) {
      throw new Error('Binance: Invalid response format');
    }

    return transformToStandardCandles(data.candles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch Binance candles: ${message}`);
  }
}
