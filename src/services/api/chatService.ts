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

  /**
   * Mock function - returns hardcoded messages for development
   */
  getMockMessages(): ChatMessage[] {
    return [
      {
        id: '1',
        userId: 'user-1',
        role: 'assistant',
        content:
          'تحليلي الحالي لـ AVAXUSDT: السعر في ارتداد قصير من منطقة طلب قوية. يمكنك استغلال الحركة قصير المدى طالما لم يغلق اليومي أسفل 14.10.',
        status: 'sent',
        timestamp: new Date(Date.now() - 120000),
        createdAt: new Date(Date.now() - 120000),
      },
      {
        id: '2',
        userId: 'user-1',
        role: 'user',
        content: 'هل تنصحني بالدخول الآن أم انتظار شمعة تأكيد إضافية على 15 دقيقة؟',
        status: 'sent',
        timestamp: new Date(Date.now() - 60000),
        createdAt: new Date(Date.now() - 60000),
      },
    ];
  },

  /**
   * Mock function - simulates AI response
   */
  async getMockAIResponse(message: string): Promise<AIResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses = [
      {
        message:
          'أنصح بانتظار شمعة تأكيد فوق 14.55 على فريم 15 دقيقة. هذا سيعطيك تأكيد أقوى للدخول ويقلل من المخاطرة.',
        suggestions: [
          'راقب حجم التداول على شمعة الكسر',
          'ضع وقف الخسارة تحت 14.18',
          'استهدف 14.90 كهدف أول',
        ],
      },
      {
        message:
          'AVAXUSDT يظهر إشارات إيجابية على الفريمات القصيرة. RSI خرج من منطقة التشبع البيعي والفوليوم يتزايد.',
        suggestions: ['تحقق من مستوى 14.40', 'راقب MACD للتأكيد'],
      },
      {
        message:
          'بناءً على تحليل الذكاء الاصطناعي، درجة الثقة للصفقة 84%. الإعداد جيد للمتداول قصير المدى.',
        suggestions: ['التزم بإدارة المخاطر', 'لا تتجاوز 2% من رأس المال'],
      },
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  },
};
