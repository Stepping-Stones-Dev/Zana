import { useState, useEffect, useMemo, useCallback } from 'react';
import type { SideBarItem, SideBarItemType, ResponsiveConfig } from './types';

/**
 * Enhanced hook for managing enhanced sidebar state and behavior
 */
export function useEnhancedSideBar({
  items,
  defaultSelectedKey,
  responsive,
  onSelect
}: {
  items: SideBarItem[];
  defaultSelectedKey?: string;
  responsive?: ResponsiveConfig;
  onSelect?: (key: string) => void;
}) {
  
  // Window size state for responsive behavior
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1200, height: 800 }; // Default for SSR
  });

  // Selected item state
  const [selectedKey, setSelectedKey] = useState(defaultSelectedKey || '');

  // Accordion states for nested items
  const [accordionStates, setAccordionStates] = useState<Record<string, boolean>>({});

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Determine current breakpoint
  const breakpoint = useMemo(() => {
    const width = windowSize.width;
    const mobile = responsive?.mobile ?? 768;
    const tablet = responsive?.tablet ?? 1024;

    if (width < mobile) return 'mobile';
    if (width < tablet) return 'tablet';
    return 'desktop';
  }, [windowSize.width, responsive]);

  // Check if should auto-collapse
  const shouldAutoCollapse = useMemo(() => {
    return responsive?.autoCollapseBelow ? 
      windowSize.width < responsive.autoCollapseBelow : 
      breakpoint === 'mobile';
  }, [windowSize.width, responsive?.autoCollapseBelow, breakpoint]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const filterItems = (items: SideBarItem[]): SideBarItem[] => {
      return items.reduce<SideBarItem[]>((acc, item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.textValue?.toLowerCase().includes(searchQuery.toLowerCase());

        if (item.items && item.items.length > 0) {
          const filteredSubItems = filterItems(item.items);
          if (matchesSearch || filteredSubItems.length > 0) {
            acc.push({
              ...item,
              items: filteredSubItems.length > 0 ? filteredSubItems : item.items
            });
          }
        } else if (matchesSearch) {
          acc.push(item);
        }

        return acc;
      }, []);
    };

    return filterItems(items);
  }, [items, searchQuery]);

  // Find active item recursively
  const findActiveItem = useCallback((items: SideBarItem[], key: string): SideBarItem | null => {
    for (const item of items) {
      if (item.key === key) {
        return item;
      }
      if (item.items) {
        const found = findActiveItem(item.items, key);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Get active item
  const activeItem = useMemo(() => {
    return findActiveItem(items, selectedKey);
  }, [items, selectedKey, findActiveItem]);

  // Handle item selection
  const handleItemSelect = useCallback((key: string) => {
    setSelectedKey(key);
    onSelect?.(key);
  }, [onSelect]);

  // Toggle accordion state
  const toggleAccordion = useCallback((key: string) => {
    setAccordionStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Get nested level for styling
  const getItemLevel = useCallback((items: SideBarItem[], targetKey: string, currentLevel = 0): number => {
    for (const item of items) {
      if (item.key === targetKey) {
        return currentLevel;
      }
      if (item.items) {
        const level = getItemLevel(item.items, targetKey, currentLevel + 1);
        if (level > -1) return level;
      }
    }
    return -1;
  }, []);

  // Check if item has nested accordion behavior
  const isAccordionItem = useCallback((item: SideBarItem): boolean => {
    return Boolean(item.items && item.items.length > 0 && item.type === 'nest');
  }, []);

  // Get all expandable items
  const expandableItems = useMemo(() => {
    const findExpandable = (items: SideBarItem[]): string[] => {
      const expandable: string[] = [];
      for (const item of items) {
        if (isAccordionItem(item)) {
          expandable.push(item.key);
        }
        if (item.items) {
          expandable.push(...findExpandable(item.items));
        }
      }
      return expandable;
    };
    
    return findExpandable(items);
  }, [items, isAccordionItem]);

  return {
    // State
    selectedKey,
    searchQuery,
    accordionStates,
    windowSize,
    breakpoint,
    shouldAutoCollapse,
    
    // Computed
    filteredItems,
    activeItem,
    expandableItems,
    
    // Actions
    handleItemSelect,
    handleSearch,
    toggleAccordion,
    setSelectedKey,
    setSearchQuery,
    
    // Utilities
    findActiveItem,
    getItemLevel,
    isAccordionItem
  };
}

/**
 * Hook for mobile overlay management
 */
export function useMobileOverlay(breakpoint: 'mobile' | 'tablet' | 'desktop' = 'tablet') {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1200, height: 800 };
  });

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Determine if mobile
  const isMobile = useMemo(() => {
    const thresholds = {
      mobile: 768,
      tablet: 1024,
      desktop: Infinity
    };
    
    return windowSize.width < thresholds[breakpoint];
  }, [windowSize.width, breakpoint]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  const toggleMobile = useCallback((open?: boolean) => {
    setMobileOpen(prev => open !== undefined ? open : !prev);
  }, []);

  return {
    mobileOpen,
    isMobile,
    toggleMobile,
    windowSize,
    breakpoint: isMobile ? 'mobile' : 'desktop'
  };
}