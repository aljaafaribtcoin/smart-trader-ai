import { apiClient } from './apiClient';
import { ChatMessage, Conversation, AIResponse, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '../constants';

export const chatService = {
  /**
   * Send a message to AI assistant
   */
  async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<ApiResponse<AIResponse>> {
    return apiClient.post<AIResponse>(API_ENDPOINTS.CHAT_SEND, {
      userId,
      message,
      conversationId,
    });
  },

  /**
   * Get chat messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 50
  ): Promise<ApiResponse<ChatMessage[]>> {
    return apiClient.get<ChatMessage[]>(`${API_ENDPOINTS.CHAT_MESSAGES}/${conversationId}`, {
      limit,
    });
  },

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    return apiClient.get<Conversation[]>(`${API_ENDPOINTS.CHAT_CONVERSATIONS}/${userId}`);
  },

  /**
   * Create a new conversation
   */
  async createConversation(userId: string, title: string): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>(API_ENDPOINTS.CHAT_CONVERSATIONS, {
      userId,
      title,
    });
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${API_ENDPOINTS.CHAT_CONVERSATIONS}/${conversationId}`);
  },
};