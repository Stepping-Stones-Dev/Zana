import React from 'react';
import type { MenuItem, MenuGroup, MenuLayout, MenuBehavior } from '../../Shared/Menu/types';

/**
 * Sidebar item type for nested accordion behavior
 */
export enum SideBarItemType {
  Nest = 'nest',
  Normal = 'normal',
  Section = 'section'
}

/**
 * Badge configuration for menu items
 */
export interface BadgeConfiguration {
  [itemId: string]: {
    /** Number to display in badge */
    count?: number;
    /** Text to display in badge */
    text?: string;
    /** Badge color variant */
    color?: 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary';
    /** Whether badge should pulse/animate */
    pulse?: boolean;
    /** Whether to show as dot instead of count */
    dot?: boolean;
  };
}

/**
 * Enhanced sidebar item with nested support and HeroUI features
 */
export interface SideBarItem {
  /** Unique key for the item */
  key: string;
  /** Display title */
  title: string;
  /** Icon identifier or component */
  icon?: string | React.ReactNode;
  /** Navigation href */
  href?: string;
  /** Item type for behavior */
  type?: SideBarItemType;
  /** Custom start content */
  startContent?: React.ReactNode;
  /** Custom end content */
  endContent?: React.ReactNode;
  /** Nested items for accordion behavior */
  items?: SideBarItem[];
  /** Custom CSS classes */
  className?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Text value for search */
  textValue?: string;
  /** Description for tooltips */
  description?: string;
}

/**
 * Search configuration for sidebar
 */
export interface SideBarSearchConfig {
  /** Whether search is enabled */
  enabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Search input className */
  className?: string;
  /** Custom search function */
  onSearch?: (query: string, items: SideBarItem[]) => SideBarItem[];
}

/**
 * School management system user roles
 */
export enum SchoolUserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PRINCIPAL = 'principal',
  VICE_PRINCIPAL = 'vice_principal',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
  LIBRARIAN = 'librarian',
  COUNSELOR = 'counselor',
  NURSE = 'nurse',
  SECURITY = 'security',
  ACCOUNTANT = 'accountant',
  REGISTRAR = 'registrar',
  IT_SUPPORT = 'it_support',
  GUEST = 'guest'
}

/**
 * School-specific user information
 */
export interface SchoolUserInfo {
  /** User's display name */
  name: string;
  /** User's avatar/profile image */
  avatar?: string;
  /** User's role in the school system */
  role: SchoolUserRole;
  /** User's email */
  email?: string;
  /** User's employee/student ID */
  id?: string;
  /** Department or grade level */
  department?: string;
  /** School/campus name */
  school?: string;
  /** Whether user is currently online */
  online?: boolean;
  /** Academic year or session */
  academicYear?: string;
  /** Additional permissions */
  permissions?: string[];
  /** Last login timestamp */
  lastLogin?: Date;
}

/**
 * Generic user information display (backward compatibility)
 */
export interface UserInfo extends Omit<SchoolUserInfo, 'role'> {
  /** User's role or title */
  role?: string;
}

/**
 * Branding configuration for the sidebar
 */
export interface SideBarBranding {
  /** Logo component or image */
  logo?: React.ReactNode;
  /** Main title */
  title?: string;
  /** Subtitle or tagline */
  subtitle?: string;
  /** Custom branding content */
  content?: React.ReactNode;
  /** Whether to show branding when collapsed */
  showWhenCollapsed?: boolean;
}

/**
 * Menu configuration for the sidebar
 */
export interface MenuConfiguration {
  /** Unique identifier for the menu */
  id: string;
  /** Optional menu title */
  title?: string;
  /** Menu items and groups */
  items: (MenuItem | MenuGroup)[];
  /** Layout options */
  layout?: MenuLayout;
  /** Behavior options */
  behavior?: MenuBehavior;
  /** Branding configuration */
  branding?: SideBarBranding;
}

/**
 * Enhanced menu item with badge support
 */
export interface EnhancedMenuItem extends Omit<MenuItem, 'type'> {
  type: MenuItem['type'];
  /** Badge configuration for this item */
  badge?: BadgeConfiguration[string];
}

/**
 * Enhanced menu group with badge support
 */
export interface EnhancedMenuGroup extends Omit<MenuGroup, 'items'> {
  /** Enhanced items with badge support */
  items: EnhancedMenuItem[];
  /** Badge for the group header */
  badge?: BadgeConfiguration[string];
}

/**
 * Responsive breakpoints for the sidebar
 */
export interface ResponsiveConfig {
  /** Breakpoint for mobile view */
  mobile?: number;
  /** Breakpoint for tablet view */
  tablet?: number;
  /** Auto-collapse on smaller screens */
  autoCollapseBelow?: number;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether to animate width changes */
  animateWidth?: boolean;
  /** Whether to animate content changes */
  animateContent?: boolean;
}

/**
 * Hover transition configuration
 * Note: Hover transitions are automatically disabled when collapsible is false to prevent jitter
 */
export interface HoverTransitionConfig {
  /** Enable hover-based expansion */
  enabled?: boolean;
  /** Delay before expansion starts (ms) */
  expandDelay?: number;
  /** Delay before collapse starts (ms) */
  collapseDelay?: number;
  /** Additional hysteresis delay to prevent jitter (ms) - added to collapseDelay */
  hysteresisDelay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether to show tooltip during hover */
  showTooltip?: boolean;
  /** Prevent rapid state changes within this threshold (ms) */
  debounceThreshold?: number;
}

/**
 * School-specific navigation configuration
 */
export interface SchoolNavigationConfig {
  /** User role for role-based navigation */
  userRole: SchoolUserRole;
  /** Academic features to show/hide */
  academicFeatures?: {
    grades?: boolean;
    attendance?: boolean;
    assignments?: boolean;
    examinations?: boolean;
    timetable?: boolean;
    library?: boolean;
    transport?: boolean;
    hostel?: boolean;
    fees?: boolean;
    reports?: boolean;
  };
  /** Administrative features */
  adminFeatures?: {
    userManagement?: boolean;
    schoolSettings?: boolean;
    academicYear?: boolean;
    subjects?: boolean;
    classes?: boolean;
    departments?: boolean;
    notifications?: boolean;
    analytics?: boolean;
  };
  /** Communication features */
  communicationFeatures?: {
    messaging?: boolean;
    announcements?: boolean;
    events?: boolean;
    parentPortal?: boolean;
    staffPortal?: boolean;
  };
}

/**
 * Enhanced Props for the SideBar component with HeroUI integration
 */
export interface SideBarProps {
  /** Sidebar items using new enhanced structure */
  items: SideBarItem[];
  /** Menu configuration (legacy support) */
  menuConfiguration?: MenuConfiguration;
  /** Default selected key */
  defaultSelectedKey?: string;
  /** Current active path for highlighting */
  currentPath?: string;
  /** Badge data for menu items */
  badges?: BadgeConfiguration;
  /** User information to display */
  userInfo?: UserInfo;
  /** School-specific user information */
  schoolUserInfo?: SchoolUserInfo;
  /** School navigation configuration */
  schoolConfig?: SchoolNavigationConfig;
  /** Whether sidebar is collapsed (compact mode) */
  isCollapsed?: boolean;
  /** Whether sidebar can be collapsed */
  collapsible?: boolean;
  /** Hover transition configuration (only active when collapsible is true) */
  hoverTransition?: HoverTransitionConfig;
  /** Hide end content in collapsed mode */
  hideEndContent?: boolean;
  /** Hide all text components in collapsed mode (uses 'hidden' CSS property) */
  hideTextInCollapsed?: boolean;
  /** Icon className for styling */
  iconClassName?: string;
  /** Search configuration */
  search?: SideBarSearchConfig;
  /** Responsive configuration */
  responsive?: ResponsiveConfig;
  /** Animation configuration */
  animation?: AnimationConfig;
  /** Additional CSS classes */
  className?: string;
  /** Custom width when expanded */
  width?: string | number;
  /** Custom width when collapsed */
  collapsedWidth?: string | number;
  /** Position of the sidebar overlay */
  position?: 'left' | 'right';
  /** Whether to show overlay behavior (legacy prop - overlay is now always enabled) */
  overlay?: boolean;
  /** Whether sidebar is open on mobile (overlay mode) */
  mobileOpen?: boolean;
  
  /** Callback when item is selected */
  onSelect?: (key: string) => void;
  /** Callback when menu item is clicked */
  onItemClick?: (itemId: string, item: MenuItem | SideBarItem, event: React.MouseEvent | React.KeyboardEvent) => void;
  /** Callback when sidebar collapse state changes */
  onCollapseToggle?: (collapsed: boolean) => void;
  /** Callback when mobile overlay state changes */
  onMobileToggle?: (open: boolean) => void;
  /** Callback when user info area is clicked */
  onUserInfoClick?: (userInfo: UserInfo) => void;
  /** Callback for branding area clicks */
  onBrandingClick?: () => void;
}

/**
 * Props for the UserInfoSection component
 */
export interface UserInfoSectionProps {
  /** User information */
  userInfo: UserInfo;
  /** Whether sidebar is collapsed */
  isCollapsed: boolean;
  /** Whether to show full info or compact */
  compact?: boolean;
  /** Callback when clicked */
  onClick?: (userInfo: UserInfo) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the BrandingSection component
 */
export interface BrandingSectionProps {
  /** Branding configuration */
  branding: SideBarBranding;
  /** Whether sidebar is collapsed */
  isCollapsed: boolean;
  /** Callback when clicked */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the CollapseToggle component
 */
export interface CollapseToggleProps {
  /** Whether sidebar is collapsed */
  isCollapsed: boolean;
  /** Whether toggle is disabled */
  disabled?: boolean;
  /** Position of the toggle */
  position?: 'top' | 'bottom' | 'floating';
  /** Callback when toggled */
  onToggle: (collapsed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Hook return type for useSideBar
 */
export interface UseSideBarReturn {
  /** Enhanced menu items with badges */
  enhancedItems: (EnhancedMenuItem | EnhancedMenuGroup)[];
  /** Currently active item ID */
  activeItemId: string | null;
  /** Whether sidebar should be collapsed based on screen size */
  shouldAutoCollapse: boolean;
  /** Current responsive breakpoint */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  /** Functions for menu management */
  menuActions: {
    findActiveItem: (path?: string) => string | null;
    enhanceWithBadges: (items: (MenuItem | MenuGroup)[], badges: BadgeConfiguration) => (EnhancedMenuItem | EnhancedMenuGroup)[];
    handleItemActivation: (itemId: string, item: MenuItem, event: React.MouseEvent | React.KeyboardEvent) => void;
  };
}

/**
 * Context for sharing sidebar state
 */
export interface SideBarContextValue {
  /** Whether sidebar is collapsed */
  isCollapsed: boolean;
  /** Whether in mobile view */
  isMobile: boolean;
  /** Current breakpoint */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  /** Badge configuration */
  badges: BadgeConfiguration;
  /** Animation configuration */
  animation?: AnimationConfig;
  /** Function to toggle collapse */
  toggleCollapse: (collapsed?: boolean) => void;
}

/**
 * Menu item with potential nesting for complex navigation
 */
export interface NestedMenuItem extends EnhancedMenuItem {
  /** Nested sub-items */
  children?: NestedMenuItem[];
  /** Whether item is expandable */
  expandable?: boolean;
  /** Whether item is expanded */
  expanded?: boolean;
  /** Nesting level (for styling) */
  level?: number;
}

/**
 * Search configuration for menu items
 */
export interface MenuSearchConfig {
  /** Whether search is enabled */
  enabled?: boolean;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Whether to search in item descriptions */
  searchDescriptions?: boolean;
  /** Whether to search in group titles */
  searchGroups?: boolean;
  /** Custom search function */
  customSearch?: (query: string, items: (MenuItem | MenuGroup)[]) => (MenuItem | MenuGroup)[];
}

/**
 * Quick actions configuration
 */
export interface QuickActionsConfig {
  /** Whether to show quick actions */
  enabled?: boolean;
  /** Position of quick actions */
  position?: 'top' | 'bottom' | 'floating';
  /** Quick action items */
  actions?: MenuItem[];
}

/**
 * Extended sidebar configuration
 */
export interface ExtendedSideBarProps extends SideBarProps {
  /** Search configuration */
  search?: MenuSearchConfig;
  /** Quick actions configuration */
  quickActions?: QuickActionsConfig;
  /** Whether to show tooltips for collapsed items */
  showTooltips?: boolean;
  /** Whether to persist collapse state */
  persistState?: boolean;
  /** Local storage key for state persistence */
  storageKey?: string;
}