import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/alphabetical-order/global',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // globalStyle with alphabetical ordering
    `
      import { globalStyle } from '@vanilla-extract/css';
      
      globalStyle('body', {
        backgroundColor: 'white',
        color: 'black',
        margin: 0,
        padding: 0
      });
    `,
  ],
  invalid: [
    // globalStyle with incorrect ordering
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('body', {
          color: 'black',
          backgroundColor: 'white',
          padding: 0,
          margin: 0
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('body', {
          backgroundColor: 'white',
          color: 'black',
          margin: 0,
          padding: 0
        });
      `,
    },
  ],
});
