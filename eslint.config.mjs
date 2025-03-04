import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginESLintPlugin from 'eslint-plugin-eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import * as tseslint from 'typescript-eslint';
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // mimic ESLintRC-style extends
  // Prettier always must be last to override other style rules
  ...compat.extends('prettier'),
  {
    files: ['**/*.js', '**/*.ts', '**/*.cjs', '**/*.mjs'],
    plugins: {
      'eslint-plugin': eslintPluginESLintPlugin,
      import: importPlugin,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
    rules: {
      ...eslintPluginESLintPlugin.configs.recommended.rules,
      'eslint-plugin/prefer-message-ids': 'error',
      'eslint-plugin/require-meta-type': 'error',
      'eslint-plugin/require-meta-docs-description': 'error',
      'eslint-plugin/consistent-output': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [
            {
              pattern: '{@eslint/**,eslint,eslint-plugin-*}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@vanilla-extract/**',
              group: 'external',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
    },
  },
  ...tseslint.configs.recommended,

  {
    files: ['**/*.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      // 'vanilla-extract/alphabetical-order': 'warn',
      // 'vanilla-extract/concentric-order': 'error',
      'vanilla-extract/custom-order': [
        'error',
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          // Optional
          sortRemainingProperties: 'concentric', // or 'alphabetical' (default)
        },
      ],
    },
  },

  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'error',

      // General rules
      curly: 'error',
      eqeqeq: 'error',
      'no-console': 'warn',
      'no-unused-vars': 'off',
    },
  },
];
