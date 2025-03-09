import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import concentricOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/concentric-order/animation',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // keyframes with concentric ordering
    `
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
  ],
  invalid: [
    // keyframes with incorrect ordering
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
  ],
});
