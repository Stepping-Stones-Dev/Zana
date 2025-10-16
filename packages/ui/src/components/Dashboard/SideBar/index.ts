/**
 * SideBar module for @zana/ui
 * 
 * Comprehensive sidebar navigation component for dashboards and applications
 * with role-based menus, responsive design, and accessibility features.
 */

// Main component
export { SideBar } from './SideBar';

export { 
  useEnhancedSideBar, 
  useMobileOverlay 
} from './useSideBar';

// School management system navigation
export {
  getNavigationByRole,
  getSuperAdminNavigation,
  getAdminNavigation,
  getTeacherNavigation,
  getStudentNavigation,
  getParentNavigation,
  getDefaultSchoolConfig
} from './schoolNavigation';

// Utility functions
export {
  enhanceMenuItemsWithBadges,
  findActiveMenuItem,
  flattenMenuItems,
  getGroupBadgeCount,
  shouldAutoCollapse,
  getCurrentBreakpoint,
  searchMenuItems,
  validateMenuConfiguration,
  createDefaultMenuConfiguration,
  mergeBadgeConfigurations,
  filterMenuItemsByPermissions
} from './utils';

// Types and interfaces
export type {
  SideBarProps,
  MenuConfiguration,
  BadgeConfiguration,
  UserInfo,
  SideBarBranding,
  SideBarItem,
  SideBarItemType,
  SideBarSearchConfig,
  EnhancedMenuItem,
  EnhancedMenuGroup,
  ResponsiveConfig,
  AnimationConfig,
  UserInfoSectionProps,
  BrandingSectionProps,
  CollapseToggleProps,
  UseSideBarReturn,
  SideBarContextValue,
  NestedMenuItem,
  MenuSearchConfig,
  QuickActionsConfig,
  ExtendedSideBarProps,
  // School management system types
  SchoolUserInfo,
  SchoolNavigationConfig,
  HoverTransitionConfig
} from './types';

// Enums
export { SchoolUserRole } from './types';