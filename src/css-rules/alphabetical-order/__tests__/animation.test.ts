import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/alphabetical-order/animation',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // keyframes with alphabetical ordering
    `
      import { keyframes } from '@vanilla-extract/css';
      
      const fadeIn = keyframes({
        '0%': {
          opacity: 0,
          transform: 'translateY(10px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      });
    `,

    // globalKeyframes with alphabetical ordering
    `
      import { globalKeyframes } from '@vanilla-extract/css';
      
      globalKeyframes('fadeIn', {
        '0%': {
          opacity: 0,
          transform: 'translateY(10px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      });
    `,
  ],
  invalid: [
    // keyframes with incorrect ordering
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        const fadeIn = keyframes({
          '0%': {
            transform: 'translateY(10px)',
            opacity: 0
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1
          }
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }, { messageId: 'alphabeticalOrder' }],
      output: `
        import { keyframes } from '@vanilla-extract/css';
        const fadeIn = keyframes({
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        });
      `,
    },

    // globalKeyframes with incorrect ordering
    {
      code: `
        import { globalKeyframes } from '@vanilla-extract/css';
        globalKeyframes('fadeIn', {
          '0%': {
            transform: 'translateY(10px)',
            opacity: 0
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1
          }
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }, { messageId: 'alphabeticalOrder' }],
      output: `
        import { globalKeyframes } from '@vanilla-extract/css';
        globalKeyframes('fadeIn', {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        });
      `,
    },
  ],
});
