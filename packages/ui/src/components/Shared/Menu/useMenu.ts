import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { MenuItem, MenuGroup, MenuConfig, UseMenuReturn } from './types';

/**
 * Flattens menu items from groups and individual items
 */
function flattenMenuItems(items: (MenuItem | MenuGroup)[]): MenuItem[] {
  const flattened: MenuItem[] = [];
  
  for (const item of items) {
    if ('items' in item) {
      // It's a MenuGroup
      flattened.push(...item.items);
    } else {
      // It's a MenuItem
      flattened.push(item);
    }
  }
  
  return flattened.filter(item => item.type !== 'divider');
}

/**
 * Gets focusable menu items (excludes disabled and divider items)
 */
function getFocusableItems(items: MenuItem[]): MenuItem[] {
  return items.filter(item => 
    item.type !== 'divider' && 
    !('disabled' in item && item.disabled)
  );
}

/**
 * Custom hook for managing menu state and interactions
 */
export function useMenu(config: MenuConfig): UseMenuReturn {
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    config.behavior?.selectedItems || []
  );
  
  // Flatten all menu items for easier navigation
  const allItems = useMemo(() => flattenMenuItems(config.items), [config.items]);
  const focusableItems = useMemo(() => getFocusableItems(allItems), [allItems]);
  
  // Track keyboard navigation state
  const [keyboardNavigationActive, setKeyboardNavigationActive] = useState(false);
  
  // Refs for managing focus
  const menuRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Register item refs
  const registerItemRef = useCallback((itemId: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(itemId, element);
    } else {
      itemRefs.current.delete(itemId);
    }
  }, []);
  
  // Focus management
  const focusItem = useCallback((itemId: string) => {
    const item = focusableItems.find(item => item.id === itemId);
    if (!item) return;
    
    setFocusedItemId(itemId);
    setKeyboardNavigationActive(true);
    
    // Focus the actual DOM element
    const element = itemRefs.current.get(itemId);
    if (element) {
      element.focus();
    }
  }, [focusableItems]);
  
  const focusNext = useCallback(() => {
    if (focusableItems.length === 0) return;
    
    const currentIndex = focusedItemId 
      ? focusableItems.findIndex(item => item.id === focusedItemId)
      : -1;
    
    const nextIndex = currentIndex >= focusableItems.length - 1 ? 0 : currentIndex + 1;
    focusItem(focusableItems[nextIndex].id);
  }, [focusableItems, focusedItemId, focusItem]);
  
  const focusPrevious = useCallback(() => {
    if (focusableItems.length === 0) return;
    
    const currentIndex = focusedItemId 
      ? focusableItems.findIndex(item => item.id === focusedItemId)
      : -1;
    
    const prevIndex = currentIndex <= 0 ? focusableItems.length - 1 : currentIndex - 1;
    focusItem(focusableItems[prevIndex].id);
  }, [focusableItems, focusedItemId, focusItem]);
  
  // Item selection logic
  const handleItemSelect = useCallback((item: MenuItem) => {
    const selectionMode = config.behavior?.selectionMode || 'single';
    
    if (selectionMode === 'none') return;
    
    let newSelectedItems: string[];
    
    if (selectionMode === 'single') {
      newSelectedItems = [item.id];
    } else if (selectionMode === 'multiple') {
      const isCurrentlySelected = selectedItems.includes(item.id);
      const allowDeselect = config.behavior?.allowDeselect !== false;
      
      if (isCurrentlySelected && allowDeselect) {
        newSelectedItems = selectedItems.filter(id => id !== item.id);
      } else if (!isCurrentlySelected) {
        newSelectedItems = [...selectedItems, item.id];
      } else {
        newSelectedItems = selectedItems;
      }
    } else {
      newSelectedItems = selectedItems;
    }
    
    setSelectedItems(newSelectedItems);
    config.onSelectionChange?.(newSelectedItems);
  }, [config, selectedItems]);
  
  // Item interaction handler
  const handleItemClick = useCallback((item: MenuItem, event: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent default for keyboard events
    if (event.type === 'keydown') {
      event.preventDefault();
    }
    
    // Handle selection
    handleItemSelect(item);
    
    // Handle item-specific actions
    if (item.type === 'action' && !('disabled' in item && item.disabled)) {
      item.onClick(item.id, event);
    } else if (item.type === 'link' && !('disabled' in item && item.disabled)) {
      if (!item.external && !event.metaKey && !event.ctrlKey) {
        // Let the browser handle navigation naturally for internal links
        // unless modifier keys are pressed
      }
    }
    
    // Notify parent of activation
    config.onItemActivate?.(item.id, item);
    
    // Close menu if configured to do so
    if (config.behavior?.closeOnSelect) {
      config.onOpenChange?.(false);
    }
  }, [config, handleItemSelect]);
  
  const selectCurrentItem = useCallback(() => {
    if (!focusedItemId) return;
    
    const item = focusableItems.find(item => item.id === focusedItemId);
    if (!item) return;
    
    // Create a synthetic keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true
    }) as unknown as React.KeyboardEvent;
    
    handleItemClick(item, event);
  }, [focusedItemId, focusableItems, handleItemClick]);
  
  // Keyboard event handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key, altKey, ctrlKey, metaKey } = event;
    
    // Don't handle if modifier keys are pressed (except for specific shortcuts)
    if (altKey || ctrlKey || metaKey) return;
    
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setKeyboardNavigationActive(true);
        if (config.behavior?.keyboardNavigation !== false) {
          focusNext();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setKeyboardNavigationActive(true);
        if (config.behavior?.keyboardNavigation !== false) {
          focusPrevious();
        }
        break;
        
      case 'Home':
        event.preventDefault();
        setKeyboardNavigationActive(true);
        if (config.behavior?.keyboardNavigation !== false && focusableItems.length > 0) {
          focusItem(focusableItems[0].id);
        }
        break;
        
      case 'End':
        event.preventDefault();
        setKeyboardNavigationActive(true);
        if (config.behavior?.keyboardNavigation !== false && focusableItems.length > 0) {
          focusItem(focusableItems[focusableItems.length - 1].id);
        }
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectCurrentItem();
        break;
        
      case 'Escape':
        if (config.behavior?.closeOnEscape !== false) {
          config.onOpenChange?.(false);
        }
        break;
        
      default:
        // Handle character navigation (type-ahead)
        if (key.length === 1 && !ctrlKey && !altKey && !metaKey) {
          const typedChar = key.toLowerCase();
          const matchingItem = focusableItems.find(item => {
            const label = 'label' in item && item.label ? item.label.toLowerCase() : '';
            return label.startsWith(typedChar);
          });
          
          if (matchingItem) {
            focusItem(matchingItem.id);
          }
        }
        break;
    }
  }, [config, focusableItems, focusNext, focusPrevious, focusItem, selectCurrentItem]);
  
  // Auto-focus first item when menu opens
  useEffect(() => {
    if (config.behavior?.autoFocus && focusableItems.length > 0 && !focusedItemId) {
      // Delay to ensure menu is rendered
      setTimeout(() => {
        focusItem(focusableItems[0].id);
      }, 0);
    }
  }, [config.behavior?.autoFocus, focusableItems, focusedItemId, focusItem]);
  
  // Mouse interaction handling - disable keyboard navigation visual cues
  const handleMouseMove = useCallback(() => {
    setKeyboardNavigationActive(false);
  }, []);
  
  // Create menu props
  const menuProps = useMemo(() => ({
    role: config.accessibility?.role || 'menu',
    'aria-label': config.accessibility?.['aria-label'],
    'aria-labelledby': config.accessibility?.['aria-labelledby'],
    'aria-describedby': config.accessibility?.['aria-describedby'],
    onKeyDown: handleKeyDown,
    onMouseMove: handleMouseMove,
    tabIndex: -1, // Menu container should not be directly focusable
  }), [config.accessibility, handleKeyDown, handleMouseMove]);
  
  return {
    menuProps,
    focusedItemId,
    selectedItems,
    focusItem,
    focusNext,
    focusPrevious,
    selectCurrentItem,
    handleItemClick,
    // Internal API for components
    keyboardNavigationActive,
    registerItemRef,
  } as UseMenuReturn & {
    keyboardNavigationActive: boolean;
    registerItemRef: (itemId: string, element: HTMLElement | null) => void;
  };
}