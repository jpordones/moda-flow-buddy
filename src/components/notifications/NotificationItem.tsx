import { Check, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notifications';
import { notificationTypeConfig, categoryLabels } from '@/types/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDismiss: () => void;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  critical: AlertCircle,
};

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const config = notificationTypeConfig[notification.type];
  const Icon = iconMap[notification.type];

  const handleActionClick = () => {
    onMarkAsRead();
    if (notification.action_link) {
      navigate(notification.action_link);
    }
  };

  return (
    <div
      className={cn(
        'p-4 border-b last:border-b-0 transition-colors hover:bg-muted/50',
        !notification.is_read && 'bg-muted/30'
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 p-2 rounded-full',
            config.bgClass
          )}
        >
          <Icon className={cn('h-4 w-4', config.textClass)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground text-sm">
                {notification.title}
              </span>
              {!notification.is_read && (
                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {categoryLabels[notification.category]}
            </Badge>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(notification.created_at)}
            </span>

            <div className="flex items-center gap-2">
              {notification.action_text && notification.action_link && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary font-medium"
                  onClick={handleActionClick}
                >
                  {notification.action_text} →
                </Button>
              )}

              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onMarkAsRead}
                  title="Marcar como lida"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={onDismiss}
                title="Dispensar"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
