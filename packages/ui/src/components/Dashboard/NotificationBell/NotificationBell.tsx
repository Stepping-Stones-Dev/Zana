import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button, Badge } from '@heroui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { cx } from '../../../internal/internal';
import { NotificationPanel, type NotificationPanelProps, type NotificationItem } from '../NotificationPanel/NotificationPanel';

export interface NotificationBellProps extends Pick<NotificationPanelProps, 'notifications' | 'onNotificationClick' | 'onNotificationArchive' | 'onNotificationDelete' | 'onNotificationMarkAsRead' | 'onMarkAllAsRead' | 'managementConfig' | 'maxHeight' | 'showUnreadCount' | 'emptyStateMessage'> {
  size?: number; // diameter of bell button
  ariaLabel?: string;
  className?: string;
  unreadCount?: number; // if provided overrides derived count
  deriveUnreadCount?: (notifications: NotificationPanelProps['notifications']) => number;
  align?: 'start' | 'center' | 'end' | 'auto';
  autoEdgeThreshold?: number;
  analyticsId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onNotificationClick,
  onNotificationArchive,
  onNotificationDelete,
  onNotificationMarkAsRead,
  onMarkAllAsRead,
  managementConfig,
  maxHeight,
  showUnreadCount = true,
  emptyStateMessage,
  size = 40,
  ariaLabel = 'Notifications',
  className,
  unreadCount,
  deriveUnreadCount = (list: NotificationItem[]) => list.filter(n => n.status === 'unread').length,
  align = 'end',
  autoEdgeThreshold = 160,
  analyticsId = 'notifications'
}) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'bottom-start' | 'bottom-end'>(align === 'start' ? 'bottom-start' : align === 'center' ? 'bottom' : 'bottom-end');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const count = unreadCount ?? deriveUnreadCount(notifications);

  useLayoutEffect(() => {
    if (!open || align !== 'auto' || typeof window === 'undefined') return;
    const el = triggerRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    if (vw - rect.right < autoEdgeThreshold) setPlacement('bottom-end');
    else if (rect.left < autoEdgeThreshold) setPlacement('bottom-start');
    else setPlacement('bottom');
  }, [open, align, autoEdgeThreshold]);

  useLayoutEffect(() => {
    if (align === 'auto') return; setPlacement(align === 'start' ? 'bottom-start' : align === 'center' ? 'bottom' : 'bottom-end');
  }, [align]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <Popover isOpen={open} onOpenChange={setOpen} placement={placement}>
      <PopoverTrigger>
        <Button
          ref={triggerRef}
          isIconOnly
          variant="light"
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cx(
            "relative transition-colors overflow-visible hover:bg-default-100 dark:hover:bg-default-50",
            className
          )}
          style={{ minHeight: size, minWidth: size, padding: 0 }}
          data-analytics-id={`${analyticsId}.trigger`}
          data-open={open || undefined}
        >
          {count > 0 ? (
            <Badge
              content={count > 99 ? '99+' : String(count)}
              color="danger"
              size="sm"
              variant="solid"
              aria-label={`${count} unread notifications`}
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs text-white"
              data-analytics-id={`${analyticsId}.unread-count`}
              data-unread-count={count}
            >
              <BellIcon 
                width={size} 
                height={size}
                className="text-default-600 dark:text-default-400 transition-colors"
              />
            </Badge>
          ) : (
            <BellIcon 
              width={size} 
              height={size}
              className="text-default-600 dark:text-default-400 transition-colors"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ minWidth: 360, maxWidth: 420 }}>
        <NotificationPanel
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onNotificationArchive={onNotificationArchive}
          onNotificationDelete={onNotificationDelete}
          onNotificationMarkAsRead={onNotificationMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          managementConfig={managementConfig}
          maxHeight={maxHeight}
          showUnreadCount={showUnreadCount}
          emptyStateMessage={emptyStateMessage}
          analyticsId={analyticsId}
        />
      </PopoverContent>
    </Popover>
  );
};

NotificationBell.displayName = 'NotificationBell';
export default NotificationBell;
