import { supabase } from '@/integrations/supabase/client';
import { Notification, CreateNotificationData } from '@/types/notification';

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('read', false);

    if (error) throw error;
  },

  // Delete a notification
  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Create a notification (for testing or system notifications)
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return notification as Notification;
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }
};
