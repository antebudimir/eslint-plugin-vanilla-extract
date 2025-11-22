import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyBlocksRule from '../../no-empty-blocks/rule-definition.js';

run({
  name: 'vanilla-extract/empty-object-processor-tests',
  rule: noEmptyBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // sprinkles() with no arguments is valid (not empty)
    `
      import { recipe } from '@vanilla-extract/recipes';
      import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
      
      const sprinkles = createSprinkles(defineProperties({
        properties: { display: ['flex'] }
      }));

      const myRecipe = recipe({
        base: { color: 'black' },
        variants: {
          variant: {
            value: sprinkles()
          }
        }
      });
    `,

    // Test for CallExpression with non-empty object argument
    `
      import { recipe } from '@vanilla-extract/recipes';
      import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
      
      const sprinkles = createSprinkles(defineProperties({
        properties: { padding: ['8px'] }
      }));

      const myRecipe = recipe({
        base: { color: 'black' },
        variants: {
          spacing: {
            small: sprinkles({ padding: '8px' })
          }
        }
      });
    `,
  ],
  invalid: [
    // Test for CallExpression with empty object argument - sprinkles({})
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          empty: sprinkles({})
        }
      }
    });
  `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          
        }
      }
    });
  `,
    },

    // Test for sprinkles({}) with empty object argument in recipe base
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'] }
    }));
    
    export const myRecipe = recipe({
      base: sprinkles({}),
      variants: {},
    });
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
    },
  ],
});
