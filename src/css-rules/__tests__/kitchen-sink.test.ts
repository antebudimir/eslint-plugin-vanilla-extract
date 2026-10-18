import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Linter } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import { describe, expect, it } from 'vitest';
import vanillaExtract from '../../index.js';

// Same fixture as the integration test, run through the unit suite. Must produce no diagnostics on any supported ESLint version. The CLI integration test covers the fix pipeline.

const fixturePath = join(__dirname, '../../../integration/complex.css.ts');
const fixtureCode = readFileSync(fixturePath, 'utf8');

const linter = new Linter();

const flatConfig: Linter.Config[] = [
  {
    files: ['**/*.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    languageOptions: {
      parser: tsParser,
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
];

describe('kitchen-sink fixture (no false positives)', () => {
  it('reports no errors for the clean kitchen-sink fixture', () => {
    const messages = linter.verify(fixtureCode, flatConfig, 'complex.css.ts');

    expect(messages).toEqual([]);
  });
});
