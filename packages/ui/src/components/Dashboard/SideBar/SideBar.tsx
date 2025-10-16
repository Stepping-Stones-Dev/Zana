import React, { forwardRef, useState, useCallback } from 'react';
import { 
  Listbox, 
  ListboxItem, 
  ListboxSection, 
  Tooltip, 
  Accordion, 
  AccordionItem,
  Input,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  ScrollShadow,
  Spacer,
  type ListboxProps,
  type ListboxSectionProps,
  type Selection
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';
import { 
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import type { SideBarProps, SideBarItem, UserInfo, SchoolUserInfo } from './types';
import { SideBarItemType, SchoolUserRole } from './types';
import { useEnhancedSideBar, useMobileOverlay } from './useSideBar';
import { UserProfileMenu } from '../UserProfileMenu/UserProfileMenu';
import { getNavigationByRole, getDefaultSchoolConfig } from './schoolNavigation';

/**
 * HeroUI-inspired SideBar Component
 */
export const SideBar = forwardRef<HTMLElement, SideBarProps>(({
  items,
  defaultSelectedKey,
  isCollapsed: controlledCollapsed = false,
  hideEndContent = false,
  hideTextInCollapsed = true,
  iconClassName,
  search,
  userInfo,
  schoolUserInfo,
  schoolConfig,
  collapsible = true,
  hoverTransition = {
    enabled: true,
    expandDelay: 150,
    collapseDelay: 300,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    showTooltip: true,
  },
  className,
  width = '18rem',
  collapsedWidth = '4rem',
  position = 'left',
  mobileOpen: controlledMobileOpen,
  onSelect,
  onItemClick,
  onCollapseToggle,
  onMobileToggle,
  onUserInfoClick,
  ...props
}, ref) => {
  
  const [selected, setSelected] = useState<React.Key>(defaultSelectedKey || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Reset hover state when collapsible becomes false
  React.useEffect(() => {
    if (!collapsible) {
      setIsHovered(false);
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        setHoverTimer(null);
      }
    }
  }, [collapsible, hoverTimer]);
  
  // Mobile overlay management
  const { mobileOpen, isMobile, toggleMobile } = useMobileOverlay('tablet');
  
  // Determine effective user info (school user info takes precedence)
  const effectiveUserInfo = schoolUserInfo || userInfo;
  
  // Generate school-specific navigation if schoolUserInfo is provided
  const effectiveItems = React.useMemo(() => {
    if (schoolUserInfo && !items.length) {
      const config = schoolConfig || getDefaultSchoolConfig(schoolUserInfo.role);
      return getNavigationByRole(schoolUserInfo.role, config);
    }
    return items;
  }, [items, schoolUserInfo, schoolConfig]);
  
  // Enhanced hover transition logic with hysteresis and smooth state management
  const baseCollapsed = controlledCollapsed;
  const isCompact = collapsible && !isMobile ? (baseCollapsed && !isHovered) : (isMobile ? false : baseCollapsed);
  const effectiveMobileOpen = controlledMobileOpen ?? mobileOpen;
  
  // Clear any existing timer
  const clearHoverTimer = useCallback(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  }, [hoverTimer]);
  
  // Enhanced hover handlers with hysteresis
  const handleMouseEnter = useCallback(() => {
    if (!collapsible || isMobile || !hoverTransition.enabled) return;
    
    clearHoverTimer();
    
    const delay = hoverTransition.expandDelay || 150;
    
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsHovered(true);
        setIsTransitioning(true);
        setHoverTimer(null);
      }, delay);
      setHoverTimer(timer);
    } else {
      setIsHovered(true);
      setIsTransitioning(true);
    }
  }, [collapsible, isMobile, hoverTransition, clearHoverTimer]);
  
  const handleMouseLeave = useCallback(() => {
    if (!collapsible || isMobile || !hoverTransition.enabled) return;
    
    clearHoverTimer();
    
    // Add configurable hysteresis - longer delay for collapse to prevent jitter
    const baseDelay = hoverTransition.collapseDelay || 300;
    const hysteresisExtra = hoverTransition.hysteresisDelay || 100;
    const totalDelay = baseDelay + hysteresisExtra;
    
    if (totalDelay > 0) {
      const timer = setTimeout(() => {
        setIsHovered(false);
        setIsTransitioning(true);
        setHoverTimer(null);
      }, totalDelay);
      setHoverTimer(timer);
    } else {
      setIsHovered(false);
      setIsTransitioning(true);
    }
  }, [collapsible, isMobile, hoverTransition, clearHoverTimer]);
  
  // Handle transition end with improved state management
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    // Only handle width transitions to avoid conflicts with other animations
    if (e.propertyName === 'width') {
      setIsTransitioning(false);
    }
  }, []);
  
  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer]);

  // Handle mobile toggle
  const handleMobileToggle = useCallback((open: boolean) => {
    if (onMobileToggle) {
      onMobileToggle(open);
    } else {
      toggleMobile(open);
    }
  }, [onMobileToggle, toggleMobile]);

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!searchQuery || !search?.enabled) return effectiveItems;
    
    const filterItems = (items: SideBarItem[]): SideBarItem[] => {
      return items.filter(item => {
        // Check if the item title, textValue, or description matches
        const itemMatches = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.textValue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (item.items && item.items.length > 0) {
          // For sections or nest items, check children
          const filteredSubItems = filterItems(item.items);
          
          // Include section if:
          // 1. The section title matches, OR
          // 2. Any child items match
          if (itemMatches || filteredSubItems.length > 0) {
            return true;
          }
        } else {
          // For regular items, include if it matches
          return itemMatches;
        }
        
        return false;
      }).map(item => {
        if (item.items && item.items.length > 0) {
          const filteredSubItems = filterItems(item.items);
          
          // If section title matches but no children match, 
          // show the section but with empty items to maintain structure
          const shouldShowSection = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   item.textValue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   item.description?.toLowerCase().includes(searchQuery.toLowerCase());
          
          return { 
            ...item, 
            items: shouldShowSection && filteredSubItems.length === 0 ? [] : filteredSubItems
          };
        }
        return item;
      });
    };
    
    return search.onSearch ? search.onSearch(searchQuery, effectiveItems) : filterItems(effectiveItems);
  }, [effectiveItems, searchQuery, search]);

  // Enhanced section classes with height preservation and smooth transitions
  const sectionClasses = {
    base: cn(
      "w-full transition-all duration-300 ease-out",
      {
        "p-0 max-w-[44px]": isCompact,
      }
    ),
    group: cn(
      "transition-all duration-300 ease-out",
      {
        "flex flex-col gap-1": isCompact,
      }
    ),
    heading: cn(
      "transition-all duration-300 ease-out overflow-hidden",
      {
        [`opacity-0 h-0 transform scale-y-0 ${hideTextInCollapsed ? 'hidden' : ''}`]: isCompact,
        "opacity-100 h-auto transform scale-y-100": !isCompact,
      }
    ),
  };

  // Enhanced item classes with consistent height and smooth transitions
  const itemClasses = {
    base: cn(
      "transition-all duration-300 ease-out flex-shrink-0",
      "min-h-[44px] flex items-center", // Maintain consistent height
      {
        "w-11 h-11 gap-0 p-0 justify-center": isCompact,
        "min-h-[44px] px-3": !isCompact,
      }
    ),
  };

  // Render nested item with accordion
  const renderNestItem = useCallback((item: SideBarItem) => {
    const isNestType = item.items && item.items.length > 0 && item.type === SideBarItemType.Nest;

    if (isNestType) {
      // Remove href for nest type items
      const { href, ...itemWithoutHref } = item;
    }

    return (
      <ListboxItem
        {...item}
        key={item.key}
        classNames={{
          base: cn(
            {
              "h-auto p-0": !isCompact && isNestType,
            },
            {
              "inline-block w-11": isCompact && isNestType,
            },
          ),
        }}
        endContent={
          isCompact || isNestType || hideEndContent ? null : (item.endContent ?? null)
        }
        startContent={
          isCompact && !isNestType ? (
            // In compact mode, show icon as main content for regular items
            item.icon ? (
              typeof item.icon === 'string' ? (
                <Icon
                  className={cn(
                    "text-default-500 group-data-[selected=true]:text-foreground transition-colors duration-200",
                    iconClassName,
                  )}
                  icon={item.icon}
                  width={20}
                />
              ) : (
                item.icon
              )
            ) : (
              (item.startContent ?? null)
            )
          ) : isNestType ? null : (
            // In expanded mode, show icon as start content
            item.icon ? (
              typeof item.icon === 'string' ? (
                <Icon
                  className={cn(
                    "text-default-500 group-data-[selected=true]:text-foreground",
                    iconClassName,
                  )}
                  icon={item.icon}
                  width={24}
                />
              ) : (
                item.icon
              )
            ) : (
              (item.startContent ?? null)
            )
          )
        }
        title={isCompact || isNestType ? null : item.title}
      >
        {isCompact ? (
          <Tooltip 
            content={
              <div className="text-center">
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-tiny opacity-70">{item.description}</p>
                )}
                {item.items && item.items.length > 0 && (
                  <p className="text-tiny opacity-50 mt-1">
                    {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            } 
            placement="right" 
            showArrow
            delay={hoverTransition.showTooltip ? 300 : 0}
            className="z-50"
          >
            <div className="flex w-full items-center justify-center transition-all duration-200 hover:scale-110">
              {item.icon ? (
                typeof item.icon === 'string' ? (
                  <Icon
                    className={cn(
                      "text-default-500 group-data-[selected=true]:text-foreground transition-colors duration-200",
                      iconClassName,
                    )}
                    icon={item.icon}
                    width={20}
                  />
                ) : (
                  item.icon
                )
              ) : (
                (item.startContent ?? null)
              )}
            </div>
          </Tooltip>
        ) : null}
        {!isCompact && isNestType ? (
          <Accordion className="p-0">
            <AccordionItem
              key={item.key}
              aria-label={item.title}
              classNames={{
                heading: "pr-3",
                trigger: "p-0",
                content: "py-0 pl-4",
              }}
              title={
                item.icon ? (
                  <div className="flex h-11 items-center gap-2 px-2 py-1.5">
                    {typeof item.icon === 'string' ? (
                      <Icon
                        className={cn(
                          "text-default-500 group-data-[selected=true]:text-foreground",
                          iconClassName,
                        )}
                        icon={item.icon}
                        width={24}
                      />
                    ) : (
                      item.icon
                    )}
                    <span className="text-small text-default-500 group-data-[selected=true]:text-foreground font-medium">
                      {item.title}
                    </span>
                  </div>
                ) : (
                  (item.startContent ?? null)
                )
              }
            >
              {item.items && item.items.length > 0 ? (
                <Listbox
                  className="mt-0.5"
                  classNames={{
                    list: cn("border-l border-default-200 pl-4"),
                  }}
                  items={item.items}
                  variant="flat"
                >
                  {item.items.map(renderItem)}
                </Listbox>
              ) : null}
            </AccordionItem>
          </Accordion>
        ) : null}
      </ListboxItem>
    );
  }, [isCompact, hideEndContent, iconClassName]);

  // Render regular item
  const renderItem = useCallback((item: SideBarItem) => {
    const isNestType = item.items && item.items.length > 0 && item.type === SideBarItemType.Nest;

    if (isNestType) {
      return renderNestItem(item);
    }

    return (
      <ListboxItem
        {...item}
        key={item.key}
        endContent={isCompact || hideEndContent ? null : (item.endContent ?? null)}
        startContent={
          isCompact ? (
            // In compact mode, show icon as main content
            item.icon ? (
              typeof item.icon === 'string' ? (
                <Icon
                  className={cn(
                    "text-default-500 group-data-[selected=true]:text-foreground transition-colors duration-200",
                    iconClassName,
                  )}
                  icon={item.icon}
                  width={20}
                />
              ) : (
                item.icon
              )
            ) : (
              (item.startContent ?? null)
            )
          ) : (
            // In expanded mode, show icon as start content
            item.icon ? (
              typeof item.icon === 'string' ? (
                <Icon
                  className={cn(
                    "text-default-500 group-data-[selected=true]:text-foreground",
                    iconClassName,
                  )}
                  icon={item.icon}
                  width={24}
                />
              ) : (
                item.icon
              )
            ) : (
              (item.startContent ?? null)
            )
          )
        }
        textValue={item.textValue || item.title}
        title={isCompact ? item.title : undefined}
      >
        {isCompact ? null : item.title}
      </ListboxItem>
    );
  }, [isCompact, hideEndContent, iconClassName, renderNestItem]);

  // Enhanced sidebar classes with smooth hover transitions and jitter prevention
  const transitionDuration = hoverTransition.duration || 300;
  const transitionEasing = hoverTransition.easing || 'cubic-bezier(0.4, 0, 0.2, 1)';
  
  const sidebarClasses = cn(
    'flex flex-col h-screen bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
    'overflow-hidden fixed top-0 z-50',
    position === 'left' ? 'left-0 border-r' : 'right-0 border-l',
    // Enhanced transition classes with jitter prevention
    'transition-[width,transform,box-shadow] ease-out',
    isMobile ? 'duration-500' : `duration-[${transitionDuration}ms]`,
    // Mobile transform
    isMobile ? [
      effectiveMobileOpen ? 'translate-x-0' : (position === 'left' ? '-translate-x-full' : 'translate-x-full')
    ] : 'translate-x-0',
    // Hover effect classes with smooth shadows
    !isMobile && collapsible && hoverTransition.enabled && [
      'group',
      isHovered && 'shadow-2xl shadow-black/10 dark:shadow-black/40',
    ],
    // Performance optimization classes
    'will-change-[width]',
    // Prevent content shifting during transition
    'backface-hidden',
    className
  );

  // Overlay backdrop
  const renderOverlay = () => {
    const showOverlay = isMobile ? effectiveMobileOpen : !isCompact;
    if (!showOverlay) return null;

    return (
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-500",
          isMobile ? "bg-black/10" : "bg-black/5"
        )}
        onClick={() => {
          if (isMobile) {
            handleMobileToggle(false);
          } else if (collapsible && onCollapseToggle) {
            onCollapseToggle(true);
          }
        }}
        aria-hidden="true"
      />
    );
  };

  return (
    <>
      {renderOverlay()}
      
      {/* Enhanced Sidebar */}
      <aside
        ref={ref}
        role="complementary"
        className={sidebarClasses}
        style={{
          width: typeof (isCompact ? collapsedWidth : width) === 'number' 
            ? `${isCompact ? collapsedWidth : width}px` 
            : (isCompact ? collapsedWidth : width),
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: transitionEasing,
        }}
        onMouseEnter={collapsible && !isMobile && hoverTransition.enabled ? handleMouseEnter : undefined}
        onMouseLeave={collapsible && !isMobile && hoverTransition.enabled ? handleMouseLeave : undefined}
        onTransitionEnd={handleTransitionEnd}
        tabIndex={-1}
        {...props}
      >
        {/* Mobile Close Button */}
        {isMobile && effectiveMobileOpen && (
          <div className="flex justify-end p-2">
            <Button
              variant="light"
              size="sm"
              isIconOnly
              onPress={() => handleMobileToggle(false)}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Search Section */}
        {search?.enabled && !isCompact && (
          <div className="p-4 border-b border-default-200">
            <Input
              placeholder={search.placeholder || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
              className={search.className}
              size="sm"
            />
          </div>
        )}

        {/* Enhanced User Profile Section with Smooth Collapse Transition */}
        {effectiveUserInfo && (
          <div className={cn(
            "border-b border-default-200 transition-all duration-300 ease-out overflow-hidden",
            isCompact ? "p-2 h-16" : "p-4 h-auto"
          )}>
            {isCompact ? (
              // Compact user profile - icon only
              <div className="flex justify-center items-center h-full">
                <Avatar 
                  size="sm" 
                  src={effectiveUserInfo.avatar} 
                  name={effectiveUserInfo.name}
                  className={cn(
                    "transition-all duration-200 cursor-pointer hover:scale-110",
                    schoolUserInfo?.online && "ring-2 ring-success-200"
                  )}
                  onClick={() => onUserInfoClick?.(effectiveUserInfo)}
                />
                {schoolUserInfo?.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </div>
            ) : (
              // Expanded user profile - full info
              <div className="flex items-center gap-3">
                <Avatar 
                  isBordered 
                  size="sm" 
                  src={effectiveUserInfo.avatar} 
                  name={effectiveUserInfo.name}
                  className={cn(
                    "transition-all duration-200 cursor-pointer hover:scale-105",
                    schoolUserInfo?.online && "ring-2 ring-success-200"
                  )}
                  onClick={() => onUserInfoClick?.(effectiveUserInfo)}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-small text-default-600 font-medium truncate">
                    {effectiveUserInfo.name}
                  </p>
                  {schoolUserInfo ? (
                    <div className="flex flex-col gap-0.5">
                      <p className="text-tiny text-default-400 capitalize truncate">
                        {schoolUserInfo.role.replace('_', ' ')}
                      </p>
                      {schoolUserInfo.department && (
                        <p className="text-tiny text-default-300 truncate">
                          {schoolUserInfo.department}
                        </p>
                      )}
                      {schoolUserInfo.school && (
                        <p className="text-tiny text-default-300 truncate">
                          {schoolUserInfo.school}
                        </p>
                      )}
                    </div>
                  ) : (
                    effectiveUserInfo.role && (
                      <p className="text-tiny text-default-400 truncate">
                        {effectiveUserInfo.role}
                      </p>
                    )
                  )}
                </div>
                {schoolUserInfo?.online && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content with Enhanced Transitions */}
        <ScrollShadow className="flex-1 py-2 transition-all duration-300 ease-out">
          <Listbox
            key={isCompact ? "compact" : "default"}
            hideSelectedIcon
            as="nav"
            className={cn("list-none transition-all duration-300 ease-out", isCompact ? "px-1" : "px-2")}
            classNames={{
              list: cn("items-center gap-1"),
            }}
            color="default"
            itemClasses={{
              ...itemClasses,
              base: cn(
                "rounded-large data-[selected=true]:bg-default-100 transition-all duration-300 ease-out",
                "hover:bg-default-50 data-[selected=true]:hover:bg-default-100",
                "relative flex items-center justify-center", // Ensure proper flexbox alignment
                isCompact ? "w-10 h-10 mx-auto p-1 min-w-10" : "px-3 min-h-11 h-[44px]",
                itemClasses?.base,
              ),
              title: cn(
                "text-small font-medium text-default-500 group-data-[selected=true]:text-foreground",
                "transition-all duration-300 ease-out",
                isCompact && `opacity-0 w-0 h-0 overflow-hidden ${hideTextInCollapsed ? 'hidden' : ''}`
              ),
            }}
            items={filteredItems}
            selectedKeys={[selected] as unknown as Selection}
            selectionMode="single"
            variant="flat"
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              setSelected(key as React.Key);
              onSelect?.(key as string);
            }}
          >
            {(item) => {
              // Handle nest items (accordion-style)
              if (item.items && item.items.length > 0 && item.type === SideBarItemType.Nest) {
                return renderNestItem(item);
              }
              
              // Handle sections (with or without items after filtering)
              if (item.items && item.type !== SideBarItemType.Nest) {
                // If section has items, render as ListboxSection
                if (item.items.length > 0) {
                  return (
                    <ListboxSection
                      key={item.key}
                      classNames={sectionClasses}
                      showDivider={isCompact}
                      title={item.title}
                    >
                      {item.items.map(renderItem)}
                    </ListboxSection>
                  );
                }
                
                // If section has no items (due to search filtering), 
                // render as a regular item to show the section title
                if (searchQuery && search?.enabled) {
                  return renderItem({ ...item, items: undefined });
                }
                
                // Skip empty sections when not searching
                return null;
              }
              
              // Handle regular items
              return renderItem(item);
            }}
          </Listbox>
        </ScrollShadow>


      </aside>

      {/* Toggle Button - shown when sidebar is collapsed */}
      {isCompact && collapsible && (
        <Button
          variant="light"
          size="sm"
          isIconOnly
          onPress={() => {
            if (isMobile) {
              handleMobileToggle(true);
            } else if (onCollapseToggle) {
              onCollapseToggle(false);
            }
          }}
          className={cn(
            "fixed z-40 transition-all duration-500",
            position === 'left' ? "left-4" : "right-4",
            "top-4"
          )}
          aria-label={isMobile ? "Open sidebar" : "Expand sidebar"}
        >
          <Bars3Icon className="w-5 h-5" />
        </Button>
      )}
    </>
  );
});

SideBar.displayName = 'SideBar';