import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyStyleBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-style-blocks/style',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Basic non-empty style
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        color: 'blue',
        margin: '10px'
      });
    `,

    // Style with comments (not empty)
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        /* This is a comment */
        color: 'blue'
      });
    `,
  ],
  invalid: [
    // Empty style object
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const emptyStyle = style({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
      `,
    },

    // Empty exported style object
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        export const emptyStyle = style({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
      `,
    },

    // Style with comments in empty object
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const styleWithComments = style({
          /* This is an empty style */
        });
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
      `,
    },

    // Multiple empty styles
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        export const emptyStyle1 = style({});
        export const emptyStyle2 = style({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }, { messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
      `,
    },

    // Variable declaration with empty style
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const { className } = style({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
      `,
    },

    // Export of variable with empty style
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const myEmptyStyle = style({});
        export { myEmptyStyle };
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
        export { myEmptyStyle };
      `,
    },

    // Style in a callback or nested function
    {
      code: `
    import { style } from '@vanilla-extract/css';
    
    [1, 2, 3].forEach(() => {
      style({});
    });
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
    },
  ],
});
