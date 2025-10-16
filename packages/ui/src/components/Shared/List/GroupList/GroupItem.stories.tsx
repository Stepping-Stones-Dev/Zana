/**
 * Storybook stories for GroupItem component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

import { GroupItem } from './GroupItem';
import type { ListItem, GroupItemProps } from '../types';

const meta: Meta<typeof GroupItem> = {
  title: 'Components/Shared/List/GroupItem',
  component: GroupItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Individual list item component with localized SlideOut management.

## Features
- **Self-managed SlideOut state**: Each item manages its own actions independently
- **Drag and drop support**: Built-in drag handle for reordering
- **Rich interactions**: Click, keyboard, hover, and focus handling
- **Analytics integration**: Built-in event tracking
- **Accessibility**: Full keyboard navigation and screen reader support
        `,
      },
    },
  },
  argTypes: {
    item: {
      description: 'The list item data to display',
      control: { type: 'object' },
    },
    showActions: {
      description: 'Whether to show SlideOut actions',
      control: { type: 'boolean' },
    },
    isReorderable: {
      description: 'Whether the item can be reordered',
      control: { type: 'boolean' },
    },
    showReorderHandle: {
      description: 'Whether to show the drag handle',
      control: { type: 'boolean' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample item data
const createSampleItem = (
  priority: ListItem['priority'],
  status: ListItem['status'],
  title: string = 'Sample Notification',
  message: string = 'This is a sample notification message with some details.',
  category?: string
): ListItem => ({
  id: `sample-${priority}-${status}`,
  title,
  message,
  timestamp: new Date(),
  priority,
  status,
  category,
  metadata: {
    author: 'System',
    department: category || 'General',
  },
});

const sampleActions = [
  {
    id: 'view',
    label: 'View Details',
    icon: <EyeIcon className="w-4 h-4" />,
    color: 'primary' as const,
    onClick: () => console.log('👁️ View action clicked'),
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: <PencilIcon className="w-4 h-4" />,
    color: 'secondary' as const,
    onClick: () => console.log('✏️ Edit action clicked'),
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <ArchiveBoxIcon className="w-4 h-4" />,
    color: 'warning' as const,
    onClick: () => console.log('📦 Archive action clicked'),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon className="w-4 h-4" />,
    color: 'danger' as const,
    onClick: () => console.log('🗑️ Delete action clicked'),
  },
];

// Story handlers
const handleItemClick = (item: ListItem) => {
  console.log('📱 Item clicked:', item.title);
};

const handleItemAction = (action: string, itemId: string, item?: ListItem) => {
  console.log('⚡ Item action:', { action, itemId, itemTitle: item?.title });
};

// Story: Basic Item
export const Default: Story = {
  args: {
    item: createSampleItem('normal', 'unread'),
    index: 0,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    showActions: false,
    isReorderable: false,
    analyticsId: 'group-item-story',
  },
};

// Story: Unread Urgent Item
export const UrgentUnread: Story = {
  args: {
    item: createSampleItem('urgent', 'unread', 'Critical System Alert', 'Database connection timeout detected in production environment', 'Infrastructure'),
    index: 0,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    showActions: false,
    isReorderable: false,
  },
};

// Story: Read Normal Item
export const ReadNormal: Story = {
  args: {
    item: createSampleItem('normal', 'read', 'System Backup Complete', 'Daily backup completed successfully at 3:00 AM', 'Infrastructure'),
    index: 0,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    showActions: false,
    isReorderable: false,
  },
};

// Story: With SlideOut Actions
export const WithActions: Story = {
  args: {
    item: createSampleItem('high', 'unread', 'Security Update Available', 'New security patch available for authentication service', 'Security'),
    index: 0,
    actions: sampleActions,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    showActions: true,
    isReorderable: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Item with SlideOut actions enabled. Hover to see the action trigger, click to reveal actions.',
      },
    },
  },
};

// Story: Reorderable Item
export const Reorderable: Story = {
  args: {
    item: createSampleItem('normal', 'unread', 'Performance Report Ready', 'Weekly system performance metrics are now available for review'),
    index: 0,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    showActions: false,
    isReorderable: true,
    showReorderHandle: true,
    onDragStart: (e: React.DragEvent, index: number) => console.log('🎯 Drag start:', index),
    onDragOver: (e: React.DragEvent, index: number) => console.log('🎯 Drag over:', index),
    onDrop: (e: React.DragEvent, index: number) => console.log('🎯 Drop:', index),
  },
  parameters: {
    docs: {
      description: {
        story: 'Item with drag and drop reordering enabled. Hover to see the drag handle.',
      },
    },
  },
};

// Story: Full Featured Item
export const FullFeatured: Story = {
  args: {
    item: createSampleItem('high', 'unread', 'API Rate Limit Warning', 'Approaching rate limits for external service integration - action required', 'API'),
    index: 0,
    actions: sampleActions,
    onItemClick: handleItemClick,
    onItemAction: handleItemAction,
    showActions: true,
    isReorderable: true,
    showReorderHandle: true,
    onDragStart: (e: React.DragEvent, index: number) => console.log('🎯 Drag start:', index),
    onDragOver: (e: React.DragEvent, index: number) => console.log('🎯 Drag over:', index),
    onDrop: (e: React.DragEvent, index: number) => console.log('🎯 Drop:', index),
  },
  parameters: {
    docs: {
      description: {
        story: 'Item with all features enabled: SlideOut actions, drag & drop, and full interaction handling.',
      },
    },
  },
};

// Story: Different Priority Levels
export const PriorityLevels: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-2">Priority Levels:</div>
      
      <GroupItem
        item={createSampleItem('urgent', 'unread', 'Urgent Priority Item', 'This is an urgent priority notification')}
        index={0}
        onItemClick={handleItemClick}
      />
      
      <GroupItem
        item={createSampleItem('high', 'unread', 'High Priority Item', 'This is a high priority notification')}
        index={1}
        onItemClick={handleItemClick}
      />
      
      <GroupItem
        item={createSampleItem('normal', 'read', 'Normal Priority Item', 'This is a normal priority notification')}
        index={2}
        onItemClick={handleItemClick}
      />
      
      <GroupItem
        item={createSampleItem('low', 'read', 'Low Priority Item', 'This is a low priority notification')}
        index={3}
        onItemClick={handleItemClick}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different priority levels and their visual representation.',
      },
    },
  },
};

// Story: Different Status Types
export const StatusTypes: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-2">Status Types:</div>
      
      <GroupItem
        item={createSampleItem('normal', 'unread', 'Unread Notification', 'This notification has not been read yet')}
        index={0}
        onItemClick={handleItemClick}
      />
      
      <GroupItem
        item={createSampleItem('normal', 'read', 'Read Notification', 'This notification has been read')}
        index={1}
        onItemClick={handleItemClick}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different status types (unread vs read) and their visual styling.',
      },
    },
  },
};