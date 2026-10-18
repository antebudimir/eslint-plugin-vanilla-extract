import eslintPluginESLintPlugin from 'eslint-plugin-eslint-plugin';
import importPlugin from 'eslint-plugin-import-x';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import * as tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.js', '**/*.ts', '**/*.cjs', '**/*.mjs'],
    plugins: {
      'eslint-plugin': eslintPluginESLintPlugin,
      'import-x': importPlugin,
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
      'import-x/resolver': {
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
      'import-x/order': [
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
      'import-x/no-unresolved': 'error',
      'import-x/named': 'error',
      'import-x/namespace': 'error',
      'import-x/default': 'error',
      'import-x/export': 'error',
    },
  },

  ...tseslint.configs.recommended,

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

  prettierConfig,
]);
