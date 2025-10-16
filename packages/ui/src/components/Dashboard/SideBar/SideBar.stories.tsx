import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SideBar } from './index';
import { SideBarItemType, SchoolUserRole } from './types';
import type { SideBarProps, SideBarItem, UserInfo, SchoolUserInfo } from './types';
import { getNavigationByRole, getDefaultSchoolConfig } from './schoolNavigation';

const meta = {
  title: 'Dashboard/SideBar',
  component: SideBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A responsive, collapsible sidebar component with Gmail-style hover expansion, search functionality, nested navigation, and user profile management.',
      },
    },
  },
  argTypes: {
    items: {
      description: 'Array of navigation items to display in the sidebar',
      control: false,
    },
    isCollapsed: {
      description: 'Whether the sidebar is in collapsed state',
      control: 'boolean',
    },
    collapsible: {
      description: 'Whether the sidebar can be collapsed/expanded',
      control: 'boolean',
    },
    hoverTransition: {
      description: 'Hover transition configuration for smooth expand/collapse',
      control: 'object',
    },
    schoolUserInfo: {
      description: 'School-specific user information with role-based features',
      control: false,
    },
    schoolConfig: {
      description: 'School navigation configuration',
      control: false,
    },
    position: {
      description: 'Position of the sidebar',
      control: 'select',
      options: ['left', 'right'],
    },
    width: {
      description: 'Width of the sidebar when expanded',
      control: 'text',
    },
    collapsedWidth: {
      description: 'Width of the sidebar when collapsed',
      control: 'text',
    },
    hideEndContent: {
      description: 'Hide end content in collapsed mode',
      control: 'boolean',
    },
    mobileOpen: {
      description: 'Whether sidebar is open on mobile',
      control: 'boolean',
    },
    defaultSelectedKey: {
      description: 'Default selected navigation item',
      control: 'text',
    },
    onSelect: { action: 'selected' },
    onItemClick: { action: 'item clicked' },
    onCollapseToggle: { action: 'collapse toggled' },
    onMobileToggle: { action: 'mobile toggled' },
    onUserInfoClick: { action: 'user info clicked' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SideBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock user info
const mockUser: UserInfo = {
  name: 'Sarah Johnson',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'Product Manager',
  email: 'sarah.johnson@company.com',
  online: true,
};

// School management system mock users
const mockPrincipal: SchoolUserInfo = {
  name: 'Dr. Elizabeth Harper',
  avatar: 'https://i.pravatar.cc/150?img=2',
  role: SchoolUserRole.PRINCIPAL,
  email: 'elizabeth.harper@greenwood.edu',
  id: 'PRI001',
  department: 'Administration',
  school: 'Greenwood High School',
  online: true,
  academicYear: '2024-25',
  permissions: ['all_access'],
  lastLogin: new Date(),
};

const mockTeacher: SchoolUserInfo = {
  name: 'Prof. Michael Chen',
  avatar: 'https://i.pravatar.cc/150?img=3',
  role: SchoolUserRole.TEACHER,
  email: 'michael.chen@greenwood.edu',
  id: 'TCH042',
  department: 'Mathematics',
  school: 'Greenwood High School',
  online: true,
  academicYear: '2024-25',
  permissions: ['grade_management', 'attendance', 'assignments'],
};

const mockStudent: SchoolUserInfo = {
  name: 'Emma Rodriguez',
  avatar: 'https://i.pravatar.cc/150?img=4',
  role: SchoolUserRole.STUDENT,
  email: 'emma.rodriguez@student.greenwood.edu',
  id: 'STU2024156',
  department: 'Grade 11-A',
  school: 'Greenwood High School',
  online: true,
  academicYear: '2024-25',
};

const mockParent: SchoolUserInfo = {
  name: 'James Rodriguez',
  avatar: 'https://i.pravatar.cc/150?img=5',
  role: SchoolUserRole.PARENT,
  email: 'james.rodriguez@parent.greenwood.edu',
  id: 'PAR789',
  department: 'Parent Portal',
  school: 'Greenwood High School',
  online: false,
  academicYear: '2024-25',
};

// Basic navigation items
const basicItems: SideBarItem[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'solar:home-2-bold-duotone',
    href: '/dashboard',
  },
  {
    key: 'analytics',
    title: 'Analytics',
    icon: 'solar:chart-2-bold-duotone',
    href: '/analytics',
    endContent: <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">New</span>,
  },
  {
    key: 'projects',
    title: 'Projects',
    icon: 'solar:folder-bold-duotone',
    href: '/projects',
    endContent: <span className="text-xs text-default-400">12</span>,
  },
  {
    key: 'tasks',
    title: 'Tasks',
    icon: 'solar:checklist-minimalistic-bold-duotone',
    href: '/tasks',
    endContent: <span className="text-xs bg-warning-100 text-warning-600 px-2 py-0.5 rounded-full">3</span>,
  },
  {
    key: 'calendar',
    title: 'Calendar',
    icon: 'solar:calendar-bold-duotone',
    href: '/calendar',
  },
  {
    key: 'messages',
    title: 'Messages',
    icon: 'solar:chat-round-bold-duotone',
    href: '/messages',
    endContent: <span className="w-2 h-2 bg-danger-500 rounded-full"></span>,
  },
];

// Nested navigation items
const nestedItems: SideBarItem[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'solar:home-2-bold-duotone',
    href: '/dashboard',
  },
  {
    key: 'projects',
    title: 'Projects',
    icon: 'solar:folder-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'all-projects',
        title: 'All Projects',
        icon: 'solar:list-bold-duotone',
        href: '/projects',
      },
      {
        key: 'active-projects',
        title: 'Active',
        icon: 'solar:play-bold-duotone',
        href: '/projects/active',
        endContent: <span className="text-xs text-default-400">8</span>,
      },
      {
        key: 'completed-projects',
        title: 'Completed',
        icon: 'solar:check-circle-bold-duotone',
        href: '/projects/completed',
        endContent: <span className="text-xs text-default-400">24</span>,
      },
      {
        key: 'archived-projects',
        title: 'Archived',
        icon: 'solar:archive-bold-duotone',
        href: '/projects/archived',
      },
    ],
  },
  {
    key: 'team',
    title: 'Team',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'team-members',
        title: 'Members',
        icon: 'solar:user-bold-duotone',
        href: '/team/members',
        endContent: <span className="text-xs text-default-400">12</span>,
      },
      {
        key: 'team-roles',
        title: 'Roles & Permissions',
        icon: 'solar:shield-user-bold-duotone',
        href: '/team/roles',
      },
      {
        key: 'team-invites',
        title: 'Invitations',
        icon: 'solar:letter-bold-duotone',
        href: '/team/invites',
        endContent: <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">2</span>,
      },
    ],
  },
  {
    key: 'reports',
    title: 'Reports',
    icon: 'solar:chart-2-bold-duotone',
    href: '/reports',
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: 'solar:settings-bold-duotone',
    href: '/settings',
  },
];

// Sectioned navigation items
const sectionedItems: SideBarItem[] = [
  {
    key: 'workspace-section',
    title: 'Workspace',
    type: SideBarItemType.Section,
    items: [
      {
        key: 'dashboard',
        title: 'Dashboard',
        icon: 'solar:home-2-bold-duotone',
        href: '/dashboard',
      },
      {
        key: 'analytics',
        title: 'Analytics',
        icon: 'solar:chart-2-bold-duotone',
        href: '/analytics',
      },
      {
        key: 'projects',
        title: 'Projects',
        icon: 'solar:folder-bold-duotone',
        href: '/projects',
      },
    ],
  },
  {
    key: 'management-section',
    title: 'Management',
    type: SideBarItemType.Section,
    items: [
      {
        key: 'team',
        title: 'Team',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        href: '/team',
      },
      {
        key: 'resources',
        title: 'Resources',
        icon: 'solar:library-bold-duotone',
        href: '/resources',
      },
      {
        key: 'reports',
        title: 'Reports',
        icon: 'solar:document-text-bold-duotone',
        href: '/reports',
      },
    ],
  },
  {
    key: 'system-section',
    title: 'System',
    type: SideBarItemType.Section,
    items: [
      {
        key: 'settings',
        title: 'Settings',
        icon: 'solar:settings-bold-duotone',
        href: '/settings',
      },
      {
        key: 'integrations',
        title: 'Integrations',
        icon: 'solar:puzzle-bold-duotone',
        href: '/integrations',
        endContent: <span className="text-xs bg-success-100 text-success-600 px-2 py-0.5 rounded-full">Pro</span>,
      },
      {
        key: 'billing',
        title: 'Billing',
        icon: 'solar:card-bold-duotone',
        href: '/billing',
      },
    ],
  },
];

// Template for interactive stories
const Template = (args: SideBarProps) => {
  const [selectedKey, setSelectedKey] = useState(args.defaultSelectedKey || 'dashboard');
  const [collapsed, setCollapsed] = useState(args.isCollapsed || false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar
        {...args}
        isCollapsed={collapsed}
        mobileOpen={mobileOpen}
        defaultSelectedKey={selectedKey}
        onSelect={(key: string) => {
          setSelectedKey(key);
          args.onSelect?.(key);
        }}
        onCollapseToggle={(isCollapsed: boolean) => {
          setCollapsed(isCollapsed);
          args.onCollapseToggle?.(isCollapsed);
        }}
        onMobileToggle={(open: boolean) => {
          setMobileOpen(open);
          args.onMobileToggle?.(open);
        }}
        onItemClick={(key: string, item: any, event: any) => {
          args.onItemClick?.(key, item, event);
        }}
        onUserInfoClick={(userInfo: UserInfo) => {
          args.onUserInfoClick?.(userInfo);
        }}
      />
      
      {/* Main content area */}
      <div className={`transition-all duration-500 ${collapsed ? 'ml-16' : 'ml-72'} p-8`}>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Main Content Area
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Selected item: <strong>{selectedKey}</strong>
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Interactive Sidebar Demo</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Click on navigation items to see selection state</li>
              <li>• Hover over collapsed sidebar to expand it</li>
              <li>• Try the sidebar on different screen sizes</li>
              <li>• Use search functionality when enabled</li>
              <li>• Click user avatar for profile actions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default sidebar with basic navigation
export const Default: Story = {
  render: Template,
  args: {
    items: basicItems,
    collapsible: true,
    defaultSelectedKey: 'dashboard',
    userInfo: mockUser,
  },
};

// Collapsed sidebar with hover expansion
export const Collapsed: Story = {
  render: Template,
  args: {
    items: basicItems,
    isCollapsed: true,
    collapsible: true,
    defaultSelectedKey: 'analytics',
    userInfo: mockUser,
    hoverTransition: {
      enabled: true,
      expandDelay: 100,
      collapseDelay: 300,
      duration: 250,
    },
  },
};

// Nested navigation with expandable sections
export const WithNestedNavigation: Story = {
  render: Template,
  args: {
    items: nestedItems,
    collapsible: true,
    defaultSelectedKey: 'active-projects',
    userInfo: mockUser,
    search: {
      enabled: true,
      placeholder: 'Search menu...',
    },
  },
};

// Mobile responsive overlay
export const MobileResponsive: Story = {
  render: (args: SideBarProps) => {
    const [selectedKey, setSelectedKey] = useState(args.defaultSelectedKey || 'dashboard');
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900" style={{ maxWidth: '375px', margin: '0 auto' }}>
        <SideBar
          {...args}
          mobileOpen={mobileOpen}
          defaultSelectedKey={selectedKey}
          onSelect={(key: string) => {
            setSelectedKey(key);
            args.onSelect?.(key);
          }}
          onMobileToggle={(open: boolean) => {
            setMobileOpen(open);
            args.onMobileToggle?.(open);
          }}
        />
        
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Mobile Demo</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tap the hamburger menu to open the sidebar overlay.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Selected: <strong>{selectedKey}</strong>
          </p>
        </div>
      </div>
    );
  },
  args: {
    items: basicItems,
    collapsible: true,
    defaultSelectedKey: 'dashboard',
    userInfo: mockUser,
    search: {
      enabled: true,
      placeholder: 'Search...',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// School teacher dashboard with role-based navigation
export const SchoolTeacher: Story = {
  render: Template,
  args: {
    items: [],
    schoolUserInfo: mockTeacher,
    schoolConfig: getDefaultSchoolConfig(SchoolUserRole.TEACHER),
    defaultSelectedKey: 'my-classes',
    collapsible: true,
    search: {
      enabled: true,
      placeholder: 'Search classes & assignments...',
    },
  },
};


