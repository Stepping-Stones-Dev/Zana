import React, { forwardRef } from 'react';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Badge,
  Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { cx } from '../../../internal/internal';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import { NotificationBell } from '../NotificationBell/NotificationBell';
import type { DashboardHeaderProps, LanguageOption } from './types';

// Sample language options
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
];

/**
 * Language Switcher Component
 */
const LanguageSwitcher: React.FC<{
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}> = ({ currentLanguage = 'en', onLanguageChange }) => {
  const currentLang = LANGUAGE_OPTIONS.find(lang => lang.code === currentLanguage) || LANGUAGE_OPTIONS[0];
  
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          size="sm"
          startContent={
            <span className="text-base">{currentLang.flag}</span>
          }
          endContent={
            <Icon icon="solar:alt-arrow-down-linear" className="text-default-400" width={16} />
          }
          className="gap-2 px-3 min-w-0"
        >
          <span className="hidden sm:block font-medium">{currentLang.code.toUpperCase()}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        selectedKeys={[currentLanguage]}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          onLanguageChange?.(selected);
        }}
      >
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownItem
            key={lang.code}
            startContent={<span className="text-base">{lang.flag}</span>}
            description={lang.native}
          >
            {lang.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * Calendar App Launcher Component
 */
const CalendarLauncher: React.FC<{
  onClick?: () => void;
}> = ({ onClick }) => {
  return (
    <Button
      variant="light"
      size="sm"
      isIconOnly
      onPress={onClick}
      className="text-default-600 hover:text-default-900"
      aria-label="Open Calendar"
    >
      <Icon icon="solar:calendar-linear" width={20} />
    </Button>
  );
};

/**
 * DashboardHeader Component
 * 
 * A comprehensive header component for dashboard layouts featuring notifications,
 * theme switching, language selection, and quick actions.
 */
export const DashboardHeader = forwardRef<HTMLElement, DashboardHeaderProps>(({
  title,
  logo,
  currentUser,
  showNotifications = true,
  showThemeSwitcher = true,
  showLanguageSwitcher = true,
  showCalendar = true,
  actions,
  className,
  position = 'sticky',
  variant = 'default',
  size = 'md',
  onNotificationClick,
  onThemeChange,
  onLanguageChange,
  onCalendarClick,
  onLogoClick,
  ...props
}, ref) => {

  // Header size variants
  const sizeStyles = {
    sm: 'h-14 px-4',
    md: 'h-16 px-6', 
    lg: 'h-20 px-8'
  };

  // Background variants
  const variantStyles = {
    default: 'bg-background border-divider',
    transparent: 'bg-transparent',
    glass: 'bg-background/80 backdrop-blur-md backdrop-saturate-150 border-divider'
  };

  // Position styles
  const positionStyles = {
    static: 'relative',
    sticky: 'sticky top-0 z-40',
    fixed: 'fixed top-0 left-0 right-0 z-50'
  };

  const headerClasses = cx(
    'flex items-center justify-between w-full border-b transition-all duration-300',
    sizeStyles[size],
    variantStyles[variant],
    positionStyles[position],
    className
  );

  return (
    <header
      ref={ref}
      className={headerClasses}
      {...props}
    >
      {/* Left Section - Logo & Title */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {logo && (
          <div 
            className={cx(
              "flex items-center gap-3",
              onLogoClick && "cursor-pointer hover:opacity-80 transition-opacity"
            )}
            onClick={onLogoClick}
          >
            <div className="flex-shrink-0">
              {logo}
            </div>
            {title && (
              <h1 className="text-xl font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
          </div>
        )}
        {!logo && title && (
          <h1 className="text-xl font-semibold text-foreground truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Center Section - Custom Actions */}
      <div className="flex-1 flex justify-center px-4">
        {actions}
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Calendar Launcher */}
        {showCalendar && (
          <CalendarLauncher onClick={onCalendarClick} />
        )}

        {/* Language Switcher */}
        {showLanguageSwitcher && (
          <LanguageSwitcher onLanguageChange={onLanguageChange} />
        )}

        {/* Divider */}
        {(showCalendar || showLanguageSwitcher) && (showThemeSwitcher || showNotifications) && (
          <Divider orientation="vertical" className="h-6 mx-1" />
        )}

        {/* Theme Switcher */}
        {showThemeSwitcher && (
          <ThemeSwitcher
            size={32}
            className="text-default-600"
          />
        )}

        {/* Notifications */}
        {showNotifications && (
          <NotificationBell
            size={32}
            notifications={[]} // This would come from props in real usage
            onNotificationClick={onNotificationClick}
            className="text-default-600"
          />
        )}
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';