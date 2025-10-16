import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationPanel } from './NotificationPanel';
import type { NotificationItem } from './NotificationPanel';

// Sample notification data for stories
const sampleNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Security Alert - Immediate Action Required',
    message: 'Suspicious login attempt detected from an unknown device in Russia. Please review your account security.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    priority: 'urgent',
    status: 'unread',
    category: 'Security',
    actionUrl: '/security/review',
  },
  {
    id: '2',
    title: 'Critical System Breach Detected',
    message: 'Multiple failed authentication attempts. Immediate security review required.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    priority: 'urgent',
    status: 'unread',
    category: 'Security',
  },
  {
    id: '3',
    title: 'Database Connection Lost',
    message: 'Primary database connection has been lost. System failover in progress.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    priority: 'urgent',
    status: 'unread',
    category: 'System',
  },
  {
    id: '4',
    title: 'Payment Processing Failed',
    message: 'Critical payment gateway error affecting all transactions.',
    timestamp: new Date(Date.now() - 75 * 60 * 1000), // 75 minutes ago
    priority: 'urgent',
    status: 'unread',
    category: 'Payment',
  },
  {
    id: '5',
    title: 'API Rate Limit Exceeded',
    message: 'Service API has exceeded rate limits. Performance degradation expected.',
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
    priority: 'urgent',
    status: 'unread',
    category: 'API',
  },
  {
    id: '6',
    title: 'Critical System Update Available',
    message: 'Important security patches are available for your system. Update recommended within 24 hours.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago  
    priority: 'high',
    status: 'unread',
    category: 'System',
  },
  {
    id: '7',
    title: 'New Feature: Advanced Analytics',
    message: 'Discover insights with our new advanced analytics dashboard. Click to explore the new features.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    priority: 'normal',
    status: 'unread',
    category: 'Product Updates',
  },
  {
    id: '8',
    title: 'Weekly Report Ready',
    message: 'Your weekly performance report has been generated and is ready for review.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    priority: 'low',
    status: 'read',
    category: 'Reports',
  },
  {
    id: '9',
    title: 'Data Export Completed',
    message: 'Your requested data export has finished processing. The file is ready for download.',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // Yesterday
    priority: 'normal',
    status: 'unread',
    category: 'Data Processing',
  },
  {
    id: '10',
    title: 'Team Meeting Reminder',
    message: 'Don\'t forget about the quarterly team meeting scheduled for tomorrow at 2 PM.',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), // Yesterday
    priority: 'normal',
    status: 'read',
    category: 'Calendar',
  },
  {
    id: '11',
    title: 'Maintenance Window Scheduled',
    message: 'Scheduled maintenance will occur this weekend from 2-4 AM. Some features may be temporarily unavailable.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    priority: 'normal',
    status: 'unread',
    category: 'System Maintenance',
  },
];

const meta: Meta<typeof NotificationPanel> = {
  title: 'Dashboard/NotificationPanel',
  component: NotificationPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive notification panel with time-based clustering, priority indicators, and configurable management actions. Features urgent notifications floating to the top, grouped time periods, and full HeroUI component integration.'
      }
    },
  },
  tags: ['autodocs'],
  argTypes: {
    notifications: {
      description: 'Array of notification items to display',
      control: { type: 'object' },
    },
    showUnreadCount: {
      description: 'Whether to show unread count badge on trigger button',
      control: { type: 'boolean' },
    },
    maxHeight: {
      description: 'Maximum height of the notification panel body',
      control: { type: 'text' },
    },
    emptyStateMessage: {
      description: 'Message to show when there are no notifications',
      control: { type: 'text' },
    },
    managementConfig: {
      description: 'Configuration for notification management actions',
      control: { type: 'object' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationPanel>;

export const Default: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: true,
    onNotificationClick: (notification) => {
      console.log('Clicked notification:', notification);
    },
    onNotificationArchive: (id) => {
      console.log('Archive notification:', id);
    },
    onNotificationDelete: (id) => {
      console.log('Delete notification:', id);
    },
    onNotificationMarkAsRead: (id) => {
      console.log('Mark as read:', id);
    },
    onMarkAllAsRead: () => {
      console.log('Mark all as read');
    },
  },
};

export const EmptyState: Story = {
  args: {
    notifications: [],
    showUnreadCount: true,
    emptyStateMessage: 'No notifications to display',
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    notifications: [],
    showUnreadCount: true,
    emptyStateMessage: "🎉 You're all caught up! No new notifications.",
  },
};

export const UrgentOnly: Story = {
  args: {
    notifications: sampleNotifications.filter(n => n.priority === 'urgent'),
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all urgent notifications without title header. Notice how they have a distinct red background and no section title.'
      }
    }
  }
};

export const UrgentTruncation: Story = {
  args: {
    notifications: sampleNotifications.filter(n => n.priority === 'urgent'),
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates urgent notification truncation. Shows only the first 3 urgent notifications with a "See more" button to expand.'
      }
    }
  }
};

export const MixedPriorities: Story = {
  args: {
    notifications: [
      sampleNotifications[0], // urgent
      sampleNotifications[5], // high 
      sampleNotifications[6], // normal
      sampleNotifications[7], // low
    ],
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcases different priority levels with distinct colors: urgent (red), high (orange), normal (blue), and low (gray). Notice the colored borders, badges, and background highlighting.'
      }
    }
  }
};

export const PriorityShowcase: Story = {
  args: {
    notifications: [
      {
        id: 'urgent-demo',
        title: 'Urgent Priority Example',
        message: 'This notification has urgent priority with red coloring and special border.',
        timestamp: new Date(),
        priority: 'urgent',
        status: 'unread',
        category: 'Demo',
      },
      {
        id: 'high-demo',
        title: 'High Priority Example',
        message: 'This notification has high priority with warning/orange coloring.',
        timestamp: new Date(),
        priority: 'high',
        status: 'unread',
        category: 'Demo',
      },
      {
        id: 'normal-demo',
        title: 'Normal Priority Example',
        message: 'This notification has normal priority with primary/blue coloring.',
        timestamp: new Date(),
        priority: 'normal',
        status: 'unread',
        category: 'Demo',
      },
      {
        id: 'low-demo',
        title: 'Low Priority Example',
        message: 'This notification has low priority with default/gray coloring.',
        timestamp: new Date(),
        priority: 'low',
        status: 'unread',
        category: 'Demo',
      },
    ],
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dedicated showcase of all priority levels and their visual treatments. Each notification demonstrates the priority-specific coloring for borders, backgrounds, badges, and chips.'
      }
    }
  }
};

export const RestrictedManagement: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: true,
    managementConfig: {
      showArchive: false,
      showDelete: false,
      showMarkAsRead: true,
      showOpen: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Notification panel with restricted management actions. Archive and delete are disabled.'
      }
    }
  }
};

export const ReadOnlyMode: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: true,
    managementConfig: {
      showArchive: false,
      showDelete: false,
      showMarkAsRead: false,
      showOpen: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only notification panel with only open action available.'
      }
    }
  }
};

export const ClosedState: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Notification panel in closed state, showing only the trigger button with unread count badge.'
      }
    }
  }
};

export const NoUnreadCount: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Notification panel without unread count badge on the trigger button.'
      }
    }
  }
};

export const AllRead: Story = {
  args: {
    notifications: sampleNotifications.map(n => ({ ...n, status: 'read' as const })),
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Notification panel where all notifications are marked as read. No urgent section or unread indicators.'
      }
    }
  }
};

export const LimitedHeight: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: true,
    maxHeight: 300,
  },
  parameters: {
    docs: {
      description: {
        story: 'Notification panel with limited height, demonstrating scrollable content.'
      }
    }
  }
};

export const SlideOutDemo: Story = {
  args: {
    notifications: sampleNotifications.slice(0, 4), // Use fewer notifications for cleaner demo
    showUnreadCount: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the slide-out functionality. Click the menu button (⋮) on any notification to slide it left and reveal management actions: mark as read (blue), archive (orange), and delete (red).'
      }
    }
  }
};

export const InteractiveDemo: Story = {
  args: {
    notifications: sampleNotifications,
    showUnreadCount: true,
  },
  render: (args) => {
    const [notifications, setNotifications] = React.useState(args.notifications || []);

    const handleMarkAsRead = (id: string) => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
      );
    };

    const handleArchive = (id: string) => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'archived' as const } : n)
      );
    };

    const handleDelete = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAllAsRead = () => {
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
    };

    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className="text-sm text-foreground-600">
          Try all notification features: click to open notifications, use the menu (⋮) to slide and reveal management actions!
        </p>
        <NotificationPanel
          {...args}
          notifications={notifications}
          onNotificationMarkAsRead={handleMarkAsRead}
          onNotificationArchive={handleArchive}
          onNotificationDelete={handleDelete}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={(notification) => {
            console.log('Clicked:', notification.title);
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo where you can test all notification management features through the streamlined slide-out interface. Actions will update the notification state in real-time.'
      }
    }
  }
};
