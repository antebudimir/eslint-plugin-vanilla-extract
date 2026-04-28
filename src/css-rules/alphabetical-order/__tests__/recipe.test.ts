import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/alphabetical-order/recipe',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Recipe with alphabetical ordering
    `
      import { recipe } from '@vanilla-extract/recipes';
      
      const myRecipe = recipe({
        base: {
          alignItems: 'center',
          display: 'flex'
        },
        variants: {
          color: {
            blue: {
              backgroundColor: 'blue',
              color: 'white'
            },
            red: {
              backgroundColor: 'red',
              color: 'black'
            }
          }
        }
      });
    `,

    // Recipe with base as array (ComplexStyleRule)
    `
      import { recipe } from '@vanilla-extract/recipes';

      const myRecipe = recipe({
        base: [{
          alignItems: 'center',
          display: 'flex'
        }],
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
            display: 'flex',
            alignItems: 'center'
          },
          variants: {
            color: {
              blue: {
                color: 'white',
                backgroundColor: 'blue'
              },
              red: {
                color: 'black',
                backgroundColor: 'red'
              }
            }
          }
        });
      `,
      errors: [
        { messageId: 'alphabeticalOrder' },
        { messageId: 'alphabeticalOrder' },
        { messageId: 'alphabeticalOrder' },
      ],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: {
            alignItems: 'center',
            display: 'flex'
          },
          variants: {
            color: {
              blue: {
                backgroundColor: 'blue',
                color: 'white'
              },
              red: {
                backgroundColor: 'red',
                color: 'black'
              }
            }
          }
        });
      `,
    },

    // Recipe with base array in incorrect order
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: [{
            display: 'flex',
            alignItems: 'center'
          }],
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        const myRecipe = recipe({
          base: [{
            alignItems: 'center',
            display: 'flex'
          }],
        });
      `,
    },

        // Imported local recipe wrapper with global settings recipe
    {
      code: `
        import { componentRecipe } from './component-recipe.css.js';

        const myRecipe = componentRecipe({
          base: {
            display: 'flex',
            alignItems: 'center'
          }
        });
      `,
      settings: {
        'vanilla-extract': {
          recipe: ['componentRecipe'],
        },
      },
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { componentRecipe } from './component-recipe.css.js';

        const myRecipe = componentRecipe({
          base: {
            alignItems: 'center',
            display: 'flex'
          }
        });
      `,
    },
  ],
});