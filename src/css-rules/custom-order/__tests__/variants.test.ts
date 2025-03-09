import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/variants',
  rule: customGroupOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // styleVariants with custom group ordering (concentric for remaining)
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';
        
        const variants = styleVariants({
          primary: {
            margin: '1rem',
            padding: '0.5rem',
            position: 'relative',
            display: 'flex',
            backgroundColor: 'blue',
            color: 'white'
          },
          secondary: {
            margin: '0.8rem',
            padding: '0.4rem',
            position: 'relative',
            display: 'flex',
            backgroundColor: 'gray',
            color: 'black'
          }
        });
      `,
      options: [
        {
          groupOrder: ['margin', 'padding', 'dimensions', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },

    // styleVariants with custom group ordering (alphabetical for remaining)
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';
        
        const variants = styleVariants({
          primary: {
            margin: '1rem',
            padding: '0.5rem',
            backgroundColor: 'blue',
            color: 'white',
            display: 'flex',
            position: 'relative'
          },
          secondary: {
            margin: '0.8rem',
            padding: '0.4rem',
            backgroundColor: 'gray',
            color: 'black',
            display: 'flex',
            position: 'relative'
          }
        });
      `,
      options: [
        {
          groupOrder: ['margin', 'padding', 'dimensions', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
    },
  ],
  invalid: [
    // styleVariants with incorrect ordering (concentric for remaining)
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            color: 'white',
            backgroundColor: 'blue',
            padding: '0.5rem',
            margin: '1rem',
            display: 'flex',
            position: 'relative'
          },
          secondary: {
            color: 'black',
            backgroundColor: 'gray',
            padding: '0.4rem',
            margin: '0.8rem',
            display: 'flex',
            position: 'relative'
          }
        });
      `,
      options: [
        {
          groupOrder: ['margin', 'padding', 'dimensions', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            margin: '1rem',
            padding: '0.5rem',
            position: 'relative',
            display: 'flex',
            backgroundColor: 'blue',
            color: 'white'
          },
          secondary: {
            margin: '0.8rem',
            padding: '0.4rem',
            position: 'relative',
            display: 'flex',
            backgroundColor: 'gray',
            color: 'black'
          }
        });
      `,
    },

    // styleVariants with incorrect ordering (alphabetical for remaining)
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            position: 'relative',
            display: 'flex',
            margin: '1rem',
            padding: '0.5rem',
            backgroundColor: 'blue',
            color: 'white'
          },
          secondary: {
            color: 'black',
            backgroundColor: 'gray',
            padding: '0.4rem',
            margin: '0.8rem',
            display: 'flex',
            position: 'relative'
          }
        });
      `,
      options: [
        {
          groupOrder: ['margin', 'padding', 'dimensions', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            margin: '1rem',
            padding: '0.5rem',
            backgroundColor: 'blue',
            color: 'white',
            display: 'flex',
            position: 'relative'
          },
          secondary: {
            margin: '0.8rem',
            padding: '0.4rem',
            backgroundColor: 'gray',
            color: 'black',
            display: 'flex',
            position: 'relative'
          }
        });
      `,
    },
  ],
});
