import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import concentricOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/concentric-order/global',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // globalStyle with concentric ordering
    `
      import { globalStyle } from '@vanilla-extract/css';
      
      globalStyle('body', {
        position: 'relative',
        display: 'block',
        margin: 0,
        backgroundColor: 'white',
        padding: 0,
        color: 'black'
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
          margin: 0,
          backgroundColor: 'white',
          padding: 0,
          display: 'block',
          position: 'relative'
        });
      `,
      errors: [{ messageId: 'incorrectOrder' }],
      output: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('body', {
          position: 'relative',
          display: 'block',
          margin: 0,
          backgroundColor: 'white',
          padding: 0,
          color: 'black'
        });
      `,
    },
  ],
});
