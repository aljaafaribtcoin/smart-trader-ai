// Chat Types
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  conversationId?: string;
  userId: string;
  role: MessageRole;
  content: string;
  status?: MessageStatus;
  metadata?: MessageMetadata;
  timestamp: Date;
  createdAt: Date;
}

export interface MessageMetadata {
  tradeId?: string;
  symbol?: string;
  timeframe?: string;
  analysisId?: string;
  attachments?: Attachment[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Attachment {
  type: 'image' | 'chart' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  preview: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAssistantContext {
  currentSymbol?: string;
  currentTimeframe?: string;
  recentTrades?: string[];
  userPreferences?: UserPreferences;
  conversationHistory: ChatMessage[];
}

export interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  preferredTimeframes: string[];
  tradingStyle: 'scalping' | 'day' | 'swing' | 'position';
  favoriteSymbols: string[];
  notificationsEnabled: boolean;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  relatedTrades?: string[];
  nextSteps?: string[];
}
