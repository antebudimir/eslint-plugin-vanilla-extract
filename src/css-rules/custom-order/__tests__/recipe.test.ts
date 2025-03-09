import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/recipe',
  rule: customGroupOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Recipe with custom group ordering (concentric for remaining)
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const myRecipe = recipe({
          base: {
            width: '100%',
            margin: 0,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white'
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
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },

    // Recipe with custom group ordering (alphabetical for remaining)
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const myRecipe = recipe({
          base: {
            width: '100%',
            margin: 0,
            alignItems: 'center',
            backgroundColor: 'white',
            display: 'flex',
            position: 'relative'
          },
          variants: {
            color: {
              blue: {
                backgroundColor: 'blue',
                color: 'white',
                position: 'relative'
              },
              red: {
                backgroundColor: 'red',
                color: 'black',
                position: 'relative'
              }
            }
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
    // Recipe with incorrect ordering (concentric for remaining)
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            backgroundColor: 'white',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            margin: 0
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
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            width: '100%',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white'
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

    // Recipe with incorrect ordering (alphabetical for remaining)
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            width: '100%',
            margin: 0
          },
          variants: {
            color: {
              blue: {
                position: 'relative',
                backgroundColor: 'blue',
                color: 'white'
              }
            }
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
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            width: '100%',
            margin: 0,
            alignItems: 'center',
            backgroundColor: 'white',
            display: 'flex',
            position: 'relative'
          },
          variants: {
            color: {
              blue: {
                backgroundColor: 'blue',
                color: 'white',
                position: 'relative'
              }
            }
          }
        });
      `,
    },
  ],
});
