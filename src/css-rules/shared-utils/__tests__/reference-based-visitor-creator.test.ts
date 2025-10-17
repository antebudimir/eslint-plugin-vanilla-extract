import type { Rule } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../../alphabetical-order/rule-definition.js';
import concentricOrderRule from '../../concentric-order/rule-definition.js';
import { createReferenceBasedNodeVisitors } from '../reference-based-visitor-creator.js';
import type { OrderingStrategy } from '../../types.js';

// Test alphabetical order with reference-based visitor
run({
  name: 'reference-based-visitor/alphabetical',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // fontFace with src first (special fontFace ordering)
    `
      import { fontFace } from '@vanilla-extract/css';
      
      const myFont = fontFace({
        src: 'url("/fonts/my-font.woff2")',
        fontFamily: 'MyFont',
        fontWeight: 'bold'
      });
    `,

    // globalFontFace with src first (special fontFace ordering)
    `
      import { globalFontFace } from '@vanilla-extract/css';
      
      globalFontFace('MyFont', {
        src: 'url("/fonts/my-font.woff2")',
        fontFamily: 'MyFont',
        fontWeight: 'bold'
      });
    `,

    // style with alphabetical order
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        backgroundColor: 'blue',
        color: 'white',
        margin: '10px'
      });
    `,

    // styleVariants with alphabetical order
    `
      import { styleVariants } from '@vanilla-extract/css';
      
      const variants = styleVariants({
        primary: {
          backgroundColor: 'blue',
          color: 'white'
        },
        secondary: {
          backgroundColor: 'red',
          color: 'white'
        }
      });
    `,

    // keyframes with alphabetical order
    `
      import { keyframes } from '@vanilla-extract/css';
      
      const fadeIn = keyframes({
        '0%': {
          opacity: 0,
          transform: 'scale(0.9)'
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)'
        }
      });
    `,

    // globalStyle with alphabetical order
    `
      import { globalStyle } from '@vanilla-extract/css';
      
      globalStyle('.button', {
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px'
      });
    `,

    // globalKeyframes with alphabetical order
    `
      import { globalKeyframes } from '@vanilla-extract/css';
      
      globalKeyframes('fadeIn', {
        '0%': {
          opacity: 0,
          transform: 'scale(0.9)'
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)'
        }
      });
    `,

    // recipe with alphabetical order
    `
      import { recipe } from '@vanilla-extract/recipes';
      
      const button = recipe({
        base: {
          backgroundColor: 'blue',
          color: 'white'
        },
        variants: {
          size: {
            small: {
              fontSize: '12px',
              padding: '4px'
            },
            large: {
              fontSize: '16px',
              padding: '8px'
            }
          }
        }
      });
    `,
  ],
  invalid: [
    // style with wrong order
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const myStyle = style({
          margin: '10px',
          backgroundColor: 'blue'
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
    },

    // globalStyle with wrong order
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        
        globalStyle('.button', {
          padding: '10px',
          backgroundColor: 'blue'
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
    },
  ],
});

// Test concentric order with reference-based visitor
run({
  name: 'reference-based-visitor/concentric',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // style with concentric order
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        display: 'flex',
        backgroundColor: 'blue'
      });
    `,
  ],
  invalid: [
    // style with wrong concentric order
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const myStyle = style({
          backgroundColor: 'blue',
          display: 'flex'
        });
      `,
      errors: [{ messageId: 'incorrectOrder' }],
    },
  ],
});

// Test edge cases
run({
  name: 'reference-based-visitor/edge-cases',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // fontFace with no arguments
    `
      import { fontFace } from '@vanilla-extract/css';
      
      const myFont = fontFace();
    `,

    // globalFontFace with only one argument
    `
      import { globalFontFace } from '@vanilla-extract/css';
      
      globalFontFace('MyFont');
    `,

    // style with no arguments
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style();
    `,

    // globalStyle with only one argument
    `
      import { globalStyle } from '@vanilla-extract/css';
      
      globalStyle('.button');
    `,

    // Non-identifier callee (should be ignored)
    `
      import { style } from '@vanilla-extract/css';
      
      const obj = {
        style: (props) => props
      };
      
      obj.style({ margin: '10px', backgroundColor: 'blue' });
    `,

    // Untracked function (should be ignored)
    `
      import { style } from '@vanilla-extract/css';
      
      function customFunction(props) {
        return props;
      }
      
      customFunction({ margin: '10px', backgroundColor: 'blue' });
    `,

    // fontFace with correct alphabetical order after src
    `
      import { fontFace } from '@vanilla-extract/css';
      
      const myFont = fontFace({
        src: 'url("/fonts/my-font.woff2")',
        fontFamily: 'MyFont',
        fontWeight: 'bold'
      });
    `,

    // globalFontFace with correct alphabetical order after src
    `
      import { globalFontFace } from '@vanilla-extract/css';
      
      globalFontFace('MyFont', {
        src: 'url("/fonts/my-font.woff2")',
        fontFamily: 'MyFont',
        fontWeight: 'bold'
      });
    `,
  ],
  invalid: [
    // fontFace with wrong order (should report error)
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';
        
        const myFont = fontFace({
          fontWeight: 'bold',
          fontFamily: 'MyFont',
          src: 'url("/fonts/my-font.woff2")'
        });
      `,
      errors: [{ messageId: 'fontFaceOrder' }],
    },

    // globalFontFace with wrong order (should report error)
    {
      code: `
        import { globalFontFace } from '@vanilla-extract/css';
        
        globalFontFace('MyFont', {
          fontWeight: 'bold',
          src: 'url("/fonts/my-font.woff2")'
        });
      `,
      errors: [{ messageId: 'fontFaceOrder' }],
    },
  ],
});

// Test userDefinedGroupOrder strategy with reference-based visitor
run({
  name: 'reference-based-visitor/user-defined-order',
  rule: {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Test user-defined group order',
      },
      messages: {
        incorrectOrder: 'Properties should be ordered according to user-defined groups.',
      },
      fixable: 'code',
    },
    create(context: Rule.RuleContext) {
      return createReferenceBasedNodeVisitors(
        context,
        'userDefinedGroupOrder',
        ['display', 'position', 'color', 'backgroundColor'],
        'alphabetical'
      );
    },
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // style with correct user-defined order
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        display: 'flex',
        color: 'blue'
      });
    `,

    // recipe with user-defined order
    `
      import { recipe } from '@vanilla-extract/recipes';
      
      const button = recipe({
        base: {
          display: 'flex',
          color: 'blue'
        }
      });
    `,
  ],
  invalid: [
    // style with wrong user-defined order
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const myStyle = style({
          color: 'blue',
          display: 'flex'
        });
      `,
      errors: [{ messageId: 'incorrectOrder' }],
    },
  ],
});

// Test userDefinedGroupOrder with empty array (should fallback to alphabetical)
run({
  name: 'reference-based-visitor/user-defined-order-empty',
  rule: {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Test user-defined group order with empty array',
      },
      messages: {
        alphabeticalOrder: 'Properties should be in alphabetical order.',
      },
      fixable: 'code',
    },
    create(context: Rule.RuleContext) {
      return createReferenceBasedNodeVisitors(
        context,
        'userDefinedGroupOrder',
        [],
        'alphabetical'
      );
    },
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // style with alphabetical order (fallback)
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        backgroundColor: 'blue',
        color: 'white'
      });
    `,
  ],
  invalid: [
    // style with wrong alphabetical order
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const myStyle = style({
          color: 'white',
          backgroundColor: 'blue'
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
    },
  ],
});

// Test default case in ordering strategy
run({
  name: 'reference-based-visitor/default-strategy',
  rule: {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Test default ordering strategy',
      },
      messages: {
        alphabeticalOrder: 'Properties should be in alphabetical order.',
      },
      fixable: 'code',
    },
    create(context: Rule.RuleContext) {
      return createReferenceBasedNodeVisitors(
        context,
        'unknown' as OrderingStrategy,
        undefined,
        undefined
      );
    },
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Should fall back to alphabetical
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        backgroundColor: 'blue',
        color: 'white'
      });
    `,
  ],
  invalid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const myStyle = style({
          color: 'white',
          backgroundColor: 'blue'
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
    },
  ],
});

// Test non-Identifier callee (should be ignored)
run({
  name: 'reference-based-visitor/non-identifier-callee',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Member expression callee should be ignored
    `
      import { style } from '@vanilla-extract/css';
      
      const obj = {
        style: (props) => props
      };
      
      obj.style({ margin: '10px', backgroundColor: 'blue' });
    `,
  ],
  invalid: [],
});

// Test functions with no arguments
run({
  name: 'reference-based-visitor/no-arguments',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // fontFace with no arguments
    `
      import { fontFace } from '@vanilla-extract/css';
      
      const myFont = fontFace();
    `,
    
    // globalFontFace with only one argument
    `
      import { globalFontFace } from '@vanilla-extract/css';
      
      globalFontFace('MyFont');
    `,
    
    // style with no arguments
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style();
    `,
    
    // globalStyle with only one argument
    `
      import { globalStyle } from '@vanilla-extract/css';
      
      globalStyle('.button');
    `,
    
    // globalKeyframes with only one argument
    `
      import { globalKeyframes } from '@vanilla-extract/css';
      
      globalKeyframes('fadeIn');
    `,
  ],
  invalid: [],
});

// Test concentric order with recipe
run({
  name: 'reference-based-visitor/concentric-recipe',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // recipe with concentric order
    `
      import { recipe } from '@vanilla-extract/recipes';
      
      const button = recipe({
        base: {
          display: 'flex',
          backgroundColor: 'blue'
        }
      });
    `,
  ],
  invalid: [
    // recipe with wrong concentric order
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const button = recipe({
          base: {
            backgroundColor: 'blue',
            display: 'flex'
          }
        });
      `,
      errors: [{ messageId: 'incorrectOrder' }],
    },
  ],
});
