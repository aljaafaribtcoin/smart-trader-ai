import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SyncStatus {
  id: string;
  data_type: string;
  symbol: string;
  timeframe?: string;
  last_sync_at: string;
  next_sync_at?: string;
  status: 'pending' | 'syncing' | 'success' | 'error';
  error_message?: string;
  retry_count: number;
  source: string;
  metadata?: any;
}

export const useSyncStatus = (dataType?: string, symbol?: string) => {
  return useQuery({
    queryKey: ['sync-status', dataType, symbol],
    queryFn: async () => {
      let query = supabase
        .from('data_sync_status')
        .select('*')
        .order('last_sync_at', { ascending: false });

      if (dataType) {
        query = query.eq('data_type', dataType);
      }

      if (symbol) {
        query = query.eq('symbol', symbol);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SyncStatus[];
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useSyncStatusForTimeframe = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: ['sync-status', 'candles', symbol, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_sync_status')
        .select('*')
        .eq('data_type', 'candles')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors
      return data as SyncStatus | null;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};
