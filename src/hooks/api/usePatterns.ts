import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/services/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../useAuth';

export interface Pattern {
  id: string;
  symbol: string;
  timeframe: string;
  pattern_type: 'reversal' | 'continuation';
  pattern_name: string;
  confidence: number;
  detected_at: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'invalidated';
  description?: string;
  target_price?: number;
  stop_loss?: number;
  user_id: string;
  created_at: string;
}

interface PatternsFilters {
  status?: string;
  patternType?: string;
  symbol?: string;
}

/**
 * Hook to fetch all patterns
 */
export const usePatterns = (filters?: PatternsFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patterns', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.patternType) {
        query = query.eq('pattern_type', filters.patternType);
      }

      if (filters?.symbol) {
        query = query.eq('symbol', filters.symbol);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Pattern[] || [];
    },
    staleTime: CACHE_TIMES.SHORT,
    enabled: !!user,
  });
};

/**
 * Hook to fetch active patterns
 */
export const useActivePatterns = () => {
  return usePatterns({ status: 'active' });
};

/**
 * Hook to trigger pattern detection manually
 */
export const useDetectPatterns = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ symbols, timeframes }: { symbols: string[]; timeframes: string[] }) => {
      const { data, error } = await supabase.functions.invoke('detect-patterns', {
        body: { symbols, timeframes }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      
      toast({
        title: 'تم كشف الأنماط',
        description: `تم اكتشاف ${data?.patternsDetected || 0} نمط جديد`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل كشف الأنماط',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update pattern status
 */
export const useUpdatePatternStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patternId, status }: { patternId: string; status: string }) => {
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('patterns')
        .update(updates)
        .eq('id', patternId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      
      toast({
        title: 'تم تحديث النمط',
        description: 'تم تحديث حالة النمط بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل التحديث',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete a pattern
 */
export const useDeletePattern = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patternId: string) => {
      const { error } = await supabase
        .from('patterns')
        .delete()
        .eq('id', patternId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف النمط بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل الحذف',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
