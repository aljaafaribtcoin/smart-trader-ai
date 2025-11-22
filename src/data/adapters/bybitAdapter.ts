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
 * Fetch candles from Bybit via Edge Function
 */
export async function fetchBybitCandles(
  params: FetchCandlesParams
): Promise<Candle[]> {
  try {
    const bybitTimeframe = mapTimeframeToBybit(params.timeframe);
    
    const result = await fetchWithRetry(async () => {
      const { data, error } = await supabase.functions.invoke('fetch-bybit-candles', {
        body: {
          symbol: params.symbol,
          timeframe: bybitTimeframe,
          limit: params.limit || 500,
        },
      });

      if (error) {
        throw new Error(`Bybit edge function error: ${error.message}`);
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

    console.log(`[BybitAdapter] Successfully fetched ${candles.length} candles for ${params.symbol} ${params.timeframe}`);
    return candles;
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const detailedError = `Failed to fetch Bybit candles: ${message} (Symbol: ${params.symbol}, Timeframe: ${params.timeframe})`;
    console.error(`[BybitAdapter] ${detailedError}`);
    throw new Error(detailedError);
  }
}
