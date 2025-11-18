import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/api';
import { ChatMessage, AIResponse } from '@/types';
import { CACHE_TIMES } from '@/services/constants';

/**
 * Hook to fetch chat messages
 */
export const useChatMessages = (conversationId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      // For now, use mock data
      return chatService.getMockMessages();
      
      // When API is ready:
      // if (!conversationId) return [];
      // const response = await chatService.getMessages(conversationId);
      // if (response.error) throw new Error(response.error.message);
      // return response.data || [];
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
    }) => {
      // For now, use mock response
      const response = await chatService.getMockAIResponse(message);
      return response;
      
      // When API is ready:
      // const response = await chatService.sendMessage(userId, message, conversationId);
      // if (response.error) throw new Error(response.error.message);
      // return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate messages query to refetch
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
 * Hook to fetch conversations
 */
export const useConversations = (userId: string) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const response = await chatService.getConversations(userId);
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    staleTime: CACHE_TIMES.LONG,
  });
};
