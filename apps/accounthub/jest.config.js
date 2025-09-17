const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: 'Account Hub',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleNameMapper: {
    // Handle module aliases (this will be handled by tsconfig paths)
    '^@/(.*)$': '<rootDir>/$1',
    '^@zana/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
    '<rootDir>/pages/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/pages/**/*.(test|spec).(ts|tsx|js)',
    '<rootDir>/components/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/components/**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!pages/_*.{ts,tsx}',
    '!pages/api/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);