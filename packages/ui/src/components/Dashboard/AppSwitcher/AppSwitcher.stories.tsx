import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { AppSwitcher, type AppSwitcherProps } from './AppSwitcher';

const meta: Meta<typeof AppSwitcher> = {
  title: 'Dashboard/AppSwitcher',
  component: AppSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An icon toggle dropdown to switch between registered applications.'
      }
    }
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] }
  }
};

export default meta;

type Story = StoryObj<typeof AppSwitcher>;

const BasicTemplate = (args: AppSwitcherProps) => {
  const [current, setCurrent] = useState<string | undefined>('Analytics');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const apps = [
    { name: 'Analytics', icon: '📊', tooltip: 'Analytics & Reporting', onClick: () => setCurrent('Analytics') },
    { name: 'Billing', icon: '💳', tooltip: 'Billing & Invoices', onClick: () => setCurrent('Billing') },
    { name: 'Users', icon: '👥', tooltip: 'User Directory', onClick: () => setCurrent('Users') },
    { name: 'Settings', icon: '⚙️', tooltip: 'Platform Settings', onClick: () => setCurrent('Settings') },
    { name: 'AI Studio', icon: '🧠', tooltip: 'AI Studio', onClick: () => setCurrent('AI Studio') },
    { name: 'Workflows', icon: '🛠️', tooltip: 'Automation Workflows', onClick: () => setCurrent('Workflows') }
  ];
  return (
    <div data-theme={theme} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <AppSwitcher
        {...args}
        currentAppName={current}
        currentAppIcon={apps.find(a => a.name === current)?.icon}
        apps={apps}
      />
      <button style={{ padding: '.35rem .65rem', fontSize: '.75rem' }} onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme (current: {theme})
      </button>
    </div>
  );
};

export const Basic: Story = {
  render: (args: AppSwitcherProps) => <BasicTemplate {...args} />,
  args: {
    size: 'md',
    columns: 3,
    showLabels: true
  }
};

export const Empty: Story = {
  render: (args: AppSwitcherProps) => (
    <div style={{ padding: '2rem', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
      <p style={{ marginBottom: '1rem', color: 'white' }}>
        Click the button below to see the empty state:
      </p>
      <AppSwitcher {...args} />
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7, color: 'white' }}>
        This story shows what happens when no apps are provided. The popover should show "No applications".
      </p>
    </div>
  ),
  args: {
    apps: [],
    size: 'md',
    ariaLabel: 'Empty app switcher example'
  }
};

export const WithLabels: Story = {
  render: (args: AppSwitcherProps) => <BasicTemplate {...args} />,
  args: {
    size: 'lg',
    columns: 2,
    showLabels: true
  }
};

export const Compact: Story = {
  render: (args: AppSwitcherProps) => <BasicTemplate {...args} />,
  args: {
    size: 'sm',
    columns: 4,
    showLabels: false
  }
};
