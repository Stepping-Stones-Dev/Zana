import React from 'react';
import { HeroUIProvider } from '@heroui/react';
import '../src/styles/globals.css';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Accessibility addon configuration
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
        ],
      },
    },

  },
  // Global decorators for HeroUI theming context
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      
      return React.createElement(
        HeroUIProvider,
        {
          theme: theme,
        },
        React.createElement(Story)
      );
    },
  ],
  // Global types for toolbar controls
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;