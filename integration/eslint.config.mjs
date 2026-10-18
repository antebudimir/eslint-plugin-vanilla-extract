// Config for the integration test. Imports resolve from the repo's node_modules (TS parser, typescript-eslint) and the locally built plugin from ../dist/index.js.
import vanillaExtract from '../dist/index.js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['**/.snapshot/**'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'vanilla-extract/alphabetical-order': 'error',
      'vanilla-extract/no-empty-style-blocks': 'error',
      'vanilla-extract/no-px-unit': 'error',
      'vanilla-extract/no-trailing-zero': 'error',
      'vanilla-extract/no-unitless-values': 'error',
      'vanilla-extract/no-unknown-unit': 'error',
      'vanilla-extract/no-zero-unit': 'error',
      'vanilla-extract/prefer-logical-properties': 'error',
    },
  },
]);
