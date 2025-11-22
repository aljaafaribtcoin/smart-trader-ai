import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/services/constants';
import { useAuth } from '../useAuth';

/**
 * Hook to fetch patterns from Supabase
 */
export const usePatterns = (symbol?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['patterns', user?.id, symbol],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('detected_at', { ascending: false });

      if (symbol) {
        query = query.eq('symbol', symbol);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!user,
  });
};
