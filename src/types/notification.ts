export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'trade' | 'pattern' | 'price_alert';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  action_url?: string;
  metadata?: Record<string, any>;
}
