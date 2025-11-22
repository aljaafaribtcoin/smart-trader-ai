import { supabase } from '@/integrations/supabase/client';
import { Candle, FetchCandlesParams } from '@/core/types';

/**
 * Map internal timeframe to CoinMarketCap format
 */
function mapTimeframeToCmc(timeframe: string): string {
  const mapping: Record<string, string> = {
    '3m': '5m',    // CMC doesn't support 3m, use 5m
    '5m': '5m',
    '15m': '15m',
    '1H': '1h',
    '4H': '4h',
    '1D': '1d',
  };
  return mapping[timeframe] || '1h';
}

/**
 * Transform CoinMarketCap response to standard Candle format
 */
function transformToStandardCandles(data: any[]): Candle[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item: any) => ({
    timestamp: typeof item.timestamp === 'string'
      ? new Date(item.timestamp).getTime()
      : item.time_open || item.timestamp,
    open: parseFloat(item.open || item.quote?.USD?.open || 0),
    high: parseFloat(item.high || item.quote?.USD?.high || 0),
    low: parseFloat(item.low || item.quote?.USD?.low || 0),
    close: parseFloat(item.close || item.quote?.USD?.close || 0),
    volume: parseFloat(item.volume || item.quote?.USD?.volume_24h || 0),
  }));
}

/**
 * Fetch candles from CoinMarketCap via Edge Function
 */
export async function fetchCmcCandles(
  params: FetchCandlesParams
): Promise<Candle[]> {
  try {
    const cmcTimeframe = mapTimeframeToCmc(params.timeframe);
    
    const { data, error } = await supabase.functions.invoke('fetch-coinmarketcap-data', {
      body: {
        symbols: [params.symbol],
        timeframe: cmcTimeframe,
        limit: params.limit || 500,
      },
    });

    if (error) {
      throw new Error(`CoinMarketCap adapter error: ${error.message}`);
    }

    if (!data?.candles && !data?.quotes) {
      throw new Error('CoinMarketCap: Invalid response format');
    }

    return transformToStandardCandles(data.candles || data.quotes || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch CoinMarketCap candles: ${message}`);
  }
}
