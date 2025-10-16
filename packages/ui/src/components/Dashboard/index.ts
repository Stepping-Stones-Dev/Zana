/**
 * Components/Dashboard module for @zana/ui
 * 
 * Exports all UI components. Currently includes implemented components
 * with planned components to be added as they are developed.
 */

// Implemented components
export { AppSwitcher } from './AppSwitcher/AppSwitcher';
export type { AppSwitcherProps, AppSwitcherItem } from './AppSwitcher/AppSwitcher';
export { ThemeSwitcher } from './ThemeSwitcher/ThemeSwitcher';
export type { ThemeSwitchProps } from './ThemeSwitcher/ThemeSwitcher';
export { UserProfileMenu } from './UserProfileMenu/UserProfileMenu';
export type { UserProfileMenuProps, UserProfileInfo, ProfileMenuItem, ProfileMenuSection } from './UserProfileMenu/UserProfileMenu';
export { NotificationBell } from './NotificationBell/NotificationBell';
export type { NotificationBellProps } from './NotificationBell/NotificationBell';
export { NotificationPanel } from './NotificationPanel/NotificationPanel';
export type { 
  NotificationPanelProps, 
  NotificationItem, 
  NotificationPriority, 
  NotificationStatus,
  NotificationManagementConfig 
} from './NotificationPanel/NotificationPanel.tsx';

// Side Navigation
export { SideBar } from './SideBar/SideBar';
export type { 
  SideBarProps,
  MenuConfiguration,
  BadgeConfiguration,
  UserInfo,
  ResponsiveConfig,
  SideBarBranding
} from './SideBar/types';

// Dashboard Header
export { DashboardHeader } from './DashboardHeader/DashboardHeader';
export type { DashboardHeaderProps, LanguageOption, QuickActionItem } from './DashboardHeader/types';
