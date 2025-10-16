import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '@heroui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { clsx as cx } from 'clsx';

export interface SlideOutAction {
  id: string;
  label: string;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  isDisabled?: boolean;
  onClick: () => void;
  analyticsId?: string;
}

export interface SlideOutItemProps {
  id: string;
  children: ReactNode;
  actions: SlideOutAction[];
  isSlideOutActive?: boolean;
  onSlideOutToggle?: (id: string | null) => void;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
  showTrigger?: boolean;
  triggerClassName?: string;
  analyticsId?: string;
  'aria-label'?: string;
}

export interface SlideOutProps {
  activeSlideOutId: string | null;
  onSlideOutChange: (id: string | null) => void;
}

/**
 * SlideOutItem - A reusable component that provides slide-out management actions
 * similar to the NotificationPanel pattern but more generic and reusable.
 */
export const SlideOutItem: React.FC<SlideOutItemProps> = ({
  id,
  children,
  actions,
  isSlideOutActive = false,
  onSlideOutToggle,
  className,
  contentClassName,
  actionsClassName,
  showTrigger = true,
  triggerClassName,
  analyticsId = 'slide-out-item',
  'aria-label': ariaLabel,
}) => {
  const handleSlideOutToggle = useCallback(() => {
    onSlideOutToggle?.(id);
  }, [id, onSlideOutToggle]);

  const handleActionClick = useCallback((action: SlideOutAction, event: React.MouseEvent) => {
    event.stopPropagation();
    action.onClick();
    // Auto-close slide-out after action
    onSlideOutToggle?.(null);
  }, [onSlideOutToggle]);

  // Calculate the width of the actions area
  const actionsWidth = Math.max(80, actions.length * 80); // Minimum 80px, 80px per action
  
  // Get action button styles
  const getActionButtonStyles = (action: SlideOutAction) => {
    const baseStyles = 'flex-1 h-full rounded-none border-none m-0 flex items-center justify-center text-white';
    const colorStyles = {
      primary: 'bg-blue-500 hover:bg-blue-600',
      secondary: 'bg-gray-500 hover:bg-gray-600',
      success: 'bg-green-500 hover:bg-green-600',
      warning: 'bg-orange-500 hover:bg-orange-600',
      danger: 'bg-red-500 hover:bg-red-600',
      default: 'bg-gray-400 hover:bg-gray-500',
    };
    return cx(baseStyles, colorStyles[action.color || 'default']);
  };

  return (
    <div
      className={cx(
        'relative group overflow-hidden transition-all duration-300',
        className
      )}
      data-analytics-id={`${analyticsId}.container.${id}`}
      aria-label={ariaLabel}
    >
      {/* Slide-out action buttons background - fixed positioning */}
      <div 
        className={cx(
          'absolute top-0 right-0 h-full flex flex-row items-center justify-center transition-transform duration-300 z-10 bg-content1 border-l border-divider',
          isSlideOutActive ? 'translate-x-0' : 'translate-x-full',
          actionsClassName
        )}
        style={{ 
          width: `${actionsWidth}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
            color={action.color || 'default'}
            variant={action.variant || 'solid'}
            size="sm"
            className={getActionButtonStyles(action)}
            isDisabled={action.isDisabled}
            onPress={(e) => handleActionClick(action, e as any)}
            data-analytics-id={`${analyticsId}.action.${action.id}.${id}`}
            aria-label={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </div>

      {/* Main content - slides left to reveal actions */}
      <div 
        className={cx(
          'relative transition-transform duration-300 bg-transparent w-full h-full',
          contentClassName
        )}
        style={{
          transform: isSlideOutActive ? `translateX(-${actionsWidth}px)` : 'translateX(0)',
        }}
      >
        <div className="flex items-center justify-between w-full h-full">
          {/* Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Slide-out trigger button */}
          {showTrigger && (
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className={cx(
                  "min-w-6 w-6 h-6 hover:bg-default-200/70 rounded-md",
                  triggerClassName
                )}
                onPress={handleSlideOutToggle}
                data-analytics-id={`${analyticsId}.trigger.${id}`}
                aria-label="Show actions"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * SlideOut - A hook-like component that manages slide-out state
 * and provides click-outside functionality
 */
export const useSlideOut = (): SlideOutProps & {
  toggleSlideOut: (id: string | null) => void;
  closeSlideOut: () => void;
  isSlideOutActive: (id: string) => boolean;
} => {
  const [activeSlideOutId, setActiveSlideOutId] = useState<string | null>(null);

  // Handle click outside to close slide-out
  useEffect(() => {
    if (!activeSlideOutId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const slideOutElement = document.querySelector(`[data-analytics-id*="${activeSlideOutId}"]`);
      
      if (slideOutElement && !slideOutElement.contains(target)) {
        setActiveSlideOutId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeSlideOutId]);

  const toggleSlideOut = useCallback((id: string | null) => {
    if (id === null) {
      setActiveSlideOutId(null);
    } else {
      setActiveSlideOutId(prev => prev === id ? null : id);
    }
  }, []);

  const closeSlideOut = useCallback(() => {
    setActiveSlideOutId(null);
  }, []);

  const isSlideOutActive = useCallback((id: string) => {
    return activeSlideOutId === id;
  }, [activeSlideOutId]);

  const handleSlideOutChange = useCallback((id: string | null) => {
    setActiveSlideOutId(id);
  }, []);

  return {
    activeSlideOutId,
    onSlideOutChange: handleSlideOutChange,
    toggleSlideOut,
    closeSlideOut,
    isSlideOutActive,
  };
};

/**
 * SlideOutContainer - A wrapper component that provides slide-out context
 * for multiple slide-out items
 */
export interface SlideOutContainerProps {
  children: ReactNode;
  className?: string;
  analyticsId?: string;
}

export const SlideOutContainer: React.FC<SlideOutContainerProps> = ({
  children,
  className,
  analyticsId = 'slide-out-container',
}) => {
  const slideOut = useSlideOut();

  return (
    <div 
      className={cx('relative', className)}
      data-analytics-id={analyticsId}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SlideOutItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            ...slideOut,
            isSlideOutActive: slideOut.isSlideOutActive(child.props.id),
            onSlideOutToggle: slideOut.toggleSlideOut,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

export default SlideOutItem;