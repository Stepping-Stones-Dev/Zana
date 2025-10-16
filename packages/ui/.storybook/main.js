const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links", 
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Configure docs to use HeroUI theming
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  }
};
export default config;