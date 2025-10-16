/**
 * GroupItem Component
 * Individual item component with localized SlideOut management
 */

import React, { useCallback } from 'react';
import { Chip } from '@heroui/react';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from '@heroicons/react/24/solid';
import { clsx as cx } from 'clsx';

import { SlideOutItem } from '../SlideOut';
import { useItemState, useAnalytics } from './hooks';
import { formatRelativeTime } from './grouping-utils';
import type { GroupItemProps, Priority } from '../types';

const PRIORITY_ICONS: Record<Priority, React.ReactNode> = {
  low: <ClockIcon className="w-4 h-4" />,
  normal: <BellIcon className="w-4 h-4" />,
  high: <ExclamationTriangleIcon className="w-4 h-4" />,
  urgent: <ExclamationTriangleIconSolid className="w-4 h-4" />,
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'default',
  normal: 'primary',
  high: 'warning', 
  urgent: 'danger',
};

/**
 * GroupItem - Individual list item with SlideOut actions
 * Manages its own state and interactions
 */
export const GroupItem: React.FC<GroupItemProps> = ({
  item,
  index,
  globalIndex,
  groupKey,
  groupIndex,
  actions = [],
  onItemClick,
  onItemAction,
  showActions = false,
  isReorderable = false,
  showReorderHandle = true,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedIndex,
  dragOverIndex,
  analyticsId = 'group-item',
  className,
}) => {
  const {
    isSlideOutActive,
    isHovered,
    toggleSlideOut,
    closeSlideOut,
    handleMouseEnter,
    handleMouseLeave,
  } = useItemState(item.id);

  const { trackItemClick, trackItemAction, trackSlideOutToggle } = useAnalytics(analyticsId);

  // Determine which index to use for drag operations
  const dragIndex = globalIndex ?? index;
  const isDragging = draggedIndex === dragIndex;
  const isDraggedOver = dragOverIndex === dragIndex;

  // Handle item click
  const handleClick = useCallback(() => {
    onItemClick?.(item);
    trackItemClick(item);
  }, [item, onItemClick, trackItemClick]);

  // Handle keyboard interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Handle slide-out toggle with analytics
  const handleSlideOutToggle = useCallback(() => {
    const newState = !isSlideOutActive;
    if (newState) {
      toggleSlideOut();
    } else {
      closeSlideOut();
    }
    trackSlideOutToggle(item.id, newState);
  }, [isSlideOutActive, toggleSlideOut, closeSlideOut, item.id, trackSlideOutToggle]);

  // Handle action clicks
  const handleActionClick = useCallback((actionId: string) => {
    onItemAction?.(actionId, item.id, item);
    trackItemAction(actionId, item);
    closeSlideOut(); // Auto-close after action
  }, [onItemAction, item, trackItemAction, closeSlideOut]);

  // Create enhanced actions with click handlers
  const enhancedActions = actions.map(action => ({
    ...action,
    onClick: () => handleActionClick(action.id),
  }));

  // Drag and drop handlers with group context
  const dragHandlers = isReorderable ? {
    onDragStart: (e: React.DragEvent) => onDragStart?.(e, dragIndex, groupKey, groupIndex),
    onDragOver: (e: React.DragEvent) => onDragOver?.(e, dragIndex, groupKey, groupIndex),
    onDragLeave: onDragLeave,
    onDrop: (e: React.DragEvent) => onDrop?.(e, dragIndex, groupKey, groupIndex),
    onDragEnd: onDragEnd,
  } : {};

  // Main item content
  const itemContent = (
    <div 
      className={cx(
        'flex items-start gap-3 p-3 transition-all duration-200',
        isDragging && 'opacity-50 scale-95',
        isDraggedOver && 'border-primary border-t-2',
      )}
      data-item-id={item.id}
    >
      {/* Reorder Handle */}
      {isReorderable && showReorderHandle && (
        <div
          className={cx(
            'flex items-center justify-center w-6 h-6 mt-1 cursor-grab active:cursor-grabbing',
            'text-foreground-400 hover:text-foreground-600 transition-colors',
            'flex-shrink-0',
            isHovered || isSlideOutActive ? 'opacity-100' : 'opacity-0'
          )}
          draggable
          onDragStart={dragHandlers.onDragStart}
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisHorizontalIcon className="w-4 h-4 rotate-90" />
          <EllipsisHorizontalIcon className="w-4 h-4 rotate-90 -ml-2" />
        </div>
      )}

      {/* Priority Icon */}
      <div className={cx(
        'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 mt-1',
        item.status === 'unread' ? 'bg-primary/10' : 'bg-default-100'
      )}>
        <div className={cx(
          item.status === 'unread' ? 'text-primary' : 'text-foreground-500'
        )}>
          {PRIORITY_ICONS[item.priority]}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cx(
            'text-sm line-clamp-1',
            item.status === 'unread' ? 'font-medium text-foreground' : 'font-normal text-foreground-700'
          )}>
            {item.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.status === 'unread' && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
            <Chip
              size="sm"
              variant="flat"
              color={PRIORITY_COLORS[item.priority] as any}
              className="text-xs"
            >
              {item.priority}
            </Chip>
          </div>
        </div>

        {/* Message */}
        {item.message && (
          <p className={cx(
            'text-xs mb-2 line-clamp-2',
            item.status === 'unread' ? 'text-foreground-600' : 'text-foreground-500'
          )}>
            {item.message}
          </p>
        )}

        {/* Footer: Timestamp and Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground-400">
            {formatRelativeTime(item.timestamp)}
          </span>
          {item.category && (
            <span className="px-2 py-1 bg-default-100 rounded-md text-xs text-foreground-500">
              {item.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Container classes with priority-based backgrounds
  const containerClasses = cx(
    'group cursor-pointer border-b border-divider last:border-b-0 transition-all duration-200',
    'hover:bg-content2/50 focus:bg-content2/70 focus:outline-none',
    // Priority-based background for unread items
    item.status === 'unread' && {
      'bg-danger/5': item.priority === 'urgent',
      'bg-warning/5': item.priority === 'high',
      'bg-primary/5': item.priority === 'normal',
      'bg-default/5': item.priority === 'low',
    },
    className
  );

  // If actions are enabled, wrap in SlideOutItem
  if (showActions && actions.length > 0) {
    return (
      <SlideOutItem
        id={item.id}
        actions={enhancedActions}
        isSlideOutActive={isSlideOutActive}
        onSlideOutToggle={handleSlideOutToggle}
        className={containerClasses}
        contentClassName="bg-transparent"
        analyticsId={`${analyticsId}.slideout`}
        aria-label={`${item.title} - ${item.priority} priority`}
        {...dragHandlers}
      >
        <div
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          tabIndex={0}
          role="button"
          className="w-full"
          data-analytics-id={`${analyticsId}.item.${item.id}`}
        >
          {itemContent}
        </div>
      </SlideOutItem>
    );
  }

  // Simple item without SlideOut
  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="button"
      data-analytics-id={`${analyticsId}.item.${item.id}`}
      data-item-id={item.id}
      aria-label={`${item.title} - ${item.priority} priority`}
      {...dragHandlers}
    >
      {itemContent}
    </div>
  );
};

export default GroupItem;