/**
 * Storybook stories for GroupingList component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { GroupingList } from './GroupingList';
import type { ListItem, GroupingConfig, BadgeMetric, ReorderChange } from '../types';

const meta: Meta<typeof GroupingList> = {
  title: 'Components/Shared/List/GroupingList',
  component: GroupingList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A sophisticated list component with advanced grouping, SlideOut actions, and enhanced drag & drop reordering.

## Features
- **Advanced Grouping**: Group by time, priority, category, or custom logic
- **SlideOut Actions**: Localized action management per item
- **Enhanced Reordering**: Rich callback information for data source integration
- **Badge Metrics**: Dynamic badge calculation and display
- **Accessibility**: Full keyboard navigation and screen reader support
- **Analytics**: Built-in event tracking
        `,
      },
    },
  },
  argTypes: {
    items: {
      description: 'Array of list items to display',
      control: { type: 'object' },
    },
    onItemClick: {
      description: 'Callback when an item is clicked',
    },
    onItemAction: {
      description: 'Callback when an item action is triggered',
    },
    onReorder: {
      description: 'Enhanced reorder callback with detailed change information',
    },
    onReorderSimple: {
      description: 'Simple reorder callback for backward compatibility',
    },
    groupingConfig: {
      description: 'Configuration for grouping behavior',
      control: { type: 'object' },
    },
    showItemActions: {
      description: 'Whether to show SlideOut actions for items',
      control: { type: 'boolean' },
    },
    isReorderable: {
      description: 'Whether items can be reordered via drag and drop',
      control: { type: 'boolean' },
    },
    showReorderHandle: {
      description: 'Whether to show drag handles for reordering',
      control: { type: 'boolean' },
    },
    emptyStateMessage: {
      description: 'Message to show when no items are present',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
    analyticsId: {
      description: 'ID for analytics tracking',
      control: { type: 'text' },
    },
    minimised: {
      description: 'Whether to show the list in a minimised state',
      control: { type: 'boolean' },
    },
    minimisedCount: {
      description: 'Number of items to show when minimised',
      control: { type: 'number' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data generators
const createSampleItem = (
  id: string,
  title: string,
  message: string,
  priority: ListItem['priority'],
  status: ListItem['status'],
  daysAgo: number = 0,
  category?: string
): ListItem => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return {
    id,
    title,
    message,
    timestamp: date,
    priority,
    status,
    category,
    metadata: {
      author: 'John Doe',
      department: category || 'General',
    },
  };
};

const sampleItems: ListItem[] = [
  createSampleItem('1', 'Critical System Alert', 'Database connection timeout detected in production environment', 'urgent', 'unread', 0, 'Infrastructure'),
  createSampleItem('2', 'User Registration Spike', 'Unusual increase in user registrations detected this morning', 'high', 'unread', 0, 'Analytics'),
  createSampleItem('3', 'Weekly Performance Report', 'System performance metrics for the past week are now available', 'normal', 'read', 0, 'Reports'),
  createSampleItem('4', 'Security Patch Available', 'New security update available for the authentication service', 'high', 'unread', 1, 'Security'),
  createSampleItem('5', 'Backup Completion Notice', 'Daily backup completed successfully at 3:00 AM', 'low', 'read', 1, 'Infrastructure'),
  createSampleItem('6', 'API Rate Limit Warning', 'Approaching API rate limits for external service integration', 'normal', 'unread', 2, 'API'),
  createSampleItem('7', 'Monthly Analytics Summary', 'User engagement metrics and conversion rates for last month', 'low', 'archived', 7, 'Analytics'),
  createSampleItem('8', 'Database Migration Complete', 'User table migration to new schema completed successfully', 'normal', 'read', 3, 'Infrastructure'),
  createSampleItem('9', 'License Renewal Reminder', 'Software licenses expiring in 30 days require renewal', 'normal', 'unread', 5, 'Compliance'),
  createSampleItem('10', 'Feature Flag Update', 'New feature flags have been deployed to production environment', 'low', 'read', 14, 'Deployment'),
];

// Story handlers
const handleItemClick = (item: ListItem) => {
  console.log('📱 Item clicked:', item.title);
};

const handleItemAction = (action: string, itemId: string, item?: ListItem) => {
  console.log('⚡ Item action:', { action, itemId, itemTitle: item?.title });
};

const handleReorder = (change: ReorderChange) => {
  console.group('🔄 Item Reordered');
  console.log('Moved Item:', change.movedItem.title);
  console.log('From Position:', change.fromIndex, '→ To Position:', change.toIndex);
  if (change.groupContext) {
    console.log('Group Context:', change.groupContext);
    if (change.groupContext.isCrossGroupMove) {
      console.log('🔀 Cross-group move detected!');
    }
  }
  console.groupEnd();
};

const handleReorderSimple = (items: ListItem[]) => {
  console.log('📝 Simple reorder - new order:', items.map(item => item.title));
};

const defaultItemActions = [
  {
    id: 'view',
    label: 'View Details',
    icon: <EyeIcon className="w-4 h-4" />,
    color: 'primary' as const,
    onClick: () => {},
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: <PencilIcon className="w-4 h-4" />,
    color: 'secondary' as const,
    onClick: () => {},
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <ArchiveBoxIcon className="w-4 h-4" />,
    color: 'warning' as const,
    onClick: () => {},
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon className="w-4 h-4" />,
    color: 'danger' as const,
    onClick: () => {},
  },
];

// Default configuration
const defaultGroupingConfig: GroupingConfig = {
  groupByPriority: true,
  groupByTime: true,
  showUnreadFirst: true,
  showTotalCount: true,
};

// Story: Basic List
export const Default: Story = {
  args: {
    items: sampleItems.slice(0, 5),
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    groupingConfig: defaultGroupingConfig,
    showItemActions: false,
    isReorderable: false,
    emptyStateMessage: 'No notifications available',
    analyticsId: 'notification-list',
  },
};

// Story: With SlideOut Actions
export const WithSlideOutActions: Story = {
  args: {
    ...Default.args,
    showItemActions: true,
    itemActions: defaultItemActions,
  },
  parameters: {
    docs: {
      description: {
        story: 'List with SlideOut actions enabled. Hover over items to see the action trigger, click to reveal actions.',
      },
    },
  },
};

// Story: Reorderable List
export const ReorderableList: Story = {
  args: {
    ...Default.args,
    isReorderable: true,
    showReorderHandle: true,
    onReorder: handleReorder,
    onReorderSimple: handleReorderSimple,
  },
  parameters: {
    docs: {
      description: {
        story: 'List with drag and drop reordering enabled. Drag items by their handles to reorder. Check the Actions panel for detailed reorder information.',
      },
    },
  },
};

// Story: Complex Grouping
export const ComplexGrouping: Story = {
  args: {
    items: sampleItems,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    groupingConfig: {
      groupByPriority: true,
      groupByTime: true,
      showUnreadFirst: true,
      showTotalCount: true,
      maxItemsPerGroup: 3,
      groupTitles: {
        'Urgent & Unread': '🚨 Urgent & Unread',
        'Today': '📅 Today',
        'Yesterday': '⏰ Yesterday',
        'This Week': '📆 This Week',
        'Older': '📋 Older Items',
      },
      groupIcons: {
        'Urgent & Unread': <ExclamationTriangleIcon className="w-4 h-4 text-danger" />,
        'Today': <ClockIcon className="w-4 h-4 text-primary" />,
      },
    },
    showItemActions: true,
    itemActions: defaultItemActions,
    isReorderable: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex grouping configuration with custom titles, icons, item limits, and full functionality enabled.',
      },
    },
  },
};

// Story: Category Grouping
export const CategoryGrouping: Story = {
  args: {
    items: sampleItems,
    onItemClick: handleItemClick,
    groupingConfig: {
      groupByCategory: true,
      showUnreadFirst: true,
      showTotalCount: true,
      groupTitles: {
        'Infrastructure': '🏗️ Infrastructure',
        'Analytics': '📊 Analytics',
        'Security': '🔒 Security',
        'API': '🔌 API',
        'Reports': '📋 Reports',
        'Compliance': '⚖️ Compliance',
        'Deployment': '🚀 Deployment',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Items grouped by category with custom category titles and emojis.',
      },
    },
  },
};

// Story: Custom Badge Metrics
export const CustomBadgeMetrics: Story = {
  args: {
    items: sampleItems,
    onItemClick: handleItemClick,
    groupingConfig: {
      groupByTime: true,
      showTotalCount: true,
      badgeMetrics: [
        {
          id: 'critical',
          label: 'critical',
          color: 'danger',
          variant: 'solid',
          condition: (item) => item.priority === 'urgent',
          priority: 10,
        },
        {
          id: 'unread',
          label: 'unread',
          color: 'primary',
          variant: 'flat',
          condition: (item) => item.status === 'unread',
          priority: 8,
        },
        {
          id: 'infrastructure',
          label: 'infra',
          color: 'secondary',
          variant: 'bordered',
          condition: (item) => item.category === 'Infrastructure',
          priority: 5,
        },
        {
          id: 'recent',
          label: 'new',
          color: 'success',
          variant: 'light',
          condition: (item) => {
            const daysSince = Math.floor((Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60 * 24));
            return daysSince === 0;
          },
          priority: 3,
        },
      ] as BadgeMetric[],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom badge metrics showing different conditions and styling options.',
      },
    },
  },
};

// Story: Empty State
export const EmptyState: Story = {
  args: {
    items: [],
    onItemClick: handleItemClick,
    emptyStateMessage: 'No notifications found. All caught up! 🎉',
    groupingConfig: defaultGroupingConfig,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state display with custom message.',
      },
    },
  },
};

// Story: Custom Grouping Function
export const CustomGroupingFunction: Story = {
  args: {
    items: sampleItems,
    onItemClick: handleItemClick,
    groupingConfig: {
      customGrouping: (items: ListItem[]) => {
        const groups: Record<string, ListItem[]> = {};
        
        items.forEach(item => {
          // Group by first letter of title
          const firstLetter = item.title.charAt(0).toUpperCase();
          if (!groups[firstLetter]) {
            groups[firstLetter] = [];
          }
          groups[firstLetter].push(item);
        });
        
        return groups;
      },
      groupOrder: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      groupTitles: {
        'A': 'A-C',
        'B': 'A-C', 
        'C': 'A-C',
        'D': 'D-F',
        'E': 'D-F',
        'F': 'D-F',
        'G': 'G-I',
        'H': 'G-I',
        'I': 'G-I',
        'L': 'J-L',
        'M': 'M-O',
        'N': 'M-O',
        'S': 'P-S',
        'U': 'T-Z',
        'W': 'T-Z',
      },
      showTotalCount: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom grouping function that groups items alphabetically by the first letter of their title.',
      },
    },
  },
};

// Interactive story for playground
export const Playground: Story = {
  args: {
    items: sampleItems,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    onReorder: handleReorder,
    groupingConfig: {
      groupByPriority: true,
      groupByTime: true,
      showUnreadFirst: true,
      showTotalCount: true,
    },
    showItemActions: true,
    itemActions: defaultItemActions,
    isReorderable: true,
    showReorderHandle: true,
    emptyStateMessage: 'No items to display',
    analyticsId: 'playground-list',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all GroupingList features. Open browser console to see detailed reorder information.',
      },
    },
  },
};

// Performance story with many items
export const LargeDataset: Story = {
  args: {
    items: Array.from({ length: 100 }, (_, i) => 
      createSampleItem(
        `item-${i}`,
        `Notification Item ${i + 1}`,
        `This is the message content for notification item number ${i + 1}. It contains some relevant information.`,
        ['low', 'normal', 'high', 'urgent'][i % 4] as ListItem['priority'],
        ['unread', 'read', 'archived'][i % 3] as ListItem['status'],
        Math.floor(i / 10), // Spread across different time periods
        ['Infrastructure', 'Security', 'Analytics', 'API', 'Reports'][i % 5]
      )
    ),
    onItemClick: handleItemClick,
    groupingConfig: {
      groupByPriority: true,
      groupByTime: true,
      maxItemsPerGroup: 10,
      showTotalCount: true,
    },
    showItemActions: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance test with 100 items to demonstrate how the component handles larger datasets with grouping and limits.',
      },
    },
  },
};