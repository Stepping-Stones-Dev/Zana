/**
 * Custom hooks for GroupingList component
 * Manages drag and drop, item interactions, and SlideOut state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  ListItem, 
  GroupingConfig, 
  DragAndDropState, 
  DragAndDropHandlers 
} from '../types';
import { 
  filterActiveItems, 
  applyGrouping, 
  getGroupDisplayOrder,
  getGroupDisplayTitle 
} from './grouping-utils';

/**
 * Hook for managing drag and drop functionality with enhanced reorder callbacks
 */
export function useDragAndDrop(
  items: ListItem[],
  isReorderable: boolean,
  onReorder?: (change: import('../types').ReorderChange) => void,
  onReorderSimple?: (items: ListItem[]) => void,
  groupedItems?: Record<string, ListItem[]>
): DragAndDropState & DragAndDropHandlers {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderableItems, setReorderableItems] = useState<ListItem[]>(items);
  const [dragContext, setDragContext] = useState<import('../types').DragContext | null>(null);

  // Sync items when prop changes
  useEffect(() => {
    setReorderableItems(items);
  }, [items]);

  // Create a flat index mapping for grouped items
  const createIndexMapping = useCallback(() => {
    if (!groupedItems) return null;
    
    const mapping: Array<{ item: ListItem; groupKey: string; groupIndex: number }> = [];
    Object.entries(groupedItems).forEach(([groupKey, groupItems]) => {
      groupItems.forEach((item, groupIndex) => {
        mapping.push({ item, groupKey, groupIndex });
      });
    });
    return mapping;
  }, [groupedItems]);

  const handleDragStart = useCallback((
    e: React.DragEvent, 
    index: number, 
    groupKey?: string, 
    groupIndex?: number
  ) => {
    if (!isReorderable) return;
    setDraggedIndex(index);
    setDragContext({
      sourceIndex: index,
      sourceGroupKey: groupKey,
      sourceGroupIndex: groupIndex,
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', (e.currentTarget as HTMLElement).outerHTML);
  }, [isReorderable]);

  const handleDragOver = useCallback((
    e: React.DragEvent, 
    index: number, 
    groupKey?: string, 
    groupIndex?: number
  ) => {
    if (!isReorderable || draggedIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
    
    // Update drag context with target information
    if (dragContext) {
      setDragContext({
        ...dragContext,
        targetIndex: index,
        targetGroupKey: groupKey,
        targetGroupIndex: groupIndex,
      });
    }
  }, [isReorderable, draggedIndex, dragContext]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent, 
    dropIndex: number, 
    groupKey?: string, 
    groupIndex?: number
  ) => {
    if (!isReorderable || draggedIndex === null || !dragContext) return;
    e.preventDefault();
    
    const originalItems = [...reorderableItems];
    const newItems = [...reorderableItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    // Create detailed change information
    const change: import('../types').ReorderChange = {
      newItems,
      movedItem: draggedItem,
      fromIndex: draggedIndex,
      toIndex: dropIndex,
      originalItems,
    };

    // Add group context if available
    if (dragContext.sourceGroupKey && groupKey) {
      change.groupContext = {
        fromGroup: dragContext.sourceGroupKey,
        toGroup: groupKey,
        fromGroupIndex: dragContext.sourceGroupIndex || 0,
        toGroupIndex: groupIndex || 0,
        isCrossGroupMove: dragContext.sourceGroupKey !== groupKey,
      };
    }
    
    setReorderableItems(newItems);
    
    // Call enhanced callback first
    onReorder?.(change);
    
    // Call simple callback for backward compatibility
    onReorderSimple?.(newItems);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragContext(null);
  }, [isReorderable, draggedIndex, reorderableItems, onReorder, onReorderSimple, dragContext]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragContext(null);
  }, []);

  return {
    draggedIndex,
    dragOverIndex,
    items: reorderableItems,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}

/**
 * Hook for managing grouped items with configuration
 */
export function useGroupedItems(
  items: ListItem[],
  groupingConfig: GroupingConfig,
  isReorderable: boolean,
  reorderableItems?: ListItem[]
) {
  const sourceItems = isReorderable && reorderableItems ? reorderableItems : items;
  
  const activeItems = useMemo(() => 
    filterActiveItems(sourceItems), 
    [sourceItems]
  );

  const groupedItems = useMemo(() => 
    applyGrouping(activeItems, groupingConfig),
    [activeItems, groupingConfig]
  );

  const groupOrder = useMemo(() =>
    getGroupDisplayOrder(groupedItems, groupingConfig),
    [groupedItems, groupingConfig]
  );

  const groupsWithTitles = useMemo(() =>
    groupOrder.map(groupKey => ({
      key: groupKey,
      title: getGroupDisplayTitle(groupKey, groupingConfig),
      items: groupedItems[groupKey],
      icon: groupingConfig.groupIcons?.[groupKey],
    })),
    [groupOrder, groupedItems, groupingConfig]
  );

  return {
    activeItems,
    groupedItems,
    groupOrder,
    groupsWithTitles,
  };
}

/**
 * Hook for managing item interactions (clicks and actions)
 */
export function useItemInteractions(
  onItemClick?: (item: ListItem) => void,
  onItemAction?: (action: string, itemId: string, item?: ListItem) => void
) {
  const handleItemClick = useCallback((item: ListItem) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemAction = useCallback((action: string, itemId: string, item?: ListItem) => {
    onItemAction?.(action, itemId, item);
  }, [onItemAction]);

  const handleKeyboardInteraction = useCallback((
    e: React.KeyboardEvent,
    callback: () => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }, []);

  return {
    handleItemClick,
    handleItemAction,
    handleKeyboardInteraction,
  };
}

/**
 * Hook for managing individual item state (including SlideOut)
 */
export function useItemState(itemId: string) {
  const [isSlideOutActive, setIsSlideOutActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSlideOut = useCallback(() => {
    setIsSlideOutActive(prev => !prev);
  }, []);

  const closeSlideOut = useCallback(() => {
    setIsSlideOutActive(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Close slide-out when clicking outside (handled by document listener)
  useEffect(() => {
    if (!isSlideOutActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const slideOutElement = document.querySelector(`[data-item-id="${itemId}"]`);
      
      if (slideOutElement && !slideOutElement.contains(target)) {
        setIsSlideOutActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSlideOutActive, itemId]);

  return {
    isSlideOutActive,
    isHovered,
    toggleSlideOut,
    closeSlideOut,
    handleMouseEnter,
    handleMouseLeave,
  };
}

/**
 * Hook for managing keyboard navigation within the list
 */
export function useKeyboardNavigation(
  items: ListItem[],
  onItemSelect?: (item: ListItem) => void
) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onItemSelect?.(items[focusedIndex]);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  }, [items, focusedIndex, onItemSelect]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  const setFocus = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
    }
  }, [items.length]);

  return {
    focusedIndex,
    handleKeyDown,
    resetFocus,
    setFocus,
  };
}

/**
 * Hook for analytics tracking
 */
export function useAnalytics(analyticsId: string = 'grouping-list') {
  const trackEvent = useCallback((eventType: string, itemId?: string, metadata?: Record<string, any>) => {
    // This would integrate with your analytics system
    const event = {
      id: `${analyticsId}.${eventType}`,
      itemId,
      timestamp: new Date().toISOString(),
      metadata,
    };
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
    
    // TODO: Replace with actual analytics implementation
    // analytics.track(event);
  }, [analyticsId]);

  const trackItemClick = useCallback((item: ListItem) => {
    trackEvent('item.click', item.id, {
      priority: item.priority,
      status: item.status,
      category: item.category,
    });
  }, [trackEvent]);

  const trackItemAction = useCallback((action: string, item: ListItem) => {
    trackEvent('item.action', item.id, {
      action,
      priority: item.priority,
      status: item.status,
    });
  }, [trackEvent]);

  const trackSlideOutToggle = useCallback((itemId: string, isOpen: boolean) => {
    trackEvent('slideout.toggle', itemId, { isOpen });
  }, [trackEvent]);

  return {
    trackEvent,
    trackItemClick,
    trackItemAction,
    trackSlideOutToggle,
  };
}