// Root ESLint flat config
// Enforces import boundaries & TypeScript strictness for monorepo
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import globals from 'globals';
import pluginImport from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import unused from 'eslint-plugin-unused-imports';

// (Reserved) potential helper constants for custom rules.

export default [
  // Ensure this config file itself has Node globals (for process, __dirname, etc.)
  {
    files: ['eslint.config.mjs'],
    languageOptions: { globals: { ...globals.node } }
  },
  // Global ignore patterns (build artifacts & generated files)
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '.sbom-cache/**',
      'sbom.json',
      'sbom-summary.json',
      'security-summary.json'
    ]
  },
  js.configs.recommended,
  // Minimal TypeScript layer; explicit parser + plugin rules applied below
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      import: pluginImport,
      react,
      'react-hooks': reactHooks,
      'unused-imports': unused,
      '@typescript-eslint': tseslint
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json']
        }
      }
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: 'react',
          importNames: ['default'],
          message: 'Use named React APIs; default import unnecessary in React 17+'
        }
      ],
      // Boundary: no app -> other app imports (apps/* cannot import from apps/*)
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './apps',
              from: './apps',
              message: 'Apps must not import other apps; extract shared code to packages/.',
              except: []
            }
          ]
        }
      ],
      // Disallow deep internal src access across packages (must use package root barrel)
      // (Temporarily removed) no-restricted-syntax internal src import rule due to regex parsing issues under esquery.
      // Enforce that external modules only import a package's public root (barrel) - allow subpath if explicitly declared in exports pattern
      'import/no-internal-modules': [
        'error',
        {
          allow: [
            '@zana/*/dist/**', // build artifacts (rare, but allow tooling)
            '@zana/types/**'   // types may expose structured subpaths
          ]
        }
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always'
        }
      ],
      // Enforce explicit extensions on imports (matches NodeNext expectations & our .js-in-TS convention)
      // Enforce explicit extensions, but allow TypeScript sources to intentionally reference runtime .js specifiers (NodeNext style)
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',      // do NOT require .ts in specifier (we use .js runtime form)
          tsx: 'never',
          js: 'always',
          jsx: 'always'
        }
      ],
      'unused-imports/no-unused-imports': 'error',
  // Use TypeScript-aware rule only; disable core to prevent duplicate / stubborn reports
  'no-unused-vars': 'off',
      // Basic TS rule reinforcements
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
  ,
  // Node runtime script overrides (CJS/JS tooling scripts)
  {
    files: ['scripts/**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: { ...globals.node }
    },
    rules: {
      'no-undef': 'off', // node globals allowed
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  // Override: internal telemetry package – allow deep relative imports inside same package
  {
    files: ['packages/telemetry/src/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'import/no-internal-modules': 'off',
      // Allow intentional placeholder params for public hook signatures & declaration shaping
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  // Declaration files: turn off unused vars (common to name params for clarity)
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  // Test overrides: provide jest globals & relax extension rule noise for test files
  {
    files: ['**/*.test.ts'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
    rules: {
      'import/extensions': 'off'
    }
  }
];
