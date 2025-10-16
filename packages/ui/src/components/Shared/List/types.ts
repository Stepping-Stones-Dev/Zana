/**
 * Type definitions for GroupingList components
 */

import type { ReactNode } from 'react';
import type { SlideOutAction } from './SlideOut';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type Status = 'unread' | 'read' | 'archived';

export interface ListItem {
  id: string;
  title: string;
  message?: string;
  timestamp: Date;
  priority: Priority;
  status: Status;
  category?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface BadgeMetric {
  id: string;
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  variant: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  condition: (item: ListItem) => boolean;
  priority?: number; // Higher numbers shown first
}

export interface GroupingConfig {
  groupByPriority?: boolean;
  groupByTime?: boolean;
  groupByCategory?: boolean;
  showUnreadFirst?: boolean;
  maxItemsPerGroup?: number;
  // Custom grouping function
  customGrouping?: (items: ListItem[]) => Record<string, ListItem[]>;
  // Custom group order
  groupOrder?: string[];
  // Custom group titles
  groupTitles?: Record<string, string>;
  // Custom group icons
  groupIcons?: Record<string, ReactNode>;
  // Custom badge metrics
  badgeMetrics?: BadgeMetric[];
  // Show total count badge
  showTotalCount?: boolean;
}

export interface ReorderChange {
  /** The complete reordered items list */
  newItems: ListItem[];
  /** The item that was moved */
  movedItem: ListItem;
  /** Original index in the flat list */
  fromIndex: number;
  /** New index in the flat list */
  toIndex: number;
  /** Group context if items are grouped */
  groupContext?: {
    /** Source group key */
    fromGroup: string;
    /** Target group key */
    toGroup: string;
    /** Index within the source group */
    fromGroupIndex: number;
    /** Index within the target group */
    toGroupIndex: number;
    /** Whether this is a cross-group move */
    isCrossGroupMove: boolean;
  };
  /** The original items before the change */
  originalItems: ListItem[];
}

export interface GroupingListProps {
  items: ListItem[];
  onItemClick?: (item: ListItem) => void;
  onItemAction?: (action: string, itemId: string, item?: ListItem) => void;
  groupingConfig?: GroupingConfig;
  itemActions?: SlideOutAction[];
  showItemActions?: boolean;
  emptyStateMessage?: string;
  className?: string;
  analyticsId?: string;
  // Drag and Drop props
  isReorderable?: boolean;
  showReorderHandle?: boolean;
  /** Enhanced reorder callback with detailed change information */
  onReorder?: (change: ReorderChange) => void;
  /** Simple callback for just the new items array (backward compatibility) */
  onReorderSimple?: (items: ListItem[]) => void;
  minimised?: boolean;
  minimisedCount?: number;
}

export interface GroupItemProps {
  item: ListItem;
  index: number;
  globalIndex?: number;
  groupKey?: string;
  groupIndex?: number;
  actions?: SlideOutAction[];
  onItemClick?: (item: ListItem) => void;
  onItemAction?: (action: string, itemId: string, item?: ListItem) => void;
  showActions?: boolean;
  isReorderable?: boolean;
  showReorderHandle?: boolean;
  onDragStart?: (e: React.DragEvent, index: number, groupKey?: string, groupIndex?: number) => void;
  onDragOver?: (e: React.DragEvent, index: number, groupKey?: string, groupIndex?: number) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, index: number, groupKey?: string, groupIndex?: number) => void;
  onDragEnd?: () => void;
  draggedIndex?: number | null;
  dragOverIndex?: number | null;
  analyticsId?: string;
  className?: string;
}

export interface GroupHeaderProps {
  title: string;
  items: ListItem[];
  groupingConfig: GroupingConfig;
  icon?: ReactNode;
  className?: string;
}

export interface DragAndDropState {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  items: ListItem[];
}

export interface DragAndDropHandlers {
  handleDragStart: (e: React.DragEvent, index: number, groupKey?: string, groupIndex?: number) => void;
  handleDragOver: (e: React.DragEvent, index: number, groupKey?: string, groupIndex?: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, dropIndex: number, groupKey?: string, groupIndex?: number) => void;
  handleDragEnd: () => void;
}

export interface DragContext {
  sourceIndex: number;
  sourceGroupKey?: string;
  sourceGroupIndex?: number;
  targetIndex?: number;
  targetGroupKey?: string;
  targetGroupIndex?: number;
}