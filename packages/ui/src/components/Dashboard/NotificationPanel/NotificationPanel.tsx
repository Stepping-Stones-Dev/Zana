import React, { useState, useMemo, useCallback } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody,
  Badge,
  Divider
} from '@heroui/react';
import { 
  BellIcon,
  ArchiveBoxIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { cx } from '../../../internal/internal';
import GroupingList from '../../Shared/List/GroupList/GroupingList';
import type { ListItem, GroupingConfig, BadgeMetric } from '../../Shared/List/types';
import type { SlideOutAction } from '../../Shared/List/SlideOut';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  priority: NotificationPriority;
  status: NotificationStatus;
  category?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationManagementConfig {
  showArchive?: boolean;
  showDelete?: boolean;
  showMarkAsRead?: boolean;
  showOpen?: boolean;
}

export interface NotificationPanelProps {
  notifications: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onNotificationArchive?: (notificationId: string) => void;
  onNotificationDelete?: (notificationId: string) => void;
  onNotificationMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  managementConfig?: NotificationManagementConfig;
  className?: string;
  maxHeight?: string | number;
  showUnreadCount?: boolean;
  emptyStateMessage?: string;
  analyticsId?: string;
}



const DEFAULT_MANAGEMENT_CONFIG: NotificationManagementConfig = {
  showArchive: true,
  showDelete: true,
  showMarkAsRead: true,
  showOpen: true,
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications = [],
  onNotificationClick,
  onNotificationArchive,
  onNotificationDelete,
  onNotificationMarkAsRead,
  onMarkAllAsRead,
  managementConfig = DEFAULT_MANAGEMENT_CONFIG,
  className,
  maxHeight = 500,
  showUnreadCount = true,
  emptyStateMessage = 'No notifications',
  analyticsId = 'notifications.panel',
}) => {
  // Filter out archived notifications for display
  const activeNotifications = useMemo(() => 
    notifications.filter(n => n.status !== 'archived'), 
    [notifications]
  );

  // Count unread notifications
  const unreadCount = useMemo(() => 
    activeNotifications.filter(n => n.status === 'unread').length, 
    [activeNotifications]
  );

  // Convert NotificationItem[] to ListItem[]
  const listItems: ListItem[] = useMemo(() => 
    activeNotifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp,
      priority: notification.priority,
      status: notification.status,
      category: notification.category,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
    })), 
    [activeNotifications]
  );

  // Configure grouping behavior to match original design
  const groupingConfig: GroupingConfig = useMemo(() => ({
    groupByTime: true,
    showUnreadFirst: true,
    groupTitles: {
      urgent: 'Urgent',
      today: 'Today',
      yesterday: 'Yesterday', 
      older: 'Earlier'
    },
    customGrouping: (items: ListItem[]) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const groups: Record<string, ListItem[]> = {
        urgent: [],
        today: [],
        yesterday: [],
        older: [],
      };

      items.forEach(item => {
        // Float urgent unread notifications to the top
        if (item.priority === 'urgent' && item.status === 'unread') {
          groups.urgent.push(item);
          return;
        }

        // Group by time period
        if (!item.timestamp || !(item.timestamp instanceof Date) || isNaN(item.timestamp.getTime())) {
          groups.older.push(item);
          return;
        }

        const itemDate = new Date(
          item.timestamp.getFullYear(),
          item.timestamp.getMonth(),
          item.timestamp.getDate()
        );

        if (itemDate.getTime() === today.getTime()) {
          groups.today.push(item);
        } else if (itemDate.getTime() === yesterday.getTime()) {
          groups.yesterday.push(item);
        } else {
          groups.older.push(item);
        }
      });

      return groups;
    },
    groupOrder: ['urgent', 'today', 'yesterday', 'older'],
    badgeMetrics: [
      {
        id: 'unread',
        label: 'unread',
        color: 'primary',
        variant: 'solid',
        condition: (item) => item.status === 'unread',
        priority: 3
      },
      {
        id: 'urgent',
        label: 'urgent', 
        color: 'danger',
        variant: 'solid',
        condition: (item) => item.priority === 'urgent',
        priority: 2
      },
      {
        id: 'high',
        label: 'high',
        color: 'warning',
        variant: 'flat',
        condition: (item) => item.priority === 'high',
        priority: 1
      }
    ],
    showTotalCount: true
  }), []);

  // Configure SlideOut actions based on management config
  const slideOutActions = useMemo((): SlideOutAction[] => {
    const actions: SlideOutAction[] = [];
    
    if (managementConfig.showMarkAsRead) {
      actions.push({
        id: 'markAsRead',
        label: 'Mark as Read',
        icon: <BellIcon className="w-4 h-4" />,
        color: 'primary',
        variant: 'solid',
        onClick: () => {}, // Will be handled by onItemAction
        analyticsId: `${analyticsId}.slideAction.markAsRead`
      });
    }

    if (managementConfig.showArchive) {
      actions.push({
        id: 'archive', 
        label: 'Archive',
        icon: <ArchiveBoxIcon className="w-4 h-4" />,
        color: 'warning',
        variant: 'solid',
        onClick: () => {}, // Will be handled by onItemAction
        analyticsId: `${analyticsId}.slideAction.archive`
      });
    }

    if (managementConfig.showDelete) {
      actions.push({
        id: 'delete',
        label: 'Delete', 
        icon: <TrashIcon className="w-4 h-4" />,
        color: 'danger',
        variant: 'solid',
        onClick: () => {}, // Will be handled by onItemAction
        analyticsId: `${analyticsId}.slideAction.delete`
      });
    }

    return actions;
  }, [managementConfig, analyticsId]);

  const handleItemAction = useCallback((action: string, itemId: string, item?: ListItem) => {
    switch (action) {
      case 'markAsRead':
        onNotificationMarkAsRead?.(itemId);
        break;
      case 'archive':
        onNotificationArchive?.(itemId);
        break;
      case 'delete':
        onNotificationDelete?.(itemId);
        break;
    }
  }, [onNotificationMarkAsRead, onNotificationArchive, onNotificationDelete]);

  const handleItemClick = useCallback((item: ListItem) => {
    // Convert back to NotificationItem and call the original handler
    const notificationItem: NotificationItem = {
      id: item.id,
      title: item.title,
      message: item.message || '',
      timestamp: item.timestamp,
      priority: item.priority,
      status: item.status,
      category: item.category,
      actionUrl: item.actionUrl,
      metadata: item.metadata,
    };
    onNotificationClick?.(notificationItem);
  }, [onNotificationClick]);

  const handleMarkAllAsRead = useCallback(() => {
    onMarkAllAsRead?.();
  }, [onMarkAllAsRead]);





  return (
    <Card className={cx('w-96 max-w-[90vw]', className)}>
      {/* Header */}
      <CardHeader className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {showUnreadCount && unreadCount > 0 && (
            <Badge variant="flat" color="primary">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && managementConfig.showMarkAsRead && (
          <Button
            size="sm"
            variant="light"
            color="primary"
            onPress={handleMarkAllAsRead}
            className="text-xs"
            data-analytics-id={`${analyticsId}.markAllRead`}
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>

      <Divider />

      {/* Body with GroupingList */}
      <CardBody 
        className="p-0"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <GroupingList
          items={listItems}
          onItemClick={handleItemClick}
          onItemAction={handleItemAction}
          groupingConfig={groupingConfig}
          itemActions={slideOutActions}
          showItemActions={true}
          emptyStateMessage={emptyStateMessage}
          analyticsId={analyticsId}
          className="h-full"
        />
      </CardBody>

      {/* Footer */}
      {activeNotifications.length > 0 && (
        <>
          <Divider />
          <div className="px-4 py-3 text-center">
            <Button
              variant="light"
              size="sm"
              className="text-xs text-foreground-500"
              data-analytics-id={`${analyticsId}.viewAll`}
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default NotificationPanel;
