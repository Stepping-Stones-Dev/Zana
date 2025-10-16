import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Dashboard/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Borderless icon button toggling between light and dark themes. Uses HeroUI\'s built-in theme system for seamless integration.'
      }
    },
    // Disable backgrounds to let HeroUI handle theming
    backgrounds: { disable: true },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeSwitcher>;

export const Default: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-3 items-center p-8 rounded-large bg-content1 shadow-small">
        <h3 className="text-large font-semibold text-foreground">Theme Switcher</h3>
        <p className="text-small text-foreground-500 text-center max-w-xs">
          Click the icon below to toggle between light and dark themes. 
          The change will be reflected throughout the entire Storybook interface.
        </p>
        <ThemeSwitcher />
        <div className="flex gap-2 mt-4">
          <div className="w-4 h-4 rounded bg-primary" title="Primary color" />
          <div className="w-4 h-4 rounded bg-secondary" title="Secondary color" />
          <div className="w-4 h-4 rounded bg-success" title="Success color" />
          <div className="w-4 h-4 rounded bg-warning" title="Warning color" />
          <div className="w-4 h-4 rounded bg-danger" title="Danger color" />
        </div>
      </div>
    );
  },
};

export const InNavigation: Story = {
  render: () => {
    return (
      <div className="flex items-center justify-between p-4 bg-content2 rounded-large shadow-small w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-small font-medium">
            U
          </div>
          <span className="text-foreground font-medium">User Name</span>
        </div>
        <ThemeSwitcher />
      </div>
    );
  },
};
