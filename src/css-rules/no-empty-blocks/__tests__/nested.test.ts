import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyStyleBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-style-blocks/nested',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Style with non-empty nested selectors
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        color: 'blue',
        selectors: {
          '&:hover': {
            color: 'red'
          }
        }
      });
    `,

    // Style with non-empty media queries
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        color: 'blue',
        '@media': {
          '(min-width: 768px)': {
            color: 'red'
          }
        }
      });
    `,

    // Style with computed property name
    `
    import { style } from '@vanilla-extract/css';
    
    const styleWithComputedProperty = style({
      color: 'blue',
      // Using a computed property name
      [Symbol('test')]: {
        color: 'red'
      }
    });
  `,
  ],
  invalid: [
    // Style with empty nested selectors
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithEmptySelector = style({
          color: 'blue',
          selectors: {
            '&:hover': {}
          }
        });
      `,
      errors: [{ messageId: 'emptySelectors' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithEmptySelector = style({
          color: 'blue',
          
        });
      `,
    },

    // Style with empty media queries
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithEmptyMedia = style({
          color: 'blue',
          '@media': {
            '(min-width: 768px)': {}
          }
        });
      `,
      errors: [{ messageId: 'emptyMedia' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithEmptyMedia = style({
          color: 'blue',
          
        });
      `,
    },

    // Style with empty @supports
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithEmptySupports = style({
          display: 'block',
          '@supports': {
            '(display: grid)': {}
          }
        });
      `,
      errors: [{ messageId: 'emptySupports' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithEmptySupports = style({
          display: 'block',
          
        });
      `,
    },

    // Nested empty style with multiple levels
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        export const nestedEmptyStyle = style({
          selectors: {
            '&:hover': {},
            '&:focus': {}
          }
        });
      `,
      errors: [{ messageId: 'emptySelectors' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
      `,
    },

    // Multiple empty nested styles (individual reporting)
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithMultipleEmptySelectors = style({
          '@media': {
            '(min-width: 768px)': {},
            '(max-width: 1024px)': {},
            '(prefers-color-scheme: dark)': { color: 'white' }
          }
        });
      `,
      errors: [{ messageId: 'emptyNestedStyle' }, { messageId: 'emptyNestedStyle' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithMultipleEmptySelectors = style({
          '@media': {
            
            
            '(prefers-color-scheme: dark)': { color: 'white' }
          }
        });
      `,
    },

    // Style with custom empty conditional style (not selectors, media, or supports)
    {
      code: `
    import { style } from '@vanilla-extract/css';
    
    const styleWithCustomConditional = style({
      color: 'blue',
      '@customCondition': {}
    });
  `,
      errors: [{ messageId: 'emptyConditionalStyle' }],
      output: `
    import { style } from '@vanilla-extract/css';
    
    const styleWithCustomConditional = style({
      color: 'blue',
      
    });
  `,
    },

    // Style with nested empty selectors, media queries, and supports
    {
      code: `
    import { style } from '@vanilla-extract/css';
    
    const styleWithNestedEmpty = style({
      color: 'blue',
      selectors: {
        '&:hover': {},
        '&:focus': {}
      },
      '@media': {
        '(min-width: 768px)': {},
        '(max-width: 1024px)': {}
      },
      '@supports': {
        '(display: grid)': {}
      }
    });
  `,
      errors: [{ messageId: 'emptySelectors' }, { messageId: 'emptyMedia' }, { messageId: 'emptySupports' }],
      output: `
    import { style } from '@vanilla-extract/css';
    
    const styleWithNestedEmpty = style({
      color: 'blue',
      
      
      
    });
  `,
    },

    // Style with mixed empty and non-empty nested objects
    {
      code: `
    import { style } from '@vanilla-extract/css';
    
    const styleWithMixedNested = style({
      color: 'blue',
      selectors: {
        '&:hover': { color: 'red' },
        '&:focus': {}
      },
      '@media': {
        '(min-width: 768px)': {},
        '(max-width: 1024px)': { fontSize: '16px' }
      },
      '@supports': {
        '(display: grid)': {}
      }
    });
  `,
      errors: [{ messageId: 'emptyNestedStyle' }, { messageId: 'emptyNestedStyle' }, { messageId: 'emptySupports' }],
      output: `
    import { style } from '@vanilla-extract/css';
    
    const styleWithMixedNested = style({
      color: 'blue',
      selectors: {
        '&:hover': { color: 'red' },
        
      },
      '@media': {
        
        '(max-width: 1024px)': { fontSize: '16px' }
      },
      
    });
  `,
    },
  ],
});
