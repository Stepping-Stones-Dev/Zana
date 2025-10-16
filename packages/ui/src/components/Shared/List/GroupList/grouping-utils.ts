/**
 * Utility functions for GroupingList component
 * Provides date formatting, item filtering, sorting, and grouping logic
 */

import type { ListItem, Priority, Status, BadgeMetric, GroupingConfig } from '../types.ts';

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
} as const;

export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday', 
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  OLDER: 'older',
} as const;

/**
 * Format a timestamp to a human-readable relative time
 */
export function formatRelativeTime(timestamp: Date): string {
  if (!timestamp || !(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return timestamp.toLocaleDateString();
}

/**
 * Get the time period for a given date
 */
export function getTimePeriod(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return TIME_PERIODS.OLDER;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) return TIME_PERIODS.TODAY;
  if (itemDate.getTime() === yesterday.getTime()) return TIME_PERIODS.YESTERDAY;
  if (itemDate >= weekAgo) return TIME_PERIODS.THIS_WEEK;
  if (itemDate >= twoWeeksAgo) return TIME_PERIODS.LAST_WEEK;
  
  return TIME_PERIODS.OLDER;
}

/**
 * Filter items by status (exclude archived by default)
 */
export function filterActiveItems(items: ListItem[]): ListItem[] {
  return items.filter(item => item.status !== 'archived');
}

/**
 * Sort items within a group according to grouping configuration
 */
export function sortGroupItems(
  items: ListItem[], 
  config: GroupingConfig
): ListItem[] {
  return [...items].sort((a, b) => {
    // Priority: unread items first if enabled
    if (config.showUnreadFirst) {
      if (a.status === 'unread' && b.status !== 'unread') return -1;
      if (a.status !== 'unread' && b.status === 'unread') return 1;
    }

    // Secondary: priority (urgent > high > normal > low)
    const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Tertiary: timestamp (newest first)
    const aTime = a.timestamp && !isNaN(a.timestamp.getTime()) ? a.timestamp.getTime() : 0;
    const bTime = b.timestamp && !isNaN(b.timestamp.getTime()) ? b.timestamp.getTime() : 0;
    
    return bTime - aTime;
  });
}

/**
 * Group items by time periods
 */
export function groupItemsByTime(items: ListItem[]): Record<string, ListItem[]> {
  const groups: Record<string, ListItem[]> = {
    [TIME_PERIODS.TODAY]: [],
    [TIME_PERIODS.YESTERDAY]: [],
    [TIME_PERIODS.THIS_WEEK]: [],
    [TIME_PERIODS.LAST_WEEK]: [],
    [TIME_PERIODS.OLDER]: [],
  };

  items.forEach(item => {
    const period = getTimePeriod(item.timestamp);
    groups[period].push(item);
  });

  return groups;
}

/**
 * Group items by priority with urgent unread items elevated
 */
export function groupItemsByPriority(items: ListItem[]): Record<string, ListItem[]> {
  const groups: Record<string, ListItem[]> = {
    urgent_unread: [],
    urgent: [],
    high: [],
    normal: [],
    low: [],
  };

  items.forEach(item => {
    if (item.priority === 'urgent' && item.status === 'unread') {
      groups.urgent_unread.push(item);
    } else {
      groups[item.priority].push(item);
    }
  });

  return groups;
}

/**
 * Group items by category
 */
export function groupItemsByCategory(items: ListItem[]): Record<string, ListItem[]> {
  const groups: Record<string, ListItem[]> = {};

  items.forEach(item => {
    const category = item.category || 'uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  });

  return groups;
}

/**
 * Apply grouping configuration and return grouped items
 */
export function applyGrouping(
  items: ListItem[], 
  config: GroupingConfig
): Record<string, ListItem[]> {
  // Use custom grouping if provided
  if (config.customGrouping) {
    return config.customGrouping(items);
  }

  // Start with all items in one group if no grouping is enabled
  if (!config.groupByTime && !config.groupByPriority && !config.groupByCategory) {
    return { all: items };
  }

  let groups: Record<string, ListItem[]>;

  // Primary grouping strategy
  if (config.groupByPriority) {
    // Priority-first grouping: separate urgent unread, then by priority
    groups = groupItemsByPriority(items);
  } else if (config.groupByTime) {
    // Time-first grouping
    groups = groupItemsByTime(items);
  } else if (config.groupByCategory) {
    // Category grouping
    groups = groupItemsByCategory(items);
  } else {
    groups = { all: items };
  }

  // Apply secondary grouping if both time and priority are enabled
  if (config.groupByTime && config.groupByPriority && !config.customGrouping) {
    // For each time group, sub-group by priority
    const timeGroups = groupItemsByTime(items);
    const combinedGroups: Record<string, ListItem[]> = {};

    Object.entries(timeGroups).forEach(([timePeriod, timeItems]) => {
      if (timeItems.length === 0) return;
      
      const prioritySubGroups = groupItemsByPriority(timeItems);
      Object.entries(prioritySubGroups).forEach(([priority, priorityItems]) => {
        if (priorityItems.length === 0) return;
        
        const groupKey = priority === 'urgent_unread' 
          ? 'urgent_unread' 
          : `${timePeriod}_${priority}`;
        combinedGroups[groupKey] = priorityItems;
      });
    });

    groups = combinedGroups;
  }

  // Sort items within each group and apply limits
  Object.keys(groups).forEach(groupKey => {
    const groupItems = groups[groupKey];
    
    // Sort items within the group
    groups[groupKey] = sortGroupItems(groupItems, config);
    
    // Apply max items limit if specified
    if (config.maxItemsPerGroup && groups[groupKey].length > config.maxItemsPerGroup) {
      groups[groupKey] = groups[groupKey].slice(0, config.maxItemsPerGroup);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * Calculate badge metrics for a group of items
 */
export function calculateBadgeMetrics(
  items: ListItem[], 
  metrics: BadgeMetric[]
): Array<BadgeMetric & { count: number }> {
  return metrics
    .map(metric => ({
      ...metric,
      count: items.filter(metric.condition).length
    }))
    .filter(metric => metric.count > 0)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Get the display order for groups based on configuration
 */
export function getGroupDisplayOrder(
  groups: Record<string, ListItem[]>,
  config: GroupingConfig
): string[] {
  if (config.groupOrder) {
    return config.groupOrder.filter((key: string) => groups[key] && groups[key].length > 0);
  }

  // Default ordering based on grouping type
  const groupKeys = Object.keys(groups);
  
  if (config.groupByPriority && !config.groupByTime) {
    // Priority order: urgent_unread, urgent, high, normal, low
    const priorityOrder = ['urgent_unread', 'urgent', 'high', 'normal', 'low'];
    return priorityOrder.filter(key => groupKeys.includes(key));
  }
  
  if (config.groupByTime && !config.groupByPriority) {
    // Time order: today, yesterday, this_week, last_week, older
    const timeOrder = [TIME_PERIODS.TODAY, TIME_PERIODS.YESTERDAY, TIME_PERIODS.THIS_WEEK, TIME_PERIODS.LAST_WEEK, TIME_PERIODS.OLDER];
    return timeOrder.filter(key => groupKeys.includes(key));
  }

  if (config.groupByTime && config.groupByPriority) {
    // Combined time + priority: urgent_unread first, then time periods with priorities
    const order: string[] = [];
    
    if (groupKeys.includes('urgent_unread')) {
      order.push('urgent_unread');
    }
    
    const timeOrder = [TIME_PERIODS.TODAY, TIME_PERIODS.YESTERDAY, TIME_PERIODS.THIS_WEEK, TIME_PERIODS.LAST_WEEK, TIME_PERIODS.OLDER];
    const priorityOrder = ['urgent', 'high', 'normal', 'low'];
    
    timeOrder.forEach(timePeriod => {
      priorityOrder.forEach(priority => {
        const key = `${timePeriod}_${priority}`;
        if (groupKeys.includes(key)) {
          order.push(key);
        }
      });
    });
    
    return order;
  }

  // Default: return keys as-is
  return groupKeys;
}

/**
 * Get display title for a group
 */
export function getGroupDisplayTitle(groupKey: string, config: GroupingConfig): string {
  // Use custom title if provided
  if (config.groupTitles?.[groupKey]) {
    return config.groupTitles[groupKey];
  }

  // Handle combined grouping keys
  if (groupKey.includes('_')) {
    const [timePart, priorityPart] = groupKey.split('_');
    
    if (groupKey === 'urgent_unread') {
      return 'Urgent & Unread';
    }
    
    const timeLabels: Record<string, string> = {
      [TIME_PERIODS.TODAY]: 'Today',
      [TIME_PERIODS.YESTERDAY]: 'Yesterday',
      [TIME_PERIODS.THIS_WEEK]: 'This Week',
      [TIME_PERIODS.LAST_WEEK]: 'Last Week',
      [TIME_PERIODS.OLDER]: 'Older',
    };
    
    const priorityLabels: Record<string, string> = {
      urgent: 'Urgent',
      high: 'High Priority',
      normal: 'Normal',
      low: 'Low Priority',
    };
    
    return `${timeLabels[timePart] || timePart} - ${priorityLabels[priorityPart] || priorityPart}`;
  }

  // Single grouping titles
  const defaultTitles: Record<string, string> = {
    [TIME_PERIODS.TODAY]: 'Today',
    [TIME_PERIODS.YESTERDAY]: 'Yesterday',
    [TIME_PERIODS.THIS_WEEK]: 'This Week',
    [TIME_PERIODS.LAST_WEEK]: 'Last Week',
    [TIME_PERIODS.OLDER]: 'Older',
    urgent: 'Urgent',
    high: 'High Priority',
    normal: 'Normal Priority',
    low: 'Low Priority',
    all: 'All Items',
    uncategorized: 'Uncategorized',
  };

  return defaultTitles[groupKey] || groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
}