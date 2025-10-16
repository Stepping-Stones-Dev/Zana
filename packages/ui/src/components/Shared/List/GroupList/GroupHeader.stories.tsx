/**
 * Storybook stories for GroupHeader component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  ClockIcon,
  ExclamationTriangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from '@heroicons/react/24/solid';

import { GroupHeader } from './GroupHeader';
import type { ListItem, GroupingConfig, BadgeMetric } from '../types';

const meta: Meta<typeof GroupHeader> = {
  title: 'Components/Shared/List/GroupHeader',
  component: GroupHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Group header component that displays group information, icons, and calculated metrics.

## Features
- **Dynamic Badge Calculation**: Automatically calculates and displays relevant metrics
- **Customizable Titles and Icons**: Support for custom group titles and icons
- **Metric Filtering**: Shows only metrics with non-zero counts
- **Priority Sorting**: Metrics are sorted by priority (higher priority shown first)
- **Total Count Display**: Optional total item count badge
        `,
      },
    },
  },
  argTypes: {
    title: {
      description: 'Group title to display',
      control: { type: 'text' },
    },
    items: {
      description: 'Items in this group (used for metric calculation)',
      control: { type: 'object' },
    },
    groupingConfig: {
      description: 'Configuration for badge metrics and display options',
      control: { type: 'object' },
    },
    icon: {
      description: 'Icon to display next to the title',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data generators
const createSampleItem = (
  id: string,
  priority: ListItem['priority'],
  status: ListItem['status'],
  category?: string
): ListItem => ({
  id,
  title: `Sample Item ${id}`,
  message: 'Sample message content',
  timestamp: new Date(),
  priority,
  status,
  category,
});

// Sample items for different scenarios
const urgentUnreadItems: ListItem[] = [
  createSampleItem('1', 'urgent', 'unread', 'Infrastructure'),
  createSampleItem('2', 'urgent', 'unread', 'Security'),
  createSampleItem('3', 'high', 'unread', 'Infrastructure'),
  createSampleItem('4', 'normal', 'read', 'Analytics'),
  createSampleItem('5', 'low', 'read', 'Reports'),
];

const mixedItems: ListItem[] = [
  createSampleItem('1', 'high', 'unread', 'Infrastructure'),
  createSampleItem('2', 'normal', 'unread', 'Security'),
  createSampleItem('3', 'normal', 'read', 'Analytics'),
  createSampleItem('4', 'low', 'read', 'Reports'),
  createSampleItem('5', 'urgent', 'read', 'Infrastructure'),
  createSampleItem('6', 'high', 'unread', 'API'),
];

const readOnlyItems: ListItem[] = [
  createSampleItem('1', 'normal', 'read', 'Infrastructure'),
  createSampleItem('2', 'low', 'read', 'Analytics'),
  createSampleItem('3', 'normal', 'read', 'Reports'),
];

// Default badge metrics
const defaultBadgeMetrics: BadgeMetric[] = [
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
];

const customBadgeMetrics: BadgeMetric[] = [
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
    label: 'new',
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
    id: 'security',
    label: 'security',
    color: 'warning',
    variant: 'light',
    condition: (item) => item.category === 'Security',
    priority: 4,
  },
];

// Default grouping config
const defaultGroupingConfig: GroupingConfig = {
  badgeMetrics: defaultBadgeMetrics,
  showTotalCount: true,
};

// Story: Basic Group Header
export const Default: Story = {
  args: {
    title: 'Today',
    items: mixedItems,
    groupingConfig: defaultGroupingConfig,
    icon: <ClockIcon className="w-4 h-4 text-primary" />,
  },
};

// Story: Urgent Group with High Activity
export const UrgentGroup: Story = {
  args: {
    title: 'Urgent & Unread',
    items: urgentUnreadItems,
    groupingConfig: defaultGroupingConfig,
    icon: <ExclamationTriangleIconSolid className="w-4 h-4 text-danger" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Group header for urgent items with multiple badge metrics displayed.',
      },
    },
  },
};

// Story: Empty Group
export const EmptyGroup: Story = {
  args: {
    title: 'No Items',
    items: [],
    groupingConfig: defaultGroupingConfig,
    icon: <BellIcon className="w-4 h-4 text-default-400" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Group header with no items - only shows total count (0).',
      },
    },
  },
};

// Story: Custom Badge Metrics
export const CustomBadgeMetrics: Story = {
  args: {
    title: 'Infrastructure',
    items: mixedItems,
    groupingConfig: {
      badgeMetrics: customBadgeMetrics,
      showTotalCount: true,
    },
    icon: <ClockIcon className="w-4 h-4 text-secondary" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Group header with custom badge metrics including category-based badges.',
      },
    },
  },
};

// Story: No Total Count
export const NoTotalCount: Story = {
  args: {
    title: 'Reports',
    items: readOnlyItems,
    groupingConfig: {
      badgeMetrics: defaultBadgeMetrics,
      showTotalCount: false,
    },
    icon: <ClockIcon className="w-4 h-4 text-success" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Group header with total count badge disabled - only shows metric badges.',
      },
    },
  },
};

// Story: Many Badge Types
export const ManyBadges: Story = {
  args: {
    title: 'Complex Group',
    items: mixedItems,
    groupingConfig: {
      badgeMetrics: [
        ...customBadgeMetrics,
        {
          id: 'analytics',
          label: 'analytics',
          color: 'success',
          variant: 'shadow',
          condition: (item) => item.category === 'Analytics',
          priority: 3,
        },
        {
          id: 'api',
          label: 'api',
          color: 'primary',
          variant: 'faded',
          condition: (item) => item.category === 'API',
          priority: 2,
        },
      ],
      showTotalCount: true,
    },
    icon: <ExclamationTriangleIcon className="w-4 h-4 text-warning" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Group header showcasing multiple badge metrics with different colors and variants.',
      },
    },
  },
};

// Story: Long Title
export const LongTitle: Story = {
  args: {
    title: 'Very Long Group Title That Might Wrap or Truncate in Some Layouts',
    items: mixedItems.slice(0, 3),
    groupingConfig: defaultGroupingConfig,
    icon: <ClockIcon className="w-4 h-4 text-primary" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Group header with a long title to test text handling.',
      },
    },
  },
};

// Story: Various Badge Variants
export const BadgeVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm font-medium mb-2">Different Badge Variants:</div>
      
      <GroupHeader
        title="Solid Badges"
        items={mixedItems}
        groupingConfig={{
          badgeMetrics: [
            { id: 'solid', label: 'solid', color: 'primary', variant: 'solid', condition: () => true, priority: 1 },
          ],
          showTotalCount: true,
        }}
        icon={<ClockIcon className="w-4 h-4 text-primary" />}
      />
      
      <GroupHeader
        title="Bordered Badges"
        items={mixedItems}
        groupingConfig={{
          badgeMetrics: [
            { id: 'bordered', label: 'bordered', color: 'secondary', variant: 'bordered', condition: () => true, priority: 1 },
          ],
          showTotalCount: true,
        }}
        icon={<ClockIcon className="w-4 h-4 text-secondary" />}
      />
      
      <GroupHeader
        title="Light Badges"
        items={mixedItems}
        groupingConfig={{
          badgeMetrics: [
            { id: 'light', label: 'light', color: 'warning', variant: 'light', condition: () => true, priority: 1 },
          ],
          showTotalCount: true,
        }}
        icon={<ClockIcon className="w-4 h-4 text-warning" />}
      />
      
      <GroupHeader
        title="Flat Badges"
        items={mixedItems}
        groupingConfig={{
          badgeMetrics: [
            { id: 'flat', label: 'flat', color: 'success', variant: 'flat', condition: () => true, priority: 1 },
          ],
          showTotalCount: true,
        }}
        icon={<ClockIcon className="w-4 h-4 text-success" />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different badge variants and their visual appearance.',
      },
    },
  },
};