import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, AIResponse } from '@/types';
import { CACHE_TIMES } from '@/services/constants';

/**
 * Hook to fetch chat messages from Supabase
 */
export const useChatMessages = (conversationId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.SHORT,
    enabled: enabled && !!conversationId,
  });
};

/**
 * Hook to send a chat message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      message,
      conversationId,
    }: {
      userId: string;
      message: string;
      conversationId?: string;
    }): Promise<AIResponse> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert user message
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          role: 'user',
          content: message
        });

      if (error) throw error;

      // Simulate AI response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        message: 'تحليل الذكاء الاصطناعي قيد التطوير. سيتم إضافة الردود التلقائية قريباً.',
        suggestions: [],
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['chat-messages', variables.conversationId] 
      });
    },
    onError: (error: Error) => {
      console.error('Failed to send message:', error);
    },
  });
};

/**
 * Hook to fetch conversations from Supabase
 */
export const useConversations = (userId: string) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
  });
};