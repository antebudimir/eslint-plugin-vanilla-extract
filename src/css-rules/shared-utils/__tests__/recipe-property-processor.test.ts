import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../../alphabetical-order/rule-definition.js';

run({
  name: 'vanilla-extract/recipe-property-processor-tests',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Test for recipe with spread element (should trigger the early return)
    `
      import { recipe } from '@vanilla-extract/recipes';
      import { style } from '@vanilla-extract/css';
      
      const baseStyle = style({ backgroundColor: 'blue', color: 'white' });
      
      const myRecipe = recipe({
        base: baseStyle,
        ...{ someSpreadProperty: true },
        variants: {
          size: {
            small: style({ fontSize: '1.2rem', padding: '4rem' }),
            large: style({ fontSize: '1.8rem', padding: '12rem' })
          }
        }
      });
    `,

    // Test for recipe with computed property (non-Identifier key)
    `
      import { recipe } from '@vanilla-extract/recipes';
      import { style } from '@vanilla-extract/css';
      
      const propName = 'dynamicProp';
      const baseStyle = style({ backgroundColor: 'blue', color: 'white' });
      
      const myRecipe = recipe({
        base: baseStyle,
        [propName]: style({ fontSize: '1.4rem' }),
        variants: {
          size: {
            small: style({ fontSize: '1.2rem', padding: '4rem' }),
            large: style({ fontSize: '1.8rem', padding: '12rem' })
          }
        }
      });
    `,

    // Test for recipe with non-object values (should skip processing)
    `
      import { recipe } from '@vanilla-extract/recipes';
      import { style } from '@vanilla-extract/css';
      
      const baseStyle = style({ backgroundColor: 'blue', color: 'white' });
      
      const myRecipe = recipe({
        base: baseStyle,
        nonObjectProp: 'string value',
        numericProp: 42,
        booleanProp: true,
        nullProp: null,
        variants: {
          size: {
            small: style({ fontSize: '1.2rem', padding: '4rem' }),
            large: style({ fontSize: '1.8rem', padding: '12rem' })
          }
        }
      });
    `,
  ],
  invalid: [
    // Basic recipe with incorrect ordering in style calls
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        import { style } from '@vanilla-extract/css';
        
        const baseStyle = style({ color: 'blue', backgroundColor: 'white' });
        
        const myRecipe = recipe({
          base: baseStyle,
          variants: {
            size: {
              small: style({ padding: '4rem', fontSize: '1.2rem' }),
              large: style({ padding: '12rem', fontSize: '1.8rem' })
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
        import { style } from '@vanilla-extract/css';
        
        const baseStyle = style({ backgroundColor: 'white', color: 'blue' });
        
        const myRecipe = recipe({
          base: baseStyle,
          variants: {
            size: {
              small: style({ fontSize: '1.2rem', padding: '4rem' }),
              large: style({ fontSize: '1.8rem', padding: '12rem' })
            }
          }
        });
      `,
    },
  ],
});
