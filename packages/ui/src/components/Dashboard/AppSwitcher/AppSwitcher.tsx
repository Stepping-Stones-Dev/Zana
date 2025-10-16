import React, { useCallback, useRef, useState } from 'react';
import { cx } from '../../../internal/internal';
import { VisuallyHidden } from '../../VisuallyHidden';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react';
import { Squares2X2Icon } from '@heroicons/react/24/solid';

export interface AppSwitcherItem {
  name: string; // Display name (already localized by host app)
  icon?: React.ReactNode; // Arbitrary React node icon
  tooltip?: string; // Optional tooltip text; falls back to name
  onClick: () => void; // Invoked when item selected
  disabled?: boolean;
}

export interface AppSwitcherProps {
  currentAppName?: string; // Name of currently selected app (for matching highlight)
  currentAppIcon?: React.ReactNode;
  apps: AppSwitcherItem[];
  defaultIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string; // For screen readers when no textual label present
  onOpenChange?: (open: boolean) => void;
  menuWidth?: number | string; // Optional override for menu width (min width)
  columns?: number; // Grid column count (auto-fit if not set)
  showLabels?: boolean; // If true renders text labels under icons inside grid
  align?: 'start' | 'center' | 'end'; // Horizontal alignment relative to toggle
  analyticsId?: string; // For deterministic data attributes
}

const SIZE_DIMENSIONS: Record<NonNullable<AppSwitcherProps['size']>, number> = {
  sm: 28,
  md: 34,
  lg: 42,
};

export const AppSwitcher: React.FC<AppSwitcherProps> = ({
  currentAppName,
  currentAppIcon,
  apps,
  defaultIcon,
  className,
  size = 'md',
  ariaLabel = 'Application switcher',
  onOpenChange,
  menuWidth,
  columns = 3,
  showLabels = false,
  align = 'center',
  analyticsId = 'app.switcher.',
}) => {
  const [open, setOpen] = useState(false); // controlled
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);
  const toggle = () => setOpen(o => { const n = !o; onOpenChange?.(n); return n; });

  const dimension = SIZE_DIMENSIONS[size];
  const activeApp = apps.find(a => a.name === currentAppName);
  const displayIcon = currentAppIcon || activeApp?.icon || defaultIcon || (
    <Squares2X2Icon aria-hidden="true" width={dimension * 0.8} height={dimension * 0.8} />
  );

  const iconSizeRem = 3.45;
  const placement = align === 'center' ? 'bottom' : align === 'start' ? 'bottom-start' : 'bottom-end';
  return (
    <Popover isOpen={open} onOpenChange={(v)=>{ setOpen(v); onOpenChange?.(v); }} placement={placement}>
      <PopoverTrigger>
        <Button
          className={cx(className)}
          aria-label={ariaLabel}
            // HeroUI specific props for an icon-only toggle; fallback to onClick for tests
          isIconOnly
          variant="light"
          radius="sm"
          data-state={open ? 'open' : 'closed'}
          aria-haspopup="menu"
          aria-expanded={open}
          style={{ width: dimension, height: dimension, minWidth: dimension, padding: 0 }}
        >
          {displayIcon}
          <VisuallyHidden>{currentAppName ? `Current app: ${currentAppName}` : 'No app selected'}</VisuallyHidden>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        style={{ minWidth: menuWidth || 220, padding: '0.5rem' }}
      >
        <div
          role="menu"
          aria-label="Available applications"
          style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: '0.5rem'
          }}
        >
          {apps.map((app, idx) => {
            const selected = app.name === activeApp?.name;
            const minHeight = showLabels ? iconSizeRem * 16 + 28 : iconSizeRem * 16 + 12;
            const iconNode: React.ReactNode = app.icon;
            return (
              <Button
                key={app.name}
                ref={el => (itemsRef.current[idx] = el as HTMLButtonElement)}
                title={app.tooltip || app.name}
                aria-label={app.tooltip || app.name}
                aria-current={selected || undefined}
                role="menuitem"
                isDisabled={app.disabled}
                variant={selected ? 'flat' : 'light'}
                radius="sm"
                onClick={() => {
                  if (app.disabled) return;
                  app.onClick();
                  close();
                }}
                data-analytics-id={`${analyticsId}.item.${app.name}`}
                style={{ 
                  minHeight, 
                  padding: showLabels ? '.35rem .25rem' : '.4rem .25rem',
                  display: 'flex',
                  flexDirection: showLabels ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: showLabels ? '0.25rem' : '0.5rem'
                }}
              >
                <span 
                  aria-hidden="true"  
                  style={{ 
                    fontSize: `${iconSizeRem}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {iconNode || <span style={{ fontSize: '0.85rem' }}>□</span>}
                </span>
                {showLabels && (
                  <span 
                    style={{
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      fontWeight: selected ? '600' : '400'
                    }}
                  >
                    {app.name}
                  </span>
                )}
                {selected && !showLabels && (
                  <span 
                    aria-hidden="true" 
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'currentColor'
                    }}
                  />
                )}
              </Button>
            );
          })}
          {apps.length === 0 && (
            <div 
              style={{
                gridColumn: `1 / -1`,
                padding: '1rem',
                textAlign: 'center',
                color: 'rgb(115, 130, 140)',
                fontSize: '0.875rem'
              }}
            >
              No applications
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

AppSwitcher.displayName = 'AppSwitcher';

export default AppSwitcher;
