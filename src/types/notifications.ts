export type NotificationType = 'info' | 'success' | 'warning' | 'critical';
export type NotificationCategory = 'stock' | 'financial' | 'product' | 'system' | 'plan';

export interface Notification {
  id: string;
  team_id: string;
  user_id?: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  action_text?: string | null;
  action_link?: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  extra_data?: Record<string, unknown> | null;
  created_at: string;
  read_at?: string | null;
}

export interface CreateNotificationParams {
  teamId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  extraData?: Record<string, unknown>;
}

export const notificationTypeConfig = {
  info: {
    color: 'blue',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    color: 'green',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    textClass: 'text-green-600 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  warning: {
    color: 'yellow',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    textClass: 'text-yellow-600 dark:text-yellow-400',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
  },
  critical: {
    color: 'red',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
  },
};

export const categoryLabels: Record<NotificationCategory, string> = {
  stock: 'Estoque',
  financial: 'Financeiro',
  product: 'Produto',
  system: 'Sistema',
  plan: 'Plano',
};
