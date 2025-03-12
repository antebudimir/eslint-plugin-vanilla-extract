import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/defaults',
  rule: customGroupOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Test with no options provided - should use defaults
    `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        alignItems: 'center',
        backgroundColor: 'red',
        color: 'blue',
        display: 'flex',
        margin: '10px',
        padding: '20px',
        zIndex: 1
      });
    `,

    // Test with empty groupOrder array - should use defaults
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          alignItems: 'center',
          backgroundColor: 'red',
          color: 'blue',
          display: 'flex',
          margin: '10px',
          padding: '20px',
          zIndex: 1
        });
      `,
      options: [
        {
          groupOrder: [],
        },
      ],
    },
  ],
  invalid: [
    // Test with no options provided - should use alphabetical ordering by default
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          zIndex: 1,
          padding: '20px',
          margin: '10px',
          display: 'flex',
          color: 'blue',
          backgroundColor: 'red',
          alignItems: 'center'
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          alignItems: 'center',
          backgroundColor: 'red',
          color: 'blue',
          display: 'flex',
          margin: '10px',
          padding: '20px',
          zIndex: 1
        });
      `,
    },

    // Test with empty groupOrder array - should use alphabetical ordering by default
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          zIndex: 1,
          padding: '20px',
          margin: '10px',
          display: 'flex',
          color: 'blue',
          backgroundColor: 'red',
          alignItems: 'center'
        });
      `,
      options: [
        {
          groupOrder: [],
        },
      ],
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          alignItems: 'center',
          backgroundColor: 'red',
          color: 'blue',
          display: 'flex',
          margin: '10px',
          padding: '20px',
          zIndex: 1
        });
      `,
    },
  ],
});
