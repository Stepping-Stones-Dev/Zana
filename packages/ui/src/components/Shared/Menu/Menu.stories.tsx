import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Menu } from './Menu';
import { Button } from '@heroui/react';
import { 
  HomeIcon, 
  UserIcon, 
  CogIcon, 
  DocumentIcon,
  FolderIcon,
  ChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import type { MenuItem, MenuGroup } from './types';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive Menu component that supports navigation menus, context menus, dropdown menus, and sidenavs with keyboard navigation and accessibility features.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'object',
    },
    behavior: {
      control: 'object',
    },
    accessibility: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

// Sample menu items for stories
const basicMenuItems: MenuItem[] = [
  {
    type: 'action',
    id: 'home',
    label: 'Home',
    icon: <HomeIcon className="w-5 h-5" />,
    onClick: (id) => console.log(`Clicked ${id}`),
    active: true
  },
  {
    type: 'action',
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon className="w-5 h-5" />,
    onClick: (id) => console.log(`Clicked ${id}`)
  },
  {
    type: 'action',
    id: 'settings',
    label: 'Settings',
    icon: <CogIcon className="w-5 h-5" />,
    onClick: (id) => console.log(`Clicked ${id}`)
  },
  {
    type: 'divider',
    id: 'divider-1'
  },
  {
    type: 'action',
    id: 'logout',
    label: 'Sign Out',
    icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
    onClick: (id) => console.log(`Clicked ${id}`)
  }
];

const navigationItems: MenuItem[] = [
  {
    type: 'link',
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className="w-5 h-5" />,
    href: '/dashboard',
    active: true
  },
  {
    type: 'link',
    id: 'analytics',
    label: 'Analytics',
    icon: <ChartBarIcon className="w-5 h-5" />,
    href: '/analytics'
  },
  {
    type: 'link',
    id: 'documents',
    label: 'Documents',
    icon: <DocumentIcon className="w-5 h-5" />,
    href: '/documents'
  },
  {
    type: 'link',
    id: 'files',
    label: 'Files',
    icon: <FolderIcon className="w-5 h-5" />,
    href: '/files'
  }
];

const groupedMenuItems: (MenuItem | MenuGroup)[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    items: [
      {
        type: 'link',
        id: 'dashboard',
        label: 'Dashboard',
        icon: <HomeIcon className="w-5 h-5" />,
        href: '/dashboard',
        active: true
      },
      {
        type: 'link',
        id: 'analytics',
        label: 'Analytics',
        icon: <ChartBarIcon className="w-5 h-5" />,
        href: '/analytics'
      }
    ]
  },
  {
    id: 'content',
    title: 'Content Management',
    items: [
      {
        type: 'link',
        id: 'documents',
        label: 'Documents',
        icon: <DocumentIcon className="w-5 h-5" />,
        href: '/documents'
      },
      {
        type: 'link',
        id: 'files',
        label: 'Files',
        icon: <FolderIcon className="w-5 h-5" />,
        href: '/files'
      }
    ]
  },
  {
    id: 'user',
    title: 'User',
    items: [
      {
        type: 'action',
        id: 'profile',
        label: 'Profile Settings',
        icon: <UserIcon className="w-5 h-5" />,
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'action',
        id: 'notifications',
        label: 'Notifications',
        icon: <BellIcon className="w-5 h-5" />,
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'divider',
        id: 'divider-user'
      },
      {
        type: 'action',
        id: 'logout',
        label: 'Sign Out',
        icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
        onClick: (id) => console.log(`Clicked ${id}`)
      }
    ]
  }
];

// Basic dropdown menu
export const BasicDropdown: Story = {
  args: {
    items: basicMenuItems,
    trigger: <Button>Open Menu</Button>,
    layout: {
      size: 'md'
    }
  }
};

// Navigation menu (inline)
export const NavigationMenu: Story = {
  args: {
    items: navigationItems,
    inline: true,
    layout: {
      size: 'md',
      orientation: 'vertical'
    }
  }
};

// Horizontal menu bar
export const HorizontalMenuBar: Story = {
  args: {
    items: navigationItems.slice(0, 4),
    inline: true,
    layout: {
      orientation: 'horizontal',
      size: 'md'
    },
    className: 'border border-gray-200 rounded-lg p-2'
  }
};

// Sidenav example
export const SideBar: Story = {
  args: {
    items: groupedMenuItems,
    inline: true,
    layout: {
      size: 'md',
      orientation: 'vertical',
      minWidth: '256px'
    },
    className: 'w-64 h-96 border border-gray-200 rounded-lg p-3 bg-gray-50'
  }
};

// Compact menu
export const CompactMenu: Story = {
  args: {
    items: basicMenuItems,
    trigger: <Button size="sm">Compact</Button>,
    layout: {
      size: 'sm',
      density: 'compact'
    }
  }
};

// Large menu
export const LargeMenu: Story = {
  args: {
    items: basicMenuItems,
    trigger: <Button size="lg">Large Menu</Button>,
    layout: {
      size: 'lg',
      density: 'spacious'
    }
  }
};

// Icon-only menu
export const IconOnlyMenu: Story = {
  args: {
    items: basicMenuItems.map(item => {
      if (item.type === 'divider') return item;
      return {
        ...item,
        label: item.tooltip || 'Menu Item' // Keep a label for accessibility but rely on icons
      };
    }),
    trigger: <Button isIconOnly><CogIcon className="w-5 h-5" /></Button>,
    layout: {
      showIcons: true
    }
  }
};

// Text-only menu
export const TextOnlyMenu: Story = {
  args: {
    items: basicMenuItems,
    trigger: <Button variant="ghost">Text Only</Button>,
    layout: {
      showIcons: false
    }
  }
};

// Menu with shortcuts
export const MenuWithShortcuts: Story = {
  args: {
    items: [
      {
        type: 'action',
        id: 'new',
        label: 'New File',
        icon: <DocumentIcon className="w-5 h-5" />,
        shortcut: '⌘N',
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'action',
        id: 'open',
        label: 'Open File',
        icon: <FolderIcon className="w-5 h-5" />,
        shortcut: '⌘O',
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'divider',
        id: 'divider-1'
      },
      {
        type: 'action',
        id: 'save',
        label: 'Save',
        shortcut: '⌘S',
        onClick: (id) => console.log(`Clicked ${id}`)
      }
    ] as MenuItem[],
    trigger: <Button>File Menu</Button>
  }
};

// Multiple selection menu
export const MultipleSelectionMenu: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<string[]>(['option1']);
    
    const selectionItems: MenuItem[] = [
      {
        type: 'action',
        id: 'option1',
        label: 'Option 1',
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'action',
        id: 'option2',
        label: 'Option 2',
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'action',
        id: 'option3',
        label: 'Option 3',
        onClick: (id) => console.log(`Clicked ${id}`)
      }
    ];

    return (
      <Menu
        items={selectionItems}
        trigger={<Button>Multiple Selection</Button>}
        behavior={{
          selectionMode: 'multiple',
          selectedItems
        }}
        onSelectionChange={setSelectedItems}
      />
    );
  }
};

// Collapsible groups menu
export const CollapsibleGroupsMenu: Story = {
  args: {
    items: [
      {
        id: 'recent',
        title: 'Recent Files',
        collapsible: true,
        items: [
          {
            type: 'action',
            id: 'file1',
            label: 'document.pdf',
            icon: <DocumentIcon className="w-5 h-5" />,
            onClick: (id) => console.log(`Clicked ${id}`)
          },
          {
            type: 'action',
            id: 'file2',
            label: 'presentation.pptx',
            icon: <DocumentIcon className="w-5 h-5" />,
            onClick: (id) => console.log(`Clicked ${id}`)
          }
        ]
      },
      {
        id: 'favorites',
        title: 'Favorites',
        collapsible: true,
        defaultCollapsed: true,
        items: [
          {
            type: 'action',
            id: 'fav1',
            label: 'Important Document',
            icon: <DocumentIcon className="w-5 h-5" />,
            onClick: (id) => console.log(`Clicked ${id}`)
          }
        ]
      }
    ] as MenuGroup[],
    inline: true,
    className: 'w-64 border border-gray-200 rounded-lg p-3'
  }
};

// Disabled items menu
export const DisabledItemsMenu: Story = {
  args: {
    items: [
      {
        type: 'action',
        id: 'enabled',
        label: 'Enabled Item',
        icon: <HomeIcon className="w-5 h-5" />,
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'action',
        id: 'disabled',
        label: 'Disabled Item',
        icon: <UserIcon className="w-5 h-5" />,
        disabled: true,
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'link',
        id: 'disabled-link',
        label: 'Disabled Link',
        href: '/nowhere',
        disabled: true
      }
    ] as MenuItem[],
    trigger: <Button>With Disabled Items</Button>
  }
};

// Right-click context menu simulation
export const ContextMenu: Story = {
  render: () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const contextItems: MenuItem[] = [
      {
        type: 'action',
        id: 'copy',
        label: 'Copy',
        shortcut: '⌘C',
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'action',
        id: 'paste',
        label: 'Paste',
        shortcut: '⌘V',
        onClick: (id) => console.log(`Clicked ${id}`)
      },
      {
        type: 'divider',
        id: 'divider-1'
      },
      {
        type: 'action',
        id: 'delete',
        label: 'Delete',
        onClick: (id) => console.log(`Clicked ${id}`)
      }
    ];

    return (
      <div>
        <div
          className="w-64 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setMenuOpen(true);
          }}
        >
          Right-click me for context menu
        </div>
        
        {menuOpen && (
          <div
            style={{
              position: 'fixed',
              top: menuPosition.y,
              left: menuPosition.x,
              zIndex: 1000
            }}
          >
            <Menu
              items={contextItems}
              inline
              open={menuOpen}
              onOpenChange={setMenuOpen}
              behavior={{
                closeOnClickOutside: true
              }}
            />
          </div>
        )}
      </div>
    );
  }
};