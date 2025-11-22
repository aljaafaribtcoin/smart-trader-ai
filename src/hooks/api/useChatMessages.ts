import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/services/constants';
import { useAuth } from '../useAuth';

// Note: Chat messages are now handled in the AIChat component directly with streaming

// Removed - now handled in AIChat component

/**
 * Hook to fetch conversations from Supabase
 */
export const useConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.LONG,
    enabled: !!user,
  });
};