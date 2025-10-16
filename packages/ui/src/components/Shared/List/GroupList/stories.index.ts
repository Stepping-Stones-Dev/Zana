/**
 * Storybook Stories Utilities
 * 
 * This file provides utilities and configurations for GroupingList related stories.
 * Import individual story files directly to avoid naming conflicts.
 */

// Story metadata and utilities
export const STORY_CATEGORIES = {
  MAIN: 'Components/Shared/List/GroupList/GroupingList',
  ITEM: 'Components/Shared/List/GroupList/GroupItem',
  HEADER: 'Components/Shared/List/GroupList/GroupHeader',
} as const;

export const STORY_TITLES = {
  // GroupingList stories
  GROUPING_LIST_DEFAULT: 'Default',
  GROUPING_LIST_WITH_ACTIONS: 'WithSlideOutActions',
  GROUPING_LIST_REORDERABLE: 'ReorderableList',
  GROUPING_LIST_COMPLEX: 'ComplexGrouping',
  GROUPING_LIST_CATEGORY: 'CategoryGrouping',
  GROUPING_LIST_CUSTOM_BADGES: 'CustomBadgeMetrics',
  GROUPING_LIST_EMPTY: 'EmptyState',
  GROUPING_LIST_CUSTOM_GROUPING: 'CustomGroupingFunction',
  GROUPING_LIST_PLAYGROUND: 'Playground',
  GROUPING_LIST_LARGE: 'LargeDataset',
  
  // GroupItem stories
  GROUP_ITEM_DEFAULT: 'Default',
  GROUP_ITEM_URGENT: 'UrgentUnread',
  GROUP_ITEM_READ: 'ReadNormal',
  GROUP_ITEM_WITH_ACTIONS: 'WithActions',
  GROUP_ITEM_REORDERABLE: 'Reorderable',
  GROUP_ITEM_FULL_FEATURED: 'FullFeatured',
  GROUP_ITEM_PRIORITY_LEVELS: 'PriorityLevels',
  GROUP_ITEM_STATUS_TYPES: 'StatusTypes',
  
  // GroupHeader stories
  GROUP_HEADER_DEFAULT: 'Default',
  GROUP_HEADER_URGENT: 'UrgentGroup',
  GROUP_HEADER_EMPTY: 'EmptyGroup',
  GROUP_HEADER_CUSTOM_BADGES: 'CustomBadgeMetrics',
  GROUP_HEADER_NO_COUNT: 'NoTotalCount',
  GROUP_HEADER_MANY_BADGES: 'ManyBadges',
  GROUP_HEADER_LONG_TITLE: 'LongTitle',
  GROUP_HEADER_BADGE_VARIANTS: 'BadgeVariants',
} as const;

/**
 * Story testing utilities
 */
export const createStoryTestItem = (id: string, overrides?: Partial<import('../types').ListItem>) => ({
  id,
  title: `Test Item ${id}`,
  message: 'This is a test message for story testing purposes.',
  timestamp: new Date(),
  priority: 'normal' as const,
  status: 'unread' as const,
  category: 'Test',
  ...overrides,
});

export const createStoryTestItems = (count: number) => 
  Array.from({ length: count }, (_, i) => createStoryTestItem(`test-${i + 1}`));

/**
 * Common story configurations for reuse
 */
export const COMMON_STORY_CONFIGS = {
  withConsoleLogging: {
    onItemClick: (item: any) => console.log('📱 Story: Item clicked:', item.title),
    onItemAction: (action: string, itemId: string, item?: any) => 
      console.log('⚡ Story: Item action:', { action, itemId, itemTitle: item?.title }),
  },
  
  withReorderLogging: {
    onReorder: (change: any) => {
      console.group('🔄 Story: Item Reordered');
      console.log('Moved Item:', change.movedItem.title);
      console.log('From Position:', change.fromIndex, '→ To Position:', change.toIndex);
      if (change.groupContext?.isCrossGroupMove) {
        console.log('🔀 Cross-group move detected!');
      }
      console.groupEnd();
    },
  },
  
  basicGroupingConfig: {
    groupByPriority: true,
    groupByTime: true,
    showUnreadFirst: true,
    showTotalCount: true,
  },
};

export default {
  STORY_CATEGORIES,
  STORY_TITLES,
  COMMON_STORY_CONFIGS,
  createStoryTestItem,
  createStoryTestItems,
};