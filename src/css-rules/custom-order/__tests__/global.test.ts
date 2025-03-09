import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/global',
  rule: customGroupOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // globalStyle with custom group ordering (concentric for remaining)
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        
        globalStyle('body', {
          margin: 0,
          position: 'relative',
          display: 'block',
          backgroundColor: 'white',
          padding: 0,
          color: 'black'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },

    // globalStyle with custom group ordering (alphabetical for remaining)
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        
        globalStyle('body', {
          margin: 0,
          backgroundColor: 'white',
          color: 'black',
          display: 'block',
          padding: 0,
          position: 'relative'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
    },
  ],
  invalid: [
    // globalStyle with incorrect ordering (concentric for remaining)
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
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }],
      output: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('body', {
          margin: 0,
          position: 'relative',
          display: 'block',
          backgroundColor: 'white',
          padding: 0,
          color: 'black'
        });
      `,
    },

    // globalStyle with incorrect ordering (alphabetical for remaining)
    {
      code: `
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
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }],
      output: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('body', {
          margin: 0,
          backgroundColor: 'white',
          color: 'black',
          display: 'block',
          padding: 0,
          position: 'relative'
        });
      `,
    },
  ],
});
