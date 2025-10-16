import type { MenuItem, MenuGroup } from '../../Shared/Menu/types';
import type { 
  BadgeConfiguration, 
  EnhancedMenuItem, 
  EnhancedMenuGroup,
  ResponsiveConfig
} from './types';

/**
 * Enhances menu items with badge information
 */
export function enhanceMenuItemsWithBadges(
  items: (MenuItem | MenuGroup)[],
  badges: BadgeConfiguration = {}
): (EnhancedMenuItem | EnhancedMenuGroup)[] {
  return items.map(item => {
    if ('items' in item) {
      // It's a MenuGroup
      const enhancedItems = enhanceMenuItemsWithBadges(item.items, badges);
      const groupBadge = badges[item.id];
      
      return {
        ...item,
        items: enhancedItems as EnhancedMenuItem[],
        badge: groupBadge
      } as EnhancedMenuGroup;
    } else {
      // It's a MenuItem
      const itemBadge = badges[item.id];
      
      return {
        ...item,
        badge: itemBadge
      } as EnhancedMenuItem;
    }
  });
}

/**
 * Finds the active menu item based on current path
 */
export function findActiveMenuItem(
  items: (MenuItem | MenuGroup)[],
  currentPath?: string
): string | null {
  if (!currentPath) return null;

  for (const item of items) {
    if ('items' in item) {
      // It's a MenuGroup - search recursively
      const activeInGroup = findActiveMenuItem(item.items, currentPath);
      if (activeInGroup) return activeInGroup;
    } else if (item.type === 'link') {
      // It's a link MenuItem
      const href = item.href;
      
      // Exact match
      if (currentPath === href) {
        return item.id;
      }
      
      // Path starts with href (for nested routes)
      if (currentPath.startsWith(href) && href !== '/') {
        return item.id;
      }
    }
  }
  
  return null;
}

/**
 * Flattens menu structure to get all menu items
 */
export function flattenMenuItems(items: (MenuItem | MenuGroup)[]): MenuItem[] {
  const flattened: MenuItem[] = [];
  
  for (const item of items) {
    if ('items' in item) {
      // It's a MenuGroup
      flattened.push(...flattenMenuItems(item.items));
    } else {
      // It's a MenuItem
      flattened.push(item);
    }
  }
  
  return flattened;
}

/**
 * Gets the total badge count for a menu group
 */
export function getGroupBadgeCount(
  group: MenuGroup,
  badges: BadgeConfiguration
): number {
  let totalCount = 0;
  
  // Add group's own badge count
  const groupBadge = badges[group.id];
  if (groupBadge?.count) {
    totalCount += groupBadge.count;
  }
  
  // Add counts from all items in the group
  for (const item of group.items) {
    const itemBadge = badges[item.id];
    if (itemBadge?.count) {
      totalCount += itemBadge.count;
    }
  }
  
  return totalCount;
}

/**
 * Determines if sidebar should auto-collapse based on screen size
 */
export function shouldAutoCollapse(
  windowWidth: number,
  responsive?: ResponsiveConfig
): boolean {
  if (!responsive?.autoCollapseBelow) return false;
  
  return windowWidth < responsive.autoCollapseBelow;
}

/**
 * Gets current responsive breakpoint
 */
export function getCurrentBreakpoint(
  windowWidth: number,
  responsive?: ResponsiveConfig
): 'mobile' | 'tablet' | 'desktop' {
  if (!responsive) return 'desktop';
  
  if (responsive.mobile && windowWidth < responsive.mobile) {
    return 'mobile';
  }
  
  if (responsive.tablet && windowWidth < responsive.tablet) {
    return 'tablet';
  }
  
  return 'desktop';
}

/**
 * Searches menu items based on query string
 */
export function searchMenuItems(
  items: (MenuItem | MenuGroup)[],
  query: string,
  options: {
    searchDescriptions?: boolean;
    searchGroups?: boolean;
  } = {}
): (MenuItem | MenuGroup)[] {
  if (!query.trim()) return items;
  
  const lowerQuery = query.toLowerCase();
  const filtered: (MenuItem | MenuGroup)[] = [];
  
  for (const item of items) {
    if ('items' in item) {
      // It's a MenuGroup
      const filteredItems = searchMenuItems(item.items, query, options);
      
      // Include group if it has matching items or if group title matches
      if (filteredItems.length > 0) {
        filtered.push({
          ...item,
          items: filteredItems as MenuItem[]
        });
      } else if (options.searchGroups && item.title?.toLowerCase().includes(lowerQuery)) {
        filtered.push(item);
      }
    } else {
      // It's a MenuItem
      const matchesLabel = 'label' in item && item.label?.toLowerCase().includes(lowerQuery);
      const matchesTooltip = options.searchDescriptions && 'tooltip' in item && 
        item.tooltip?.toLowerCase().includes(lowerQuery);
      
      if (matchesLabel || matchesTooltip) {
        filtered.push(item);
      }
    }
  }
  
  return filtered;
}

/**
 * Validates menu configuration
 */
export function validateMenuConfiguration(config: {
  items: (MenuItem | MenuGroup)[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const itemIds = new Set<string>();
  
  function validateItems(items: (MenuItem | MenuGroup)[], path = '') {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemPath = `${path}[${i}]`;
      
      // Check for required ID
      if (!item.id) {
        errors.push(`Item at ${itemPath} is missing required 'id' property`);
        continue;
      }
      
      // Check for duplicate IDs
      if (itemIds.has(item.id)) {
        errors.push(`Duplicate item ID '${item.id}' found at ${itemPath}`);
      } else {
        itemIds.add(item.id);
      }
      
      if ('items' in item) {
        // It's a MenuGroup
        if (!Array.isArray(item.items)) {
          errors.push(`MenuGroup at ${itemPath} has invalid 'items' property`);
        } else {
          validateItems(item.items, `${itemPath}.items`);
        }
      } else {
        // It's a MenuItem
        if (!item.type) {
          errors.push(`MenuItem at ${itemPath} is missing required 'type' property`);
        }
        
        if (item.type === 'link' && !('href' in item && item.href)) {
          errors.push(`Link MenuItem at ${itemPath} is missing required 'href' property`);
        }
        
        if (item.type === 'action' && !('onClick' in item && item.onClick)) {
          errors.push(`Action MenuItem at ${itemPath} is missing required 'onClick' property`);
        }
      }
    }
  }
  
  validateItems(config.items);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a default menu configuration
 */
export function createDefaultMenuConfiguration(): {
  items: (MenuItem | MenuGroup)[];
} {
  return {
    items: [
      {
        type: 'link',
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard'
      }
    ]
  };
}

/**
 * Merges multiple badge configurations
 */
export function mergeBadgeConfigurations(...configs: BadgeConfiguration[]): BadgeConfiguration {
  const merged: BadgeConfiguration = {};
  
  for (const config of configs) {
    for (const [itemId, badgeConfig] of Object.entries(config)) {
      if (merged[itemId]) {
        // Merge badge configurations (later configs take precedence)
        merged[itemId] = {
          ...merged[itemId],
          ...badgeConfig,
          // Sum counts if both exist
          count: (merged[itemId].count || 0) + (badgeConfig.count || 0) || undefined
        };
      } else {
        merged[itemId] = { ...badgeConfig };
      }
    }
  }
  
  return merged;
}

/**
 * Filters menu items by user permissions (utility for host apps)
 */
export function filterMenuItemsByPermissions(
  items: (MenuItem | MenuGroup)[],
  permissions: string[],
  getItemPermission?: (item: MenuItem | MenuGroup) => string | string[] | undefined
): (MenuItem | MenuGroup)[] {
  if (!getItemPermission) return items;
  
  const filtered: (MenuItem | MenuGroup)[] = [];
  
  for (const item of items) {
    const requiredPermissions = getItemPermission(item);
    
    if (!requiredPermissions) {
      // No permission required
      if ('items' in item) {
        const filteredItems = filterMenuItemsByPermissions(item.items, permissions, getItemPermission);
        if (filteredItems.length > 0) {
          filtered.push({
            ...item,
            items: filteredItems as MenuItem[]
          });
        }
      } else {
        filtered.push(item);
      }
    } else {
      // Check permissions
      const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      const hasPermission = required.some(perm => permissions.includes(perm));
      
      if (hasPermission) {
        if ('items' in item) {
          const filteredItems = filterMenuItemsByPermissions(item.items, permissions, getItemPermission);
          if (filteredItems.length > 0) {
            filtered.push({
              ...item,
              items: filteredItems as MenuItem[]
            });
          }
        } else {
          filtered.push(item);
        }
      }
    }
  }
  
  return filtered;
}