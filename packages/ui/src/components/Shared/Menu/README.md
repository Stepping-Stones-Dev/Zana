# Menu Components

A comprehensive set of menu components for the Zana UI library, supporting navigation menus, context menus, dropdown menus, and sidenavs with full keyboard navigation and accessibility features.

## Features

- ✅ **Flexible Menu Items**: Support for action items, links, dividers, and custom content
- ✅ **Menu Groups**: Organize items into collapsible sections with headers
- ✅ **Keyboard Navigation**: Full arrow key, Enter/Space, Home/End, and type-ahead support
- ✅ **Accessibility First**: Comprehensive ARIA attributes and screen reader support
- ✅ **Multiple Selection**: Single or multiple selection modes with visual indicators
- ✅ **Responsive Layouts**: Horizontal/vertical orientations, multiple sizes and densities
- ✅ **Active States**: Visual indication of current/active menu items
- ✅ **Icon Support**: Flexible icon positioning (left, right, top, bottom)
- ✅ **Industry Standards**: Follows established menu interaction patterns
- ✅ **TypeScript**: Fully typed with comprehensive interfaces

## Components

### Menu

The main menu container component that can be rendered inline or as an overlay with a trigger.

```tsx
import { Menu } from '@zana/ui';

// Basic dropdown menu
<Menu
  items={menuItems}
  trigger={<Button>Open Menu</Button>}
/>

// Inline navigation menu
<Menu
  items={navigationItems}
  inline
  layout={{ orientation: 'vertical' }}
/>
```

### MenuItem

Individual menu item component (usually used internally by Menu).

```tsx
import { MenuItemComponent } from '@zana/ui';

<MenuItemComponent
  item={{
    type: 'action',
    id: 'save',
    label: 'Save',
    icon: <SaveIcon />,
    onClick: handleSave
  }}
/>
```

### MenuGroup

Component for organizing related menu items with optional headers and collapsible functionality.

```tsx
import { MenuGroup } from '@zana/ui';

<MenuGroup
  group={{
    id: 'files',
    title: 'File Operations',
    collapsible: true,
    items: fileMenuItems
  }}
/>
```

## Menu Item Types

### Action Items

Execute a function when clicked:

```tsx
{
  type: 'action',
  id: 'save',
  label: 'Save Document',
  icon: <SaveIcon />,
  shortcut: '⌘S',
  onClick: (id, event) => handleSave(),
  active: true, // Mark as currently active
  disabled: false
}
```

### Link Items

Navigate to URLs:

```tsx
{
  type: 'link',
  id: 'home',
  label: 'Home',
  icon: <HomeIcon />,
  href: '/dashboard',
  external: false, // Opens in same window
  active: true
}
```

### Divider Items

Visual separators between sections:

```tsx
{
  type: 'divider',
  id: 'divider-1',
  label: 'Optional Section Label' // Creates labeled divider
}
```

### Custom Items

Render custom content:

```tsx
{
  type: 'custom',
  id: 'custom',
  label: 'Custom Content',
  render: ({ active, disabled }) => (
    <div>Custom menu item content</div>
  )
}
```

## Usage Examples

### Basic Navigation Menu

```tsx
const navigationItems = [
  {
    type: 'link',
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/dashboard',
    active: true
  },
  {
    type: 'link',
    id: 'analytics',
    label: 'Analytics',
    icon: <ChartIcon />,
    href: '/analytics'
  },
  {
    type: 'divider',
    id: 'divider-1'
  },
  {
    type: 'action',
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    onClick: () => openSettings()
  }
];

<Menu items={navigationItems} inline />
```

### Sidenav with Groups

```tsx
const sidenavItems = [
  {
    id: 'navigation',
    title: 'Navigation',
    items: [
      {
        type: 'link',
        id: 'dashboard',
        label: 'Dashboard',
        icon: <HomeIcon />,
        href: '/dashboard',
        active: true
      }
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    collapsible: true,
    items: [
      {
        type: 'action',
        id: 'calculator',
        label: 'Calculator',
        icon: <CalculatorIcon />,
        onClick: () => openCalculator()
      }
    ]
  }
];

<Menu
  items={sidenavItems}
  inline
  layout={{
    size: 'md',
    orientation: 'vertical',
    minWidth: '256px'
  }}
  className="w-64 h-full border-r bg-gray-50"
/>
```

### Context Menu

```tsx
const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });

const contextItems = [
  {
    type: 'action',
    id: 'copy',
    label: 'Copy',
    shortcut: '⌘C',
    onClick: () => copy()
  },
  {
    type: 'action',
    id: 'paste',
    label: 'Paste',
    shortcut: '⌘V',
    onClick: () => paste()
  }
];

<div
  onContextMenu={(e) => {
    e.preventDefault();
    setContextMenu({ open: true, x: e.clientX, y: e.clientY });
  }}
>
  Right-click me
</div>

{contextMenu.open && (
  <div
    style={{
      position: 'fixed',
      top: contextMenu.y,
      left: contextMenu.x,
      zIndex: 1000
    }}
  >
    <Menu
      items={contextItems}
      inline
      onItemActivate={() => setContextMenu({ open: false, x: 0, y: 0 })}
    />
  </div>
)}
```

### Multiple Selection Menu

```tsx
const [selectedItems, setSelectedItems] = useState(['option1']);

<Menu
  items={selectionItems}
  trigger={<Button>Select Options</Button>}
  behavior={{
    selectionMode: 'multiple',
    selectedItems
  }}
  onSelectionChange={setSelectedItems}
/>
```

## Layout Options

### Orientation

```tsx
// Vertical (default)
<Menu layout={{ orientation: 'vertical' }} />

// Horizontal
<Menu layout={{ orientation: 'horizontal' }} />
```

### Size Variants

```tsx
// Small
<Menu layout={{ size: 'sm' }} />

// Medium (default)
<Menu layout={{ size: 'md' }} />

// Large
<Menu layout={{ size: 'lg' }} />
```

### Density

```tsx
// Compact
<Menu layout={{ density: 'compact' }} />

// Comfortable (default)
<Menu layout={{ density: 'comfortable' }} />

// Spacious
<Menu layout={{ density: 'spacious' }} />
```

### Icon Configuration

```tsx
// Hide icons
<Menu layout={{ showIcons: false }} />

// Position icons
<Menu layout={{ iconPosition: 'right' }} />
<Menu layout={{ iconPosition: 'top' }} />
```

## Behavior Configuration

### Keyboard Navigation

```tsx
<Menu
  behavior={{
    keyboardNavigation: true, // Enable arrow keys (default)
    autoFocus: true, // Auto-focus first item when opened
    closeOnEscape: true, // Close on Escape key
    closeOnSelect: true // Close after selection
  }}
/>
```

### Selection Modes

```tsx
// Single selection (default)
<Menu behavior={{ selectionMode: 'single' }} />

// Multiple selection
<Menu behavior={{ selectionMode: 'multiple' }} />

// No selection
<Menu behavior={{ selectionMode: 'none' }} />
```

## Accessibility Features

### ARIA Attributes

```tsx
<Menu
  accessibility={{
    'aria-label': 'Main Navigation',
    'aria-describedby': 'nav-description',
    role: 'navigation' // or 'menu', 'menubar', 'listbox'
  }}
/>
```

### Keyboard Support

- **Arrow Keys**: Navigate between items
- **Enter/Space**: Activate focused item
- **Home/End**: Jump to first/last item
- **Escape**: Close menu
- **Type-ahead**: Start typing to find items

### Screen Reader Support

- Proper roles and ARIA attributes
- Active state announcements
- Selection state communication
- Group structure indication

## Styling

The Menu components use Tailwind CSS classes and can be customized with:

```tsx
<Menu
  className="custom-menu-styles"
  layout={{
    maxWidth: '300px',
    minWidth: '200px'
  }}
/>
```

## Event Handling

```tsx
<Menu
  items={items}
  onSelectionChange={(selectedIds) => {
    console.log('Selected items:', selectedIds);
  }}
  onItemActivate={(itemId, item) => {
    console.log('Item activated:', itemId);
  }}
  onOpenChange={(open) => {
    console.log('Menu open state:', open);
  }}
/>
```

## TypeScript Support

All components are fully typed with comprehensive interfaces:

```tsx
import type { 
  MenuItem, 
  MenuConfig, 
  MenuLayout, 
  MenuBehavior 
} from '@zana/ui';

const menuConfig: MenuConfig = {
  items: menuItems,
  layout: { size: 'md', orientation: 'vertical' },
  behavior: { selectionMode: 'single' }
};
```

## Best Practices

1. **Use semantic menu item types** - prefer `link` for navigation, `action` for functions
2. **Provide meaningful labels** - ensure all items have descriptive labels for accessibility
3. **Include keyboard shortcuts** - add shortcut displays for common actions
4. **Group related items** - use MenuGroups and dividers to organize content
5. **Mark active states** - highlight current page/selection for navigation menus
6. **Handle loading states** - disable items that are processing
7. **Consider mobile** - ensure touch targets are appropriately sized
8. **Test with keyboard only** - verify all functionality works without mouse
9. **Provide tooltips** - add helpful tooltip text for icon-only items
10. **Use consistent iconography** - maintain visual consistency across menu items

## Performance

- Components use React.memo and useCallback for optimal re-rendering
- Keyboard navigation is debounced for smooth interaction
- Large menus support virtualization (coming in future version)
- Menu state is efficiently managed with custom hooks

## Browser Support

- Modern browsers with ES2017+ support
- Internet Explorer 11+ (with polyfills)
- Full keyboard navigation support
- Touch device compatibility