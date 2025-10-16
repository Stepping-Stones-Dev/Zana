import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import type { DashboardHeaderProps } from './types';
import { Button, Input, Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { Icon } from '@iconify/react';

const meta: Meta<typeof DashboardHeader> = {
  title: 'Dashboard/DashboardHeader',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: false },
    docs: {
      description: {
        component: `
A comprehensive dashboard header component featuring notifications, theme switching, language selection, and quick actions. Features:

- **Brand Integration**: Logo and title display with click handling
- **Notification System**: Built-in notification bell with dropdown
- **Theme Control**: Integrated theme switcher for light/dark modes
- **Internationalization**: Language switcher with flag indicators
- **Quick Actions**: Calendar launcher and custom action support
- **Responsive Design**: Adapts to different screen sizes and layouts
- **Position Variants**: Static, sticky, or fixed positioning
- **Background Variants**: Default, transparent, or glass effect

## Key Features

- **Flexible Layout**: Left (branding), center (custom actions), right (controls)
- **Control Visibility**: Each feature can be enabled/disabled independently
- **Custom Actions**: Center section supports any custom React components
- **Event Callbacks**: Rich callback system for all user interactions
- **Accessibility**: Full WCAG compliance with proper ARIA labels
- **Theme Integration**: Seamless integration with HeroUI theme system

## Usage

Perfect for dashboard layouts where you need a consistent header with common
functionality like notifications, settings, and branding.
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Application title or branding text'
    },
    logo: {
      control: { type: 'object' },
      description: 'Logo or brand icon component'
    },
    showNotifications: {
      control: { type: 'boolean' },
      description: 'Show notification bell'
    },
    showThemeSwitcher: {
      control: { type: 'boolean' },
      description: 'Show theme switcher'
    },
    showLanguageSwitcher: {
      control: { type: 'boolean' },
      description: 'Show language switcher'
    },
    showCalendar: {
      control: { type: 'boolean' },
      description: 'Show calendar launcher'
    },
    position: {
      control: { type: 'select' },
      options: ['static', 'sticky', 'fixed'],
      description: 'Header positioning'
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'transparent', 'glass'],
      description: 'Background variant'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Header size'
    }
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
        {/* Sample content to show header positioning */}
        <div className="p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-content1 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
              <p className="text-foreground-600 mb-4">
                This demonstrates how the header appears above your main content.
                The header positioning (static, sticky, fixed) affects how it behaves
                during scrolling.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-content2 rounded p-4">
                    <h3 className="font-medium mb-2">Content Card {i + 1}</h3>
                    <p className="text-sm text-foreground-500">
                      Sample content to demonstrate scrolling behavior with different
                      header positioning options.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof DashboardHeader>;

// Sample logo component
const SampleLogo = () => (
  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
    Z
  </div>
);

// Default header
export const Default: Story = {
  args: {
    title: "Zana Dashboard",
    logo: <SampleLogo />,
    showNotifications: true,
    showThemeSwitcher: true,
    showLanguageSwitcher: true,
    showCalendar: true,
    position: 'sticky',
    variant: 'default',
    size: 'md'
  }
};

// With search in center
export const WithSearch: Story = {
  args: {
    ...Default.args,
    actions: (
        <Input
            isClearable
            classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent",
            inputWrapper: [
                "shadow-sm",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "dark:group-data-[focus=true]:bg-default/60",
                "cursor-text!",
            ],
            }}
            label="Search"
            startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={16} />}
            placeholder="Type to search..."
            radius="lg"
        />
    )
  }
};

// With breadcrumbs
export const WithBreadcrumbs: Story = {
  args: {
    ...Default.args,
    title: undefined, // Remove title to show breadcrumbs
    actions: (
      <Breadcrumbs size="lg" className="text-foreground">
        <BreadcrumbItem>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Projects</BreadcrumbItem>
        <BreadcrumbItem>Analytics</BreadcrumbItem>
      </Breadcrumbs>
    )
  }
};

// With action buttons
export const WithActions: Story = {
  args: {
    ...Default.args,
    actions: (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="flat"
          startContent={<Icon icon="solar:add-circle-linear" width={16} />}
        >
          New Project
        </Button>
        <Button
          size="sm"
          variant="light"
          isIconOnly
        >
          <Icon icon="solar:settings-linear" width={16} />
        </Button>
      </div>
    )
  }
};

// Minimal header
export const Minimal: Story = {
  args: {
    title: "Simple App",
    showNotifications: false,
    showThemeSwitcher: true,
    showLanguageSwitcher: false,
    showCalendar: false,
    position: 'static',
    variant: 'default',
    size: 'sm'
  }
};

// Glass variant
export const GlassEffect: Story = {
  args: {
    ...Default.args,
    variant: 'glass',
    position: 'fixed'
  }
};

// Transparent variant
export const Transparent: Story = {
  args: {
    ...Default.args,
    variant: 'transparent',
    position: 'static'
  }
};

// Large size
export const LargeSize: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    title: "Enterprise Dashboard"
  }
};

// Logo only
export const LogoOnly: Story = {
  args: {
    logo: <SampleLogo />,
    title: undefined,
    showNotifications: true,
    showThemeSwitcher: true,
    showLanguageSwitcher: false,
    showCalendar: false,
    size: 'sm'
  }
};

// Interactive playground
export const InteractivePlayground: Story = {
  args: {
    ...Default.args
  },
  render: (args) => {
    return (
      <DashboardHeader
        {...args}
        onNotificationClick={() => {
          console.log('Notifications clicked');
          alert('Notifications opened!');
        }}
        onCalendarClick={() => {
          console.log('Calendar clicked');
          alert('Calendar opened!');
        }}
        onLanguageChange={(language) => {
          console.log('Language changed to:', language);
          alert(`Language changed to: ${language}`);
        }}
        onThemeChange={(theme) => {
          console.log('Theme changed to:', theme);
        }}
        onLogoClick={() => {
          console.log('Logo clicked');
          alert('Logo clicked!');
        }}
      />
    );
  }
};

// Fixed positioned header
export const FixedHeader: Story = {
  args: {
    ...Default.args,
    position: 'fixed'
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
        {/* Add top padding to account for fixed header */}
        <div className="pt-16 p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-content1 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Fixed Header Demo</h2>
              <p className="text-foreground-600 mb-4">
                This demonstrates a fixed positioned header. Notice how the content
                starts below the header with appropriate padding.
              </p>
              {/* Lots of content to demonstrate scrolling */}
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="bg-content2 rounded p-4 mb-4">
                  <h3 className="font-medium mb-2">Section {i + 1}</h3>
                  <p className="text-sm text-foreground-500">
                    Content section {i + 1}. Scroll down to see how the fixed header
                    stays at the top of the viewport while the content scrolls behind it.
                    This is useful for maintaining navigation and actions always visible.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  ]
};