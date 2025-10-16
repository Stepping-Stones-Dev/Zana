/**
 * GroupingList Component (Refactored)
 * A clean, modular list component with advanced grouping, SlideOut actions, and drag & drop
 */

import React, { useState, useMemo } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { 
  ClockIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid 
} from '@heroicons/react/24/solid';
import { Button } from '@heroui/react';
import { clsx as cx } from 'clsx';

import GroupItem from './GroupItem';
import GroupHeader from './GroupHeader';
import { useDragAndDrop, useGroupedItems, useItemInteractions } from './hooks';
import type { 
  GroupingListProps, 
  GroupingConfig,
  BadgeMetric 
} from '../types';

// Default configuration
const DEFAULT_BADGE_METRICS: BadgeMetric[] = [
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

const DEFAULT_GROUPING_CONFIG: GroupingConfig = {
  groupByPriority: true,
  groupByTime: true,
  groupByCategory: false,
  showUnreadFirst: true,
  maxItemsPerGroup: undefined,
  badgeMetrics: DEFAULT_BADGE_METRICS,
  showTotalCount: true,
};

// Default group icons for built-in groups
const DEFAULT_GROUP_ICONS: Record<string, React.ReactNode> = {
  'Urgent & Unread': <ExclamationTriangleIconSolid className="w-4 h-4 text-danger" />,
  'Today': <ClockIcon className="w-4 h-4 text-primary" />,
  'Yesterday': <ClockIcon className="w-4 h-4 text-warning" />,
  'This Week': <ClockIcon className="w-4 h-4 text-secondary" />,
  'Last Week': <ClockIcon className="w-4 h-4 text-default-500" />,
  'Older': <ClockIcon className="w-4 h-4 text-default-400" />,
  'Urgent': <ExclamationTriangleIconSolid className="w-4 h-4 text-danger" />,
  'High Priority': <ExclamationTriangleIconSolid className="w-4 h-4 text-warning" />,
  'Normal Priority': <ClockIcon className="w-4 h-4 text-primary" />,
  'Low Priority': <ClockIcon className="w-4 h-4 text-default-500" />,
};

/**
 * GroupingList - A sophisticated list component with grouping and actions
 * 
 * Features:
 * - Advanced grouping (time, priority, category, custom)
 * - SlideOut actions with localized management per item
 * - Drag and drop reordering
 * - Badge metrics and counting
 * - Keyboard navigation
 * - Analytics integration
 * - Accessibility support
 */
export const GroupingList: React.FC<GroupingListProps> = ({
  items = [],
  onItemClick,
  onItemAction,
  groupingConfig = DEFAULT_GROUPING_CONFIG,
  itemActions = [],
  showItemActions = false,
  emptyStateMessage = 'No items available',
  className,
  analyticsId = 'grouping-list',
  isReorderable = false,
  showReorderHandle = true,
  onReorder,
  minimised = false,
  minimisedCount = 3,
}) => {
  // Merge default configuration with props
  const config = {
    ...DEFAULT_GROUPING_CONFIG,
    ...groupingConfig,
    // Merge icons with defaults
    groupIcons: {
      ...DEFAULT_GROUP_ICONS,
      ...groupingConfig.groupIcons,
    },
    // Merge badge metrics with defaults
    badgeMetrics: groupingConfig.badgeMetrics || DEFAULT_BADGE_METRICS,
  };

  // Drag and drop management
  const {
    draggedIndex,
    dragOverIndex,
    items: reorderableItems,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(items, isReorderable, onReorder);

  // Item grouping and organization
  const { groupsWithTitles } = useGroupedItems(
    items, 
    config,
    isReorderable,
    reorderableItems
  );

  // Item interaction handlers
  const { handleItemClick, handleItemAction } = useItemInteractions(
    onItemClick,
    onItemAction
  );

  // State for managing expanded groups when minimised is enabled
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Helper to toggle group expansion
  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  // Process groups for minimisation logic
  const processedGroups = useMemo(() => {
    if (!minimised) {
      return groupsWithTitles.map(group => ({
        ...group,
        displayedItems: group.items,
        hasMore: false,
        isExpanded: false
      }));
    }

    return groupsWithTitles.map(group => {
      const isExpanded = expandedGroups.has(group.key);
      const hasMore = group.items.length > minimisedCount;
      const displayedItems = isExpanded || !hasMore 
        ? group.items 
        : group.items.slice(0, minimisedCount);

      return {
        ...group,
        displayedItems,
        hasMore,
        isExpanded
      };
    });
  }, [groupsWithTitles, minimised, minimisedCount, expandedGroups]);

  // Empty state
  if (groupsWithTitles.length === 0) {
    return (
      <div className={cx(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}>
        <BellIcon className="w-12 h-12 text-foreground-300 mb-3" />
        <p className="text-foreground-500 text-sm">{emptyStateMessage}</p>
      </div>
    );
  }

  // Calculate global index for drag operations
  let globalIndex = 0;

  return (
    <div 
      className={cx('w-full', className)}
      data-analytics-id={analyticsId}
    >
      {processedGroups.map((group) => (
        <div key={group.key} className="mb-4 last:mb-0">
          {/* Group Header */}
          <GroupHeader
            title={group.title}
            items={group.items}
            groupingConfig={config}
            icon={group.icon}
          />

          {/* Group Items */}
          <div className="divide-y divide-divider">
            {group.displayedItems.map((item, itemIndex) => {
              const currentGlobalIndex = globalIndex++;
              
              return (
                <GroupItem
                  key={item.id}
                  item={item}
                  index={itemIndex}
                  globalIndex={currentGlobalIndex}
                  actions={itemActions}
                  onItemClick={handleItemClick}
                  onItemAction={handleItemAction}
                  showActions={showItemActions}
                  isReorderable={isReorderable}
                  showReorderHandle={showReorderHandle}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  draggedIndex={draggedIndex}
                  dragOverIndex={dragOverIndex}
                  analyticsId={`${analyticsId}.group.${group.key}`}
                />
              );
            })}
          </div>

          {/* See More/Less Button */}
          {minimised && group.hasMore && (
            <div className="py-3 text-center border-b border-divider last:border-b-0">
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={() => toggleGroupExpansion(group.key)}
                className="text-xs"
                data-analytics-id={`${analyticsId}.group.${group.key}.${group.isExpanded ? 'showLess' : 'showMore'}`}
              >
                {group.isExpanded 
                  ? `Show less` 
                  : `Show ${group.items.length - minimisedCount} more`
                }
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Export types and utilities for external use
export type {
  GroupingListProps,
  ListItem,
  Priority,
  Status,
  BadgeMetric,
  GroupingConfig,
} from '../types';

export {
  DEFAULT_BADGE_METRICS,
  DEFAULT_GROUPING_CONFIG,
};

export default GroupingList;