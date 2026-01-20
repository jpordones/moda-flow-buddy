import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  markNotificationAsRead, 
  dismissNotification, 
  markAllAsRead,
  checkAndGenerateNotifications 
} from '@/services/notificationService';
import type { Notification, NotificationCategory } from '@/types/notifications';

type FilterType = 'all' | 'unread';

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('unread');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');

  const teamId = profile?.current_team_id;

  const fetchNotifications = useCallback(async () => {
    if (!teamId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from('notifications') as any)
        .select('*')
        .eq('team_id', teamId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, filter, categoryFilter]);

  // Initial fetch and refresh every 30 seconds
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Generate contextual notifications on mount
  useEffect(() => {
    if (teamId) {
      checkAndGenerateNotifications(teamId);
    }
  }, [teamId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    }
  };

  const handleDismiss = async (notificationId: string) => {
    const success = await dismissNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!teamId) return;
    
    const success = await markAllAsRead(teamId);
    if (success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    }
  };

  const refreshNotifications = useCallback(async () => {
    if (teamId) {
      await checkAndGenerateNotifications(teamId);
      await fetchNotifications();
    }
  }, [teamId, fetchNotifications]);

  return {
    notifications,
    isLoading,
    unreadCount,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    markAsRead: handleMarkAsRead,
    dismiss: handleDismiss,
    markAllAsRead: handleMarkAllAsRead,
    refresh: refreshNotifications,
  };
}
