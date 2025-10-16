import React, { useState, useCallback } from 'react';
import { cx } from '../../../internal/internal';
import { Button } from '@heroui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { MenuItemComponent } from './MenuItem';
import type { MenuGroupProps } from './types';

/**
 * Menu group component for organizing related menu items with optional
 * collapsible functionality and group headers.
 */
export const MenuGroup: React.FC<MenuGroupProps> = ({
  group,
  keyboardNavigation = false,
  focusedItemId,
  layout,
  selectionMode = 'single',
  selectedItems = [],
  collapsed,
  onItemClick,
  onItemFocus,
  onGroupToggle,
  className,
  ...props
}) => {
  // Track collapsed state for collapsible groups
  // Use controlled prop if provided, otherwise use internal state
  const [internalCollapsed, setInternalCollapsed] = useState(group.defaultCollapsed || false);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  
  // Handle group toggle
  const handleToggle = useCallback(() => {
    if (!group.collapsible) return;
    
    const newCollapsed = !isCollapsed;
    
    // Update internal state only if not controlled
    if (collapsed === undefined) {
      setInternalCollapsed(newCollapsed);
    }
    
    // Always call the callback to notify parent
    onGroupToggle?.(group.id, !newCollapsed);
  }, [group.collapsible, group.id, isCollapsed, collapsed, onGroupToggle]);

  // Filter out empty groups
  if (group.items.length === 0) {
    return null;
  }

  const groupClasses = cx(
    'menu-group',
    'space-y-0.5',
    className
  );

  const headerClasses = cx(
    'menu-group-header',
    'flex items-center justify-between',
    'px-3 py-2',
    'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    group.collapsible && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200',
    !group.collapsible && 'cursor-default'
  );

  const itemsClasses = cx(
    'menu-group-items',
    'space-y-0.5',
    isCollapsed && 'hidden'
  );

  return (
    <div
      className={groupClasses}
      data-menu-group-id={group.id}
      role="group"
      aria-labelledby={group.title ? `menu-group-${group.id}-header` : undefined}
      data-collapsible={group.collapsible ? 'true' : 'false'}
      data-collapsed={group.collapsible ? (isCollapsed ? 'true' : 'false') : 'false'}
      {...props}
    >
      {/* Group Header */}
      {group.title && (
        <div
          id={`menu-group-${group.id}-header`}
          className={headerClasses}
          onClick={group.collapsible ? handleToggle : undefined}
          onKeyDown={group.collapsible ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleToggle();
            }
          } : undefined}
          tabIndex={group.collapsible ? 0 : -1}
          role={group.collapsible ? 'button' : undefined}
          aria-expanded={group.collapsible ? !isCollapsed : undefined}
          aria-controls={group.collapsible ? `menu-group-${group.id}-items` : undefined}
        >
          <span className="menu-group-title">
            {group.title}
          </span>
          
          {/* Collapse/Expand Icon */}
          {group.collapsible && (
            <span className="menu-group-toggle w-4 h-4">
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      )}

      {/* Group Items */}
      <div
        id={`menu-group-${group.id}-items`}
        className={itemsClasses}
        role="none"
      >
        {group.items.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            keyboardNavigation={keyboardNavigation}
            focused={focusedItemId === item.id}
            size={layout?.size}
            density={layout?.density}
            showIcons={layout?.showIcons}
            iconPosition={layout?.iconPosition}
            showTooltips={layout?.showTooltips}
            selectionMode={selectionMode}
            selected={selectedItems.includes(item.id)}
            onItemClick={onItemClick}
            onItemFocus={onItemFocus}
          />
        ))}
      </div>
    </div>
  );
};