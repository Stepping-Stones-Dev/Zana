import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  Button, 
  Avatar, 
  Card, 
  CardHeader, 
  CardBody,
  Divider,
  Link,
  Chip
} from '@heroui/react';
import { cx } from '../../../internal/internal';

export interface UserProfileInfo {
  id?: string;
  fullName?: string; // If provided overrides first/last combo for display
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  orgName?: string;
  roles?: string[]; // list of role names
  avatarUrl?: string; // remote image
  avatarAlt?: string; // explicit alt text for avatar image
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string; // if set treated like link
  onSelect?: () => void;
  external?: boolean; // show external link indicator
  disabled?: boolean;
  danger?: boolean; // style emphasis for destructive (e.g., sign out)
  analyticsId?: string;
}

export interface ProfileMenuSection {
  id: string; // unique stable id
  label?: string; // optional heading (uppercase small)
  items: ProfileMenuItem[];
}

export interface UserProfileMenuProps {
  user: UserProfileInfo;
  sections?: ProfileMenuSection[]; // Additional (non-profile) sections below profile header
  size?: 'sm' | 'md' | 'lg'; // HeroUI Avatar size
  onAction?: (itemId: string, sectionId: string) => void;
  ariaLabel?: string; // aria-label for trigger button
  analyticsBaseId?: string; // base id for data attributes
  className?: string;
  closeOnSelect?: boolean;
  /** Show user name in the trigger button */
  showName?: boolean;
  /** Show additional user field (email, phone, etc.) in the trigger button */
  showUserField?: 'email' | 'phone' | 'orgName' | 'none';
  /** Horizontal alignment relative to trigger: start (left edges), center, end (right edges) or auto (decide based on viewport edges) */
  align?: 'start' | 'center' | 'end' | 'auto';
  /** Pixel threshold from viewport edge to treat as near-edge in auto mode */
  autoEdgeThreshold?: number;
}

function deriveInitials(user: UserProfileInfo): string {
  if (user.firstName || user.lastName) {
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    if (first || last) {
      return ((first[0] || '') + (last[0] || '')).toUpperCase();
    }
  }
  if (user.fullName) {
    const parts = user.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length) {
      const a = parts[0][0];
      const b = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || '');
      return (a + b).toUpperCase();
    }
  }
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return 'U';
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  sections = [],
  size = 'md',
  onAction,
  ariaLabel = 'User profile menu',
  analyticsBaseId = 'user.profile.menu',
  className,
  closeOnSelect = true,
  showName = false,
  showUserField = 'none',
  align = 'end',
  autoEdgeThreshold = 160,
}) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'bottom-start' | 'bottom-end'>(
    align === 'start' ? 'bottom-start' : align === 'center' ? 'bottom' : 'bottom-end'
  );
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleToggle = () => setOpen(o => !o);
  const close = useCallback(() => setOpen(false), []);

  const initials = deriveInitials(user);
  const displayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
  const rolesText = user.roles?.join(', ');

  // Get the additional user field value based on showUserField prop
  const getUserFieldValue = () => {
    switch (showUserField) {
      case 'email':
        return user.email;
      case 'phone':
        return user.phone;
      case 'orgName':
        return user.orgName;
      default:
        return null;
    }
  };

  const userFieldValue = getUserFieldValue();

  const handleSelect = (item: ProfileMenuItem, section: ProfileMenuSection) => {
    if (item.disabled) return;
    item.onSelect?.();
    onAction?.(item.id, section.id);
    if (closeOnSelect) close();
  };

  // Auto-placement logic runs when menu opens or align changes to auto.
  useLayoutEffect(() => {
    if (!open) return;
    if (align !== 'auto') return;
    if (typeof window === 'undefined') return;
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    // Decide: near right edge -> end, near left edge -> start, else center
    if (vw - rect.right < autoEdgeThreshold) {
      setPlacement('bottom-end');
    } else if (rect.left < autoEdgeThreshold) {
      setPlacement('bottom-start');
    } else {
      setPlacement('bottom');
    }
  }, [open, align, autoEdgeThreshold]);

  // If align prop changes (non-auto) update placement immediately
  useLayoutEffect(() => {
    if (align === 'auto') return; // handled dynamically on open
    setPlacement(align === 'start' ? 'bottom-start' : align === 'center' ? 'bottom' : 'bottom-end');
  }, [align]);

  // Render trigger content based on showName and showUserField props
  const renderTriggerContent = () => {
    if (!showName && !userFieldValue) {
      // Icon-only mode - just show avatar
      return (
        <Avatar
          src={user.avatarUrl}
          name={user.avatarAlt || displayName}
          showFallback
          fallback={initials}
          className="w-max-10 h-max-10 text-foreground-700 text-lg font-bold bg-default/50"
          size={'md'}
        />
      );
    }

    // Button with avatar and text content
    return (
      <div className="flex items-center gap-2">
        <Avatar
          src={user.avatarUrl}
          name={user.avatarAlt || displayName}
          showFallback
          fallback={initials}
          className="w-max-10 h-max-10 text-foreground-700 text-lg font-bold bg-default/50"
          size={'md'}
        />
        {(showName || userFieldValue) && (
          <div className="flex flex-col items-start">
            {showName && (
              <span className="text-sm font-medium text-foreground truncate max-w-32">
                {displayName}
              </span>
            )}
            {userFieldValue && (
              <span className="text-xs text-foreground-500 truncate max-w-32">
                {userFieldValue}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const isIconOnly = !showName && !userFieldValue;

  return (
    <Popover isOpen={open} onOpenChange={setOpen} placement={placement}>
      <PopoverTrigger>
        <Button
          className={cx("h-auto w-min-10", className)}
          aria-label={ariaLabel}
          isIconOnly={isIconOnly}
          variant="light"
          radius="full"
          data-open={open || undefined}
          data-analytics-id={`${analyticsBaseId}.trigger`}
          aria-haspopup="menu"
          aria-expanded={open}
          ref={triggerRef}
          data-placement={placement}
        >
          {renderTriggerContent()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Card className="shadow-none border-none" role="menu" aria-label="User menu" data-analytics-id={`${analyticsBaseId}.menu`}>
          {/* Profile header */}
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <Avatar
                src={user.avatarUrl}
                name={user.avatarAlt || displayName}
                showFallback
                fallback={initials}
                className="w-max-10 h-max-10 text-foreground-700 text-lg font-bold bg-default/50"
                size="md"
              />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {displayName}
                </h3>
                {user.email && (
                  <p className="text-sm text-foreground-500 truncate">
                    {user.email}
                  </p>
                )}
                {user.phone && (
                  <p className="text-sm text-foreground-500 truncate">
                    {user.phone}
                  </p>
                )}
                {user.orgName && (
                  <p className="text-sm text-foreground-500 truncate">
                    {user.orgName}
                  </p>
                )}
                {rolesText && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles?.map((role, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="text-xs"
                      >
                        {role}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          {/* Dynamic sections */}
          {sections.length > 0 && (
            <CardBody className="pt-0">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} data-section-id={section.id}>
                  {sectionIndex > 0 && <Divider className="my-2" />}
                  {section.label && (
                    <h4 className="text-xs font-semibold text-foreground-500 uppercase tracking-wide mb-2">
                      {section.label}
                    </h4>
                  )}
                  <div className="space-y-1" role="group" aria-label={section.label || section.id}>
                    {section.items.map(item => {
                      const asLink = !!item.href;
                      const baseClasses = cx(
                        "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                        "hover:bg-default-100 focus:bg-default-100 focus:outline-none",
                        item.danger && "text-danger hover:bg-danger-50 focus:bg-danger-50",
                        item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent focus:bg-transparent"
                      );
                      
                      const content = (
                        <>
                          {item.icon && (
                            <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
                              {item.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-foreground-500 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.external && (
                            <span className="flex-shrink-0 text-foreground-400" aria-hidden="true">
                              ↗
                            </span>
                          )}
                        </>
                      );

                      if (asLink) {
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={baseClasses}
                            isExternal={item.external}
                            data-disabled={item.disabled || undefined}
                            data-danger={item.danger || undefined}
                            data-analytics-id={item.analyticsId || `${analyticsBaseId}.item.${section.id}.${item.id}`}
                            role="menuitem"
                            aria-disabled={item.disabled || undefined}
                            onPress={() => handleSelect(item, section)}
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={baseClasses}
                          disabled={item.disabled}
                          data-disabled={item.disabled || undefined}
                          data-danger={item.danger || undefined}
                          data-analytics-id={item.analyticsId || `${analyticsBaseId}.item.${section.id}.${item.id}`}
                          role="menuitem"
                          aria-disabled={item.disabled || undefined}
                          onClick={() => handleSelect(item, section)}
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardBody>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
};

UserProfileMenu.displayName = 'UserProfileMenu';

export default UserProfileMenu;
