import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/animation',
  rule: customGroupOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // keyframes with custom group ordering (concentric for remaining)
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        
        const fadeIn = keyframes({
          '0%': {
            position: 'relative',
            transform: 'translateY(1rem)',
            opacity: 0
          },
          '100%': {
            position: 'relative',
            transform: 'translateY(0)',
            opacity: 1
          }
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },

    // keyframes with custom group ordering (alphabetical for remaining)
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        
        const fadeIn = keyframes({
          '0%': {
            opacity: 0,
            position: 'relative',
            transform: 'translateY(1rem)'
          },
          '100%': {
            opacity: 1,
            position: 'relative',
            transform: 'translateY(0)'
          }
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
    // keyframes with incorrect ordering (concentric for remaining)
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        const fadeIn = keyframes({
          '0%': {
            opacity: 0,
            transform: 'translateY(1rem)',
            position: 'relative'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
            position: 'relative'
          }
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { keyframes } from '@vanilla-extract/css';
        const fadeIn = keyframes({
          '0%': {
            position: 'relative',
            transform: 'translateY(1rem)',
            opacity: 0
          },
          '100%': {
            position: 'relative',
            transform: 'translateY(0)',
            opacity: 1
          }
        });
      `,
    },

    // keyframes with incorrect ordering (alphabetical for remaining)
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        const fadeIn = keyframes({
          '0%': {
            transform: 'translateY(1rem)',
            position: 'relative',
            opacity: 0
          },
          '100%': {
            transform: 'translateY(0)',
            position: 'relative',
            opacity: 1
          }
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { keyframes } from '@vanilla-extract/css';
        const fadeIn = keyframes({
          '0%': {
            opacity: 0,
            position: 'relative',
            transform: 'translateY(1rem)'
          },
          '100%': {
            opacity: 1,
            position: 'relative',
            transform: 'translateY(0)'
          }
        });
      `,
    },
  ],
});
