import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import concentricOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/concentric-order/variants',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // styleVariants with concentric ordering
    `
      import { styleVariants } from '@vanilla-extract/css';
      
      const variants = styleVariants({
        primary: {
          position: 'relative',
          display: 'flex',
          margin: '1rem',
          backgroundColor: 'blue',
          padding: '0.5rem',
          color: 'white'
        },
        secondary: {
          position: 'relative',
          display: 'flex',
          margin: '0.8rem',
          backgroundColor: 'gray',
          padding: '0.4rem',
          color: 'black'
        }
      });
    `,
  ],
  invalid: [
    // styleVariants with incorrect ordering
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
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            position: 'relative',
            display: 'flex',
            margin: '1rem',
            backgroundColor: 'blue',
            padding: '0.5rem',
            color: 'white'
          },
          secondary: {
            position: 'relative',
            display: 'flex',
            margin: '0.8rem',
            backgroundColor: 'gray',
            padding: '0.4rem',
            color: 'black'
          }
        });
      `,
    },

    // styleVariants with some variants having incorrect ordering
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
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            position: 'relative',
            display: 'flex',
            margin: '1rem',
            backgroundColor: 'blue',
            padding: '0.5rem',
            color: 'white'
          },
          secondary: {
            position: 'relative',
            display: 'flex',
            margin: '0.8rem',
            backgroundColor: 'gray',
            padding: '0.4rem',
            color: 'black'
          }
        });
      `,
    },
  ],
});
