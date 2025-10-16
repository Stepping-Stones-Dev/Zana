import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationBell } from './NotificationBell.tsx';
import { NotificationItem } from '../NotificationPanel/NotificationPanel.tsx';

// Helper to build dates (today, yesterday, earlier)
const now = new Date();
function daysAgo(n: number) { const d = new Date(now); d.setDate(d.getDate() - n); return d; }

const baseNotifications: NotificationItem[] = [
  {
    id: 'welcome',
    title: 'Welcome to Zana',
    message: 'Explore the new dashboard experience.',
    timestamp: daysAgo(0),
    priority: 'urgent',
    status: 'unread',
    category: 'system',
    actionUrl: '#dashboard'
  },
  {
    id: 'billing1',
    title: 'Invoice Ready', 
    message: 'Your September invoice is now available.',
    timestamp: daysAgo(0),
    priority: 'normal',
    status: 'read',
    category: 'billing',
    actionUrl: '#invoice'
  },
  {
    id: 'security1',
    title: 'New Login from Chrome',
    message: 'We detected a new sign‑in from Chrome on Windows.',
    timestamp: daysAgo(1),
    priority: 'high',
    status: 'unread',
    category: 'security',
    actionUrl: '#activity'
  },
  {
    id: 'message1',
    title: 'Team Mention',
    message: 'Alex mentioned you in #architecture: "Let\'s finalize the SLA draft by tomorrow."',
    timestamp: daysAgo(2),
    priority: 'normal',
    status: 'read',
    category: 'messages',
    actionUrl: '#messages'
  },
  // Additional notifications for variety
  { 
    id: 'uptime', 
    title: 'All Systems Operational', 
    message: 'No incidents reported in the last 24h.', 
    timestamp: daysAgo(2), 
    priority: 'low',
    status: 'read',
    category: 'system'
  },
  { 
    id: 'uptime2', 
    title: 'Planned Upgrade Window', 
    message: 'Minor latency expected during maintenance.', 
    timestamp: daysAgo(2), 
    priority: 'normal',
    status: 'unread',
    category: 'system'
  },
  { 
    id: 'uptime3', 
    title: 'Edge Cluster Sync Complete', 
    message: 'All replicas healthy and synchronized.', 
    timestamp: daysAgo(3), 
    priority: 'low',
    status: 'read',
    category: 'system'
  }
];

const meta: Meta<typeof NotificationBell> = {
  title: 'Dashboard/NotificationBell',
  component: NotificationBell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A notification bell icon that displays an unread count badge and opens a notification panel in a popover when clicked. The panel shows notifications grouped by time (urgent, today, yesterday, earlier) with priority indicators and slide-out management actions.'
      }
    }
  },
  args: {
    notifications: baseNotifications,
    analyticsId: 'storybook.notifications'
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 20, max: 60, step: 4 },
      description: 'Size of the bell icon in pixels'
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'auto'],
      description: 'Popover alignment relative to the trigger'
    },
    unreadCount: {
      control: { type: 'number', min: 0, max: 999 },
      description: 'Override the calculated unread count'
    }
  }
};
export default meta;

type Story = StoryObj<typeof NotificationBell>;

export const Default: Story = {};

export const WithManyUnread: Story = {
  args: {
    notifications: baseNotifications.map(n => ({ ...n, status: 'unread' as const }))
  }
};

export const AutoAlignment: Story = {
  args: {
    align: 'auto'
  }
};

export const WithPriorityMix: Story = {
  args: {
    notifications: [
      ...baseNotifications.slice(0, 2),
      {
        id: 'urgent1',
        title: 'Critical System Alert',
        message: 'Database connection failing. Immediate action required.',
        timestamp: daysAgo(0),
        priority: 'urgent' as const,
        status: 'unread' as const,
        category: 'system'
      },
      {
        id: 'high1', 
        title: 'Security Warning',
        message: 'Multiple failed login attempts detected.',
        timestamp: daysAgo(0),
        priority: 'high' as const,
        status: 'unread' as const,
        category: 'security'
      }
    ]
  }
};

export const WithManagementActions: Story = {
  args: {
    managementConfig: {
      showArchive: true,
      showDelete: true,
      showMarkAsRead: true,
      showOpen: true
    },
    onNotificationArchive: (id: string) => console.log('Archive notification:', id),
    onNotificationDelete: (id: string) => console.log('Delete notification:', id),
    onNotificationMarkAsRead: (id: string) => console.log('Mark as read:', id),
    onNotificationClick: (notification) => console.log('Open notification:', notification)
  }
};

export const EmptyState: Story = {
  args: {
    notifications: [],
    emptyStateMessage: '🎉 Nothing new right now'
  }
};

export const CustomUnreadCountOverride: Story = {
  args: {
    unreadCount: 42
  }
};

export const WithCustomHeight: Story = {
  args: {
    maxHeight: 300,
    notifications: [...baseNotifications, ...baseNotifications.map(n => ({ ...n, id: n.id + '_dup', timestamp: daysAgo(1) }))]
  }
};

export const UrgentNotifications: Story = {
  args: {
    notifications: baseNotifications.map(n => ({ 
      ...n, 
      priority: n.id === 'welcome' || n.id === 'security1' ? 'urgent' as const : n.priority,
      status: 'unread' as const
    }))
  }
};

export const WithMarkAllRead: Story = {
  args: {
    notifications: baseNotifications.map(n => ({ ...n, status: 'unread' as const })),
    onMarkAllAsRead: () => console.log('Mark all as read clicked')
  }
};
