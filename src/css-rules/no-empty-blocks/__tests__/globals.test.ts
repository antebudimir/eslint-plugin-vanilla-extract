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

    // Valid globalStyle with non-empty style object
    `
  import { globalStyle } from '@vanilla-extract/css';
  
  globalStyle('a', {
    color: 'blue'
  });
`,

    // Valid globalFontFace with non-empty style object
    `
  import { globalFontFace } from '@vanilla-extract/css';
  
  globalFontFace('MyFont', {
    src: 'url("/fonts/my-font.woff2")'
  });
`,

    // Valid globalKeyframes with non-empty style object
    `
  import { globalKeyframes } from '@vanilla-extract/css';
  
  globalKeyframes('fadeIn', {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  });
`,

    // Test for global functions without enough arguments
    `
  import { globalStyle } from '@vanilla-extract/css';

  // Missing second argument (style object)
  globalStyle('.selector');
`,

    // Test for globalFontFace without enough arguments
    `
  import { globalFontFace } from '@vanilla-extract/css';

  // Missing second argument (style object)
  globalFontFace('MyFont');
`,

    // Test for globalKeyframes without enough arguments
    `
  import { globalKeyframes } from '@vanilla-extract/css';

  // Missing second argument (style object)
  globalKeyframes('fadeIn');
`,
  ],
  invalid: [
    // Empty globalStyle object
    {
      code: `
    import { globalStyle } from '@vanilla-extract/css';
    
    globalStyle('ul', {});
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
    import { globalStyle } from '@vanilla-extract/css';
    
  `,
    },

    // Empty globalFontFace object
    {
      code: `
    import { globalFontFace } from '@vanilla-extract/css';
    
    globalFontFace('MyFont', {});
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
    import { globalFontFace } from '@vanilla-extract/css';
    
  `,
    },

    // Empty globalKeyframes object
    {
      code: `
    import { globalKeyframes } from '@vanilla-extract/css';
    
    globalKeyframes('fadeIn', {});
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
    import { globalKeyframes } from '@vanilla-extract/css';
    
  `,
    },
  ],
});
