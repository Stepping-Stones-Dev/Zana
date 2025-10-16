import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { UserProfileMenu, type UserProfileMenuProps } from './UserProfileMenu';
import { 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, 
  ShieldCheckIcon, 
  UserCircleIcon,
  BellIcon,
  DocumentTextIcon,
  KeyIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/solid';

const meta: Meta<typeof UserProfileMenu> = {
  title: 'Dashboard/UserProfileMenu',
  component: UserProfileMenu,
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    docs: {
      description: {
        component: `
A comprehensive user profile dropdown menu with HeroUI integration. Features:

- **Avatar Display**: Shows profile image or initials fallback
- **Flexible Trigger**: Icon-only or expanded with name and user fields
- **Customizable Content**: User info, roles, and action sections
- **Theme Integration**: Fully supports HeroUI theming system
- **Accessibility**: WCAG compliant with proper ARIA attributes

## Key Props

- \`showName\`: Display user name in trigger button
- \`showUserField\`: Show additional info (email, phone, org) in trigger
- \`size\`: HeroUI Avatar size ('sm', 'md', 'lg')
- \`user.avatarUrl\`: Profile image URL (shows initials if not provided)
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: { type: 'object' },
      description: 'User profile information'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size'
    },
    showName: {
      control: { type: 'boolean' },
      description: 'Show user name in trigger'
    },
    showUserField: {
      control: { type: 'select' },
      options: ['none', 'email', 'phone', 'orgName'],
      description: 'Additional user field in trigger'
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'auto'],
      description: 'Popover alignment'
    },
    closeOnSelect: {
      control: { type: 'boolean' },
      description: 'Close menu after item selection'
    }
  }
};

export default meta;
type Story = StoryObj<typeof UserProfileMenu>;

// User data variations
const baseUser: UserProfileMenuProps['user'] = {
  firstName: 'Alice',
  lastName: 'Wonder',
  email: 'alice@example.com',
  phone: '+1 (555) 123-4567',
  orgName: 'Wonder Labs Inc.',
  roles: ['Admin', 'Developer', 'Team Lead']
};

const userWithAvatar: UserProfileMenuProps['user'] = {
  ...baseUser,
  avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
};

const minimalUser: UserProfileMenuProps['user'] = {
  email: 'user@example.com'
};

// Menu sections with various states
const menuSections = [
  {
    id: 'account',
    label: 'Account',
    items: [
      { 
        id: 'profile', 
        label: 'Profile Settings', 
        description: 'Manage your account details',
        icon: <UserCircleIcon className="w-4 h-4" />
      },
      { 
        id: 'preferences', 
        label: 'Preferences', 
        description: 'Customize your experience',
        icon: <Cog6ToothIcon className="w-4 h-4" />
      },
      { 
        id: 'billing', 
        label: 'Billing & Subscription', 
        disabled: true,
        description: 'Upgrade required',
        icon: <DocumentTextIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    items: [
      { 
        id: 'security-center', 
        label: 'Security Center', 
        description: 'Two-factor auth, login history',
        icon: <ShieldCheckIcon className="w-4 h-4" />
      },
      { 
        id: 'change-password', 
        label: 'Change Password', 
        icon: <KeyIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'help',
    label: 'Help & Support',
    items: [
      { 
        id: 'help-center', 
        label: 'Help Center', 
        href: 'https://help.example.com',
        external: true,
        icon: <QuestionMarkCircleIcon className="w-4 h-4" />
      },
      { 
        id: 'contact-support', 
        label: 'Contact Support',
        href: 'mailto:support@example.com',
        external: true,
        icon: <DocumentTextIcon className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'session',
    items: [
      { 
        id: 'logout', 
        label: 'Sign Out', 
        icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />, 
        danger: true 
      }
    ]
  }
];

const simpleMenuSections = [
  {
    id: 'simple',
    items: [
      { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-4 h-4" /> },
      { id: 'logout', label: 'Sign Out', danger: true, icon: <ArrowRightOnRectangleIcon className="w-4 h-4" /> }
    ]
  }
];

// 1. Default - Standard configuration with initials and expanded trigger
export const Default: Story = {
  args: {
    user: baseUser,
    sections: menuSections,
    showName: true,
    showUserField: 'email',
    size: 'md',
    align: 'end',
    closeOnSelect: true
  }
};

// 2. Icon Only - Minimal trigger showing only avatar/initials
export const IconOnly: Story = {
  args: {
    user: baseUser,
    sections: menuSections,
    showName: false,
    showUserField: 'none',
    size: 'md',
    align: 'end',
    closeOnSelect: true
  }
};

// 3. With Avatar - Shows profile image with expanded trigger
export const WithAvatar: Story = {
  args: {
    user: userWithAvatar,
    sections: menuSections,
    showName: true,
    showUserField: 'email',
    size: 'md',
    align: 'end',
    closeOnSelect: true
  }
};

// 4. Minimal Setup - Basic user data with simple menu
export const Minimal: Story = {
  args: {
    user: minimalUser,
    sections: simpleMenuSections,
    showName: true,
    showUserField: 'email',
    size: 'sm',
    align: 'end',
    closeOnSelect: true
  }
};

// 5. Dashboard Integration - Real-world usage example
export const DashboardExample: Story = {
  name: 'In Dashboard Layout',
  args: {
    user: userWithAvatar,
    sections: menuSections,
    showName: true,
    showUserField: 'email',
    size: 'md',
    align: 'end',
    closeOnSelect: true
  },
  render: (args) => (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between mb-8 p-4 bg-content1 rounded-large shadow-small border border-divider">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            Z
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Zana Dashboard</h1>
            <p className="text-sm text-foreground-500">Welcome back, {args.user.firstName}!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-default-100 transition-colors">
            <BellIcon className="w-5 h-5 text-foreground-600" />
          </button>
          <UserProfileMenu {...args} />
        </div>
      </header>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-content2 rounded-large">
          <h3 className="text-lg font-semibold text-foreground mb-2">Analytics</h3>
          <p className="text-foreground-600">User engagement metrics...</p>
        </div>
        <div className="p-6 bg-content2 rounded-large">
          <h3 className="text-lg font-semibold text-foreground mb-2">Recent Activity</h3>
          <p className="text-foreground-600">Latest user actions...</p>
        </div>
        <div className="p-6 bg-content2 rounded-large">
          <h3 className="text-lg font-semibold text-foreground mb-2">Tasks</h3>
          <p className="text-foreground-600">Pending items...</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen'
  }
};

// 6. Interactive Playground - Comprehensive testing
export const Playground: Story = {
  args: {
    user: userWithAvatar,
    sections: menuSections,
    showName: true,
    showUserField: 'email',
    size: 'md',
    align: 'end',
    closeOnSelect: true
  },
  parameters: {
    docs: {
      description: {
        story: `
**Interactive Playground** - Use the controls panel to experiment with different configurations:

- **User Data**: Modify user information (name, email, avatar, roles)
- **Trigger Display**: Toggle name and user field visibility
- **Avatar Size**: Test small, medium, and large sizes
- **Alignment**: Try different popover positions
- **Menu Behavior**: Control close-on-select functionality

This story includes all menu states: enabled, disabled, external links, and danger actions.
        `
      }
    }
  }
};
