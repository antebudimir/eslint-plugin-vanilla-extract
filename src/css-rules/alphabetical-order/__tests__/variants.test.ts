import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/alphabetical-order/variants',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // styleVariants with alphabetical ordering
    `
      import { styleVariants } from '@vanilla-extract/css';
      
      const variants = styleVariants({
        primary: {
          backgroundColor: 'blue',
          color: 'white'
        },
        secondary: {
          backgroundColor: 'gray',
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
            backgroundColor: 'blue'
          },
          secondary: {
            color: 'black',
            backgroundColor: 'gray'
          }
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }, { messageId: 'alphabeticalOrder' }],
      output: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          primary: {
            backgroundColor: 'blue',
            color: 'white'
          },
          secondary: {
            backgroundColor: 'gray',
            color: 'black'
          }
        });
      `,
    },
  ],
});
