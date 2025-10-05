/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    // Only remap our telemetry source relative .js specifiers to .ts so Jest (ts-jest) can load sources without a build.
    '^(\\.{1,2}/(?:events|logging|sanitize)/.*)\\.js$': '$1.ts',
    '^(\\./index)\\.js$': '$1.ts',
    '^(\\.{1,2}/schemas)\\.js$': '$1.ts'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }]
  },
  collectCoverage: true,
  setupFilesAfterEnv: [],
  collectCoverageFrom: [
    'packages/telemetry/src/**/*.ts',
    '!**/*.test.ts',
    '!**/dist/**',
    '!packages/telemetry/src/cli.ts',
    '!packages/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'html', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
