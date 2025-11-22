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
 * Transform Binance response to standard Candle format
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
 * Retry function with exponential backoff
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retry attempts failed');
}

/**
 * Fetch candles from Binance via Edge Function
 */
export async function fetchBinanceCandles(
  params: FetchCandlesParams
): Promise<Candle[]> {
  try {
    const binanceTimeframe = mapTimeframeToBinance(params.timeframe);
    
    const result = await fetchWithRetry(async () => {
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
        throw new Error(`Binance edge function error: ${error.message}`);
      }

      // Check if the response was successful
      if (!data?.success) {
        throw new Error(data?.error || 'Edge function returned unsuccessful response');
      }

      // Verify candles exist in response
      if (!data?.candles || !Array.isArray(data.candles)) {
        throw new Error('No candles data returned from edge function');
      }

      return data;
    });

    const candles = transformToStandardCandles(result.candles);
    
    if (candles.length === 0) {
      throw new Error('No candles after transformation');
    }

    console.log(`[BinanceAdapter] Successfully fetched ${candles.length} candles for ${params.symbol} ${params.timeframe}`);
    return candles;
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const detailedError = `Failed to fetch Binance candles: ${message} (Symbol: ${params.symbol}, Timeframe: ${params.timeframe})`;
    console.error(`[BinanceAdapter] ${detailedError}`);
    throw new Error(detailedError);
  }
}
