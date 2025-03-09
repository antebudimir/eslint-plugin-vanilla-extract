import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import concentricOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/concentric-order/recipe',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Recipe with concentric ordering
    `
      import { recipe } from '@vanilla-extract/recipes';
      
      const myRecipe = recipe({
        base: {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          width: '100%'
        },
        variants: {
          color: {
            blue: {
              position: 'relative',
              backgroundColor: 'blue',
              color: 'white'
            },
            red: {
              position: 'relative',
              backgroundColor: 'red',
              color: 'black'
            }
          }
        }
      });
    `,
  ],
  invalid: [
    // Recipe with incorrect ordering
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            backgroundColor: 'white',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          },
          variants: {
            color: {
              blue: {
                color: 'white',
                backgroundColor: 'blue',
                position: 'relative'
              },
              red: {
                color: 'black',
                backgroundColor: 'red',
                position: 'relative'
              }
            }
          }
        });
      `,
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            width: '100%'
          },
          variants: {
            color: {
              blue: {
                position: 'relative',
                backgroundColor: 'blue',
                color: 'white'
              },
              red: {
                position: 'relative',
                backgroundColor: 'red',
                color: 'black'
              }
            }
          }
        });
      `,
    },
  ],
});
