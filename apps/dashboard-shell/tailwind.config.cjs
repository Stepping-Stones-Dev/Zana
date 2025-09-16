const shared = require('../landing/tailwind.config.cjs');
module.exports = {
  ...shared,
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};
