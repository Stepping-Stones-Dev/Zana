import React from 'react';

/**
 * Props for DashboardHeader component
 */
export interface DashboardHeaderProps {
  /** Application title or branding */
  title?: string;
  /** Logo or brand icon */
  logo?: React.ReactNode;
  /** Current user information for notifications */
  currentUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  /** Show notifications bell */
  showNotifications?: boolean;
  /** Show theme switcher */
  showThemeSwitcher?: boolean;
  /** Show language switcher */
  showLanguageSwitcher?: boolean;
  /** Show calendar app launcher */
  showCalendar?: boolean;
  /** Additional actions or buttons */
  actions?: React.ReactNode;
  /** Custom styling */
  className?: string;
  /** Header position */
  position?: 'static' | 'sticky' | 'fixed';
  /** Background variant */
  variant?: 'default' | 'transparent' | 'glass';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Callbacks */
  onNotificationClick?: () => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onLanguageChange?: (language: string) => void;
  onCalendarClick?: () => void;
  onLogoClick?: () => void;
}

/**
 * Language option for language switcher
 */
export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  native: string;
}

/**
 * Quick action item for header
 */
export interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  badge?: {
    content: string | number;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  shortcut?: string;
}

/**
 * Extended DashboardHeader props with more features
 */
export interface ExtendedDashboardHeaderProps extends DashboardHeaderProps {
  /** Quick action items */
  quickActions?: QuickActionItem[];
  /** Search functionality */
  searchConfig?: {
    enabled: boolean;
    placeholder?: string;
    onSearch?: (query: string) => void;
  };
  /** Breadcrumb navigation */
  breadcrumbs?: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
}