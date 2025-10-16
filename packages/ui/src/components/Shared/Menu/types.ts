import React from 'react';

/**
 * Base interface for menu items with common properties
 */
export interface BaseMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display text for the menu item */
  label: string;
  /** Optional icon to display - can be any React node */
  icon?: React.ReactNode;
  /** Whether the item is currently active/selected */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional tooltip text */
  tooltip?: string;
  /** Additional CSS classes */
  className?: string;
  /** Analytics/tracking identifier */
  analyticsId?: string;
  /** Custom data attributes */
  'data-testid'?: string;
}

/**
 * Menu item that triggers an action when clicked
 */
export interface ActionMenuItem extends BaseMenuItem {
  type: 'action';
  /** Callback function when item is clicked */
  onClick: (id: string, event: React.MouseEvent | React.KeyboardEvent) => void;
  /** Optional keyboard shortcut display */
  shortcut?: string;
}

/**
 * Menu item that navigates to a URL
 */
export interface LinkMenuItem extends BaseMenuItem {
  type: 'link';
  /** URL to navigate to */
  href: string;
  /** Whether to open in new window */
  external?: boolean;
  /** Optional download attribute */
  download?: string;
}

/**
 * Menu item with custom render function for complex content
 */
export interface CustomMenuItem extends BaseMenuItem {
  type: 'custom';
  /** Custom render function */
  render: (props: { active?: boolean; disabled?: boolean }) => React.ReactNode;
}

/**
 * Divider/separator between menu sections
 */
export interface DividerMenuItem {
  type: 'divider';
  id: string;
  /** Optional label for the divider */
  label?: string;
}

/**
 * Union type of all possible menu items
 */
export type MenuItem = ActionMenuItem | LinkMenuItem | CustomMenuItem | DividerMenuItem;

/**
 * Menu group/section containing related items
 */
export interface MenuGroup {
  /** Unique identifier for the group */
  id: string;
  /** Optional group title/header */
  title?: string;
  /** Items in this group */
  items: MenuItem[];
  /** Whether group is collapsible */
  collapsible?: boolean;
  /** Whether group starts collapsed (if collapsible) */
  defaultCollapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Menu layout and appearance options
 */
export interface MenuLayout {
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual density */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** Whether to show icons */
  showIcons?: boolean;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  /** Whether to show tooltips */
  showTooltips?: boolean;
  /** Maximum width for the menu */
  maxWidth?: string | number;
  /** Minimum width for the menu */
  minWidth?: string | number;
}

/**
 * Menu behavior and interaction options
 */
export interface MenuBehavior {
  /** Whether keyboard navigation is enabled */
  keyboardNavigation?: boolean;
  /** Whether to auto-focus first item when opened */
  autoFocus?: boolean;
  /** Whether clicking outside closes the menu */
  closeOnClickOutside?: boolean;
  /** Whether pressing Escape closes the menu */
  closeOnEscape?: boolean;
  /** Whether selecting an item closes the menu */
  closeOnSelect?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple' | 'none';
  /** Currently selected item IDs */
  selectedItems?: string[];
  /** Whether to allow deselection of selected items */
  allowDeselect?: boolean;
}

/**
 * Accessibility options for the menu
 */
export interface MenuAccessibility {
  /** ARIA label for the menu */
  'aria-label'?: string;
  /** ID of element that labels the menu */
  'aria-labelledby'?: string;
  /** ARIA description */
  'aria-describedby'?: string;
  /** Menu role override */
  role?: 'menu' | 'menubar' | 'listbox' | 'navigation';
  /** Whether to announce selection changes */
  announceSelections?: boolean;
}

/**
 * Complete menu configuration
 */
export interface MenuConfig {
  /** Menu items or groups */
  items: (MenuItem | MenuGroup)[];
  /** Layout options */
  layout?: MenuLayout;
  /** Behavior options */
  behavior?: MenuBehavior;
  /** Accessibility options */
  accessibility?: MenuAccessibility;
  /** Additional CSS classes */
  className?: string;
  /** Callback when menu item is selected */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when menu is opened/closed */
  onOpenChange?: (open: boolean) => void;
  /** Callback when menu item is activated */
  onItemActivate?: (itemId: string, item: MenuItem) => void;
  /** Callback when menu group is expanded/collapsed */
  onGroupToggle?: (groupId: string, expanded: boolean) => void;
}

/**
 * Props for the main Menu component
 */
export interface MenuProps extends MenuConfig {
  /** Child content (alternative to items prop) */
  children?: React.ReactNode;
  /** Whether the menu is currently open */
  open?: boolean;
  /** Menu trigger element */
  trigger?: React.ReactNode;
  /** Menu placement relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Whether menu is rendered inline or as overlay */
  inline?: boolean;
  /** Controlled group states (groupId -> collapsed state) */
  groupStates?: Record<string, boolean>;
}

/**
 * Props for MenuItem component
 */
export interface MenuItemProps {
  /** Menu item data */
  item: MenuItem;
  /** Whether keyboard navigation is active */
  keyboardNavigation?: boolean;
  /** Whether the item is currently focused */
  focused?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Density setting */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** Whether to show icons */
  showIcons?: boolean;
  /** Icon position */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  /** Whether to show tooltips */
  showTooltips?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple' | 'none';
  /** Whether item is selected (for multiple selection) */
  selected?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (item: MenuItem, event: React.MouseEvent | React.KeyboardEvent) => void;
  /** Callback when item receives focus */
  onItemFocus?: (item: MenuItem) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for MenuGroup component
 */
export interface MenuGroupProps {
  /** Group data */
  group: MenuGroup;
  /** Whether keyboard navigation is active */
  keyboardNavigation?: boolean;
  /** Currently focused item ID */
  focusedItemId?: string;
  /** Layout options */
  layout?: MenuLayout;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple' | 'none';
  /** Selected item IDs */
  selectedItems?: string[];
  /** Controlled collapsed state - overrides internal state */
  collapsed?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (item: MenuItem, event: React.MouseEvent | React.KeyboardEvent) => void;
  /** Callback when item receives focus */
  onItemFocus?: (item: MenuItem) => void;
  /** Callback when group is expanded/collapsed */
  onGroupToggle?: (groupId: string, expanded: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Context for sharing menu state between components
 */
export interface MenuContextValue {
  /** Current menu configuration */
  config?: MenuConfig;
  /** Currently focused item ID */
  focusedItemId?: string;
  /** Selected item IDs */
  selectedItems?: string[];
  /** Whether keyboard navigation is active */
  keyboardNavigation?: boolean;
  /** Function to set focused item */
  setFocusedItem?: (itemId: string) => void;
  /** Function to handle item selection */
  handleItemSelect?: (item: MenuItem, event: React.MouseEvent | React.KeyboardEvent) => void;
  /** Function to handle keyboard events */
  handleKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * Hook return type for useMenu
 */
export interface UseMenuReturn {
  /** Menu state and handlers */
  menuProps: {
    role: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    onKeyDown: (event: React.KeyboardEvent) => void;
    tabIndex: number;
  };
  /** Currently focused item ID */
  focusedItemId: string | null;
  /** Selected item IDs */
  selectedItems: string[];
  /** Function to focus specific item */
  focusItem: (itemId: string) => void;
  /** Function to focus next item */
  focusNext: () => void;
  /** Function to focus previous item */
  focusPrevious: () => void;
  /** Function to select current item */
  selectCurrentItem: () => void;
  /** Function to handle item click */
  handleItemClick: (item: MenuItem, event: React.MouseEvent | React.KeyboardEvent) => void;
}