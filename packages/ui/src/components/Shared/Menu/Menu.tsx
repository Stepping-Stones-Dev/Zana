import React, { forwardRef, useCallback, useRef, useEffect } from 'react';
import { cx } from '../../../internal/internal';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { useMenu } from './useMenu';
import { MenuItemComponent } from './MenuItem';
import { MenuGroup } from './MenuGroup';
import type { MenuProps, MenuItem, MenuGroup as MenuGroupType } from './types';

/**
 * Main Menu component that can be used for navigation menus, context menus,
 * dropdown menus, and sidenavs. Supports keyboard navigation, accessibility,
 * icons, active states, and industry-standard menu patterns.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(({
  items = [],
  children,
  open,
  trigger,
  placement = 'bottom',
  inline = false,
  layout = {},
  behavior = {},
  accessibility = {},
  className,
  groupStates,
  onSelectionChange,
  onOpenChange,
  onItemActivate,
  onGroupToggle,
  ...props
}, ref) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Merge default layout options
  const layoutConfig = {
    orientation: 'vertical',
    size: 'md',
    density: 'comfortable',
    showIcons: true,
    iconPosition: 'left',
    showTooltips: false,
    ...layout
  } as const;

  // Merge default behavior options  
  const behaviorConfig = {
    keyboardNavigation: true,
    autoFocus: false,
    closeOnClickOutside: true,
    closeOnEscape: true,
    closeOnSelect: true,
    selectionMode: 'single' as const,
    selectedItems: [] as string[],
    allowDeselect: true,
    ...behavior
  };

  // Create menu configuration
  const menuConfig = {
    items,
    layout: layoutConfig,
    behavior: behaviorConfig,
    accessibility,
    onSelectionChange,
    onOpenChange,
    onItemActivate
  };

  // Use menu hook for state management
  const {
    menuProps,
    focusedItemId,
    selectedItems,
    handleItemClick,
    keyboardNavigationActive,
    registerItemRef
  } = useMenu(menuConfig) as ReturnType<typeof useMenu> & {
    keyboardNavigationActive: boolean;
    registerItemRef: (itemId: string, element: HTMLElement | null) => void;
  };

  // Handle group toggle
  const handleGroupToggle = useCallback((groupId: string, expanded: boolean) => {
    // Call external callback if provided
    if (onGroupToggle) {
      onGroupToggle(groupId, expanded);
    }
    // Could be used for analytics or state management
    console.debug(`Menu group ${groupId} ${expanded ? 'expanded' : 'collapsed'}`);
  }, [onGroupToggle]);

  // Handle item focus for keyboard navigation
  const handleItemFocus = useCallback((item: MenuItem) => {
    // This could be enhanced to support focus management
  }, []);

  // Click outside handler for overlay menus
  useEffect(() => {
    if (!inline && open && behaviorConfig.closeOnClickOutside) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          onOpenChange?.(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [inline, open, behaviorConfig.closeOnClickOutside, onOpenChange]);

  // Menu container classes
  const menuClasses = cx(
    'menu',
    'bg-white dark:bg-gray-800',
    'rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
    'py-1',
    'min-w-48',
    layoutConfig.orientation === 'horizontal' && 'flex flex-row space-x-1 space-y-0',
    layoutConfig.orientation === 'vertical' && 'flex flex-col space-y-0.5',
    layoutConfig.maxWidth && typeof layoutConfig.maxWidth === 'string' 
      ? `max-w-[${layoutConfig.maxWidth}]` 
      : layoutConfig.maxWidth && `max-w-[${layoutConfig.maxWidth}px]`,
    layoutConfig.minWidth && typeof layoutConfig.minWidth === 'string'
      ? `min-w-[${layoutConfig.minWidth}]`
      : layoutConfig.minWidth && `min-w-[${layoutConfig.minWidth}px]`,
    inline && 'border-none shadow-none bg-transparent',
    className
  );

  // Render menu content
  const renderMenuContent = () => {
    if (children) {
      return children;
    }

    return items.map((item) => {
      // Handle menu groups
      if ('items' in item) {
        return (
          <MenuGroup
            key={item.id}
            group={item as MenuGroupType}
            keyboardNavigation={keyboardNavigationActive}
            focusedItemId={focusedItemId || undefined}
            layout={layoutConfig}
            selectionMode={behaviorConfig.selectionMode}
            selectedItems={selectedItems}
            collapsed={groupStates?.[item.id]}
            onItemClick={handleItemClick}
            onItemFocus={handleItemFocus}
            onGroupToggle={handleGroupToggle}
          />
        );
      }

      // Handle individual menu items
      return (
        <MenuItemComponent
          key={item.id}
          item={item as MenuItem}
          keyboardNavigation={keyboardNavigationActive}
          focused={focusedItemId === item.id}
          size={layoutConfig.size}
          density={layoutConfig.density}
          showIcons={layoutConfig.showIcons}
          iconPosition={layoutConfig.iconPosition}
          showTooltips={layoutConfig.showTooltips}
          selectionMode={behaviorConfig.selectionMode}
          selected={selectedItems.includes(item.id)}
          onItemClick={handleItemClick}
          onItemFocus={handleItemFocus}
        />
      );
    });
  };

  // Menu container component
  const MenuContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className: containerClassName, ...containerProps }, containerRef) => (
      <div
        ref={containerRef}
        className={cx(menuClasses, containerClassName)}
        {...menuProps}
        {...containerProps}
      >
        {renderMenuContent()}
      </div>
    )
  );

  MenuContainer.displayName = 'MenuContainer';

  // Render inline menu
  if (inline) {
    return (
      <MenuContainer
        ref={ref || menuRef}
        {...props}
      />
    );
  }

  // Render overlay menu with trigger
  const validPlacement = placement === 'auto' ? 'bottom' : placement;
  
  return (
    <Popover 
      isOpen={open}
      onOpenChange={onOpenChange}
      placement={validPlacement}
    >
      {trigger && (
        <PopoverTrigger>
          {trigger}
        </PopoverTrigger>
      )}
      <PopoverContent className="p-0">
        <MenuContainer
          ref={ref || menuRef}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
});

Menu.displayName = 'Menu';