import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'html', 'text', 'text-summary'],
  verbose: true,
  projects: [
    {
      displayName: 'telemetry',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>',
      testMatch: ['<rootDir>/packages/telemetry/**/*.test.[jt]s?(x)'],
      transform: {
        '^.+\\.(t|j)sx?$': [
          'ts-jest',
          {
            tsconfig: {
              module: 'CommonJS',
              target: 'ES2019',
              jsx: 'react',
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              isolatedModules: true,
              "allowImportingTsExtensions": true,
              "strict": true,
            },
          },
        ],
      },
      setupFilesAfterEnv: ['<rootDir>/packages/telemetry/test/setupTests.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      collectCoverageFrom: [
        '<rootDir>/packages/telemetry/src/**/*.{ts,tsx}',
        '!**/*.test.*',
        '!**/*.stories.*',
        '!**/*.d.ts',
      ],
      coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/.storybook/'],
      coverageThreshold: {
        global: {
          statements: 100,
          lines: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
    {
      displayName: 'ui',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      rootDir: '<rootDir>',
      testMatch: ['<rootDir>/packages/ui/**/*.test.[jt]s?(x)'],
      transform: {
        '^.+\\.(t|j)sx?$': [
          'ts-jest',
          {
            tsconfig: {
              module: 'CommonJS',
              target: 'ES2019',
              jsx: 'react',
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              isolatedModules: true,
            },
          },
        ],
        '\\.(css|scss)$': 'jest-css-modules-transform',
      },
      setupFilesAfterEnv: ['<rootDir>/packages/ui/test/setupTests.tsx'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      moduleNameMapper: {
        '@heroicons/react/24/outline': '<rootDir>/packages/ui/__mocks__/@heroicons/react.tsx',
        '@heroicons/react/24/solid': '<rootDir>/packages/ui/__mocks__/@heroicons/react.tsx',
        '@heroui/react': '<rootDir>/packages/ui/__mocks__/@heroui/react.tsx',
      },
      collectCoverageFrom: [
        '<rootDir>/packages/ui/src/**/*.{ts,tsx}',
        '!**/*.test.*',
        '!**/*.stories.*',
        '!**/*.d.ts',
        '!**/__mocks__/**',
        '!<rootDir>/packages/ui/src/internal/**',
        '!<rootDir>/packages/ui/src/theme/**',
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/', 
        '/dist/', 
        '/.storybook/', 
        '/__mocks__/',
        '\\.module\\.scss$',
        '\\.scss$',
        '\\.css$',
        '/internal/',
        '/theme/'
      ],
      coverageThreshold: {
        global: {
          statements: 100,
          lines: 100,
          branches: 100,
        },
      },
    },
  ],
};

export default config;
