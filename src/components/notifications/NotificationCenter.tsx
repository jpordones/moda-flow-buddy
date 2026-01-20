import { useState } from 'react';
import { Bell, X, CheckCheck, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    isLoading,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    dismiss,
    markAllAsRead,
    refresh,
  } = useNotifications();

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-header-foreground hover:bg-sidebar-accent"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs bg-danger text-danger-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Notificações</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('unread')}
            >
              Não lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            
            {unreadCount > 0 && (
              <>
                <Separator orientation="vertical" className="h-5" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'unread' 
                  ? 'Nenhuma notificação não lida' 
                  : 'Nenhuma notificação'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
                onDismiss={() => dismiss(notification.id)}
              />
            ))
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setIsOpen(false);
                // Could navigate to a full notifications page
              }}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
