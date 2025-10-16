import React, { forwardRef, useCallback, useMemo } from 'react';
import { cx } from '../../../internal/internal';
import { Button, Link, Kbd } from '@heroui/react';
import type { MenuItemProps, MenuItem } from './types';

/**
 * Individual menu item component with support for different item types,
 * icons, active states, and accessibility features.
 */
export const MenuItemComponent = forwardRef<HTMLElement, MenuItemProps>(
  ({
    item,
    keyboardNavigation = false,
    focused = false,
    size = 'md',
    density = 'comfortable',
    showIcons = true,
    iconPosition = 'left',
    showTooltips = false,
    selectionMode = 'single',
    selected = false,
    onItemClick,
    onItemFocus,
    className,
    ...props
  }, ref) => {
    
    // Handle divider items
    if (item.type === 'divider') {
      return (
        <div
          className={cx(
            'menu-divider',
            'border-t border-gray-200 dark:border-gray-700',
            'my-1',
            item.label && 'relative',
            className
          )}
          role="separator"
        >
          {item.label && (
            <span className="absolute left-3 -top-2 bg-white dark:bg-gray-800 px-2 text-xs text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
          )}
        </div>
      );
    }

    // Handle custom items
    if (item.type === 'custom') {
      return (
        <div
          className={cx(
            'menu-item menu-item-custom',
            className
          )}
          data-testid={item['data-testid']}
        >
          {item.render({ active: item.active, disabled: item.disabled })}
        </div>
      );
    }

    const isDisabled = 'disabled' in item && item.disabled;
    const isActive = 'active' in item && item.active;
    
    // Size and density classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-sm min-h-6',
      md: 'px-3 py-2 text-sm min-h-8',
      lg: 'px-4 py-3 text-base min-h-10'
    }[size];

    const densityClasses = {
      compact: 'py-1',
      comfortable: 'py-2',
      spacious: 'py-3'
    }[density];

    // Icon size based on menu size
    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size];

    // Base menu item classes
    const baseClasses = cx(
      'menu-item',
      'flex items-center justify-between',
      'w-full text-left',
      'rounded-md transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      sizeClasses,
      densityClasses,
      
      // State classes
      isActive && 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium',
      !isActive && !isDisabled && 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
      isDisabled && 'text-gray-400 dark:text-gray-500 cursor-not-allowed',
      focused && keyboardNavigation && 'ring-2 ring-blue-500 ring-offset-1',
      selected && selectionMode === 'multiple' && 'bg-blue-50 dark:bg-blue-900/20',
      
      className
    );

    // Handle click events
    const handleClick = useCallback((event: React.MouseEvent) => {
      if (isDisabled) return;
      
      onItemClick?.(item, event);
      onItemFocus?.(item);
    }, [item, isDisabled, onItemClick, onItemFocus]);

    // Handle keyboard events
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (isDisabled) return;
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onItemClick?.(item, event);
      }
    }, [item, isDisabled, onItemClick]);

    // Handle focus events
    const handleFocus = useCallback(() => {
      if (!isDisabled) {
        onItemFocus?.(item);
      }
    }, [item, isDisabled, onItemFocus]);

    // Render icon if present and enabled
    const renderIcon = () => {
      if (!showIcons || !('icon' in item) || !item.icon) return null;
      
      return (
        <span className={cx('menu-item-icon', iconSize, 'flex-shrink-0')}>
          {item.icon}
        </span>
      );
    };

    // Render shortcut if present
    const renderShortcut = () => {
      if (item.type !== 'action' || !item.shortcut) return null;
      
      return (
        <Kbd className="ml-auto text-xs">
          {item.shortcut}
        </Kbd>
      );
    };

    // Render selection indicator for multiple selection
    const renderSelectionIndicator = () => {
      if (selectionMode !== 'multiple') return null;
      
      return (
        <div className={cx(
          'menu-item-checkbox w-4 h-4 rounded border border-gray-300 dark:border-gray-600 mr-2',
          selected && 'bg-blue-500 border-blue-500',
        )}>
          {selected && (
            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      );
    };

    // Content layout based on icon position
    const renderContent = () => {
      const icon = renderIcon();
      const text = <span className="menu-item-text flex-1 truncate">{'label' in item ? item.label : ''}</span>;
      const shortcut = renderShortcut();
      const checkbox = renderSelectionIndicator();
      
      const contentClasses = cx(
        'flex items-center w-full',
        iconPosition === 'top' && 'flex-col',
        iconPosition === 'bottom' && 'flex-col-reverse',
      );

      return (
        <div className={contentClasses}>
          {checkbox}
          {(iconPosition === 'left' || iconPosition === 'top') && icon && (
            <span className={cx(iconPosition === 'left' && 'mr-3', iconPosition === 'top' && 'mb-1')}>
              {icon}
            </span>
          )}
          {text}
          {(iconPosition === 'right' || iconPosition === 'bottom') && icon && (
            <span className={cx(iconPosition === 'right' && 'ml-3', iconPosition === 'bottom' && 'mt-1')}>
              {icon}
            </span>
          )}
          {shortcut}
        </div>
      );
    };

    // Common props for both button and link variants
    const commonProps = {
      className: baseClasses,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      disabled: isDisabled,
      'data-testid': 'data-testid' in item ? item['data-testid'] : undefined,
      'data-analytics-id': 'analyticsId' in item ? item.analyticsId : undefined,
      'aria-label': 'tooltip' in item && item.tooltip ? item.tooltip : ('label' in item ? item.label : undefined),
      'aria-current': isActive ? ('page' as const) : undefined,
      'aria-selected': selected,
      tabIndex: focused ? 0 : -1,
      role: 'menuitem',
      ...props
    };

    // Render as link for link items
    if (item.type === 'link') {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={item.href}
          isExternal={item.external}
          download={item.download}
          {...commonProps}
        >
          {renderContent()}
        </Link>
      );
    }

    // Render as button for action items
    return (
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        variant="light"
        {...commonProps}
      >
        {renderContent()}
      </Button>
    );
  }
);

MenuItemComponent.displayName = 'MenuItem';