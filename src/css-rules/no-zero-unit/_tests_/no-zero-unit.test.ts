import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noZeroUnitRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-zero-unit',
  rule: noZeroUnitRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0',
          padding: 0,
          width: '100%',
        });
      `,
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '0',
            padding: 0,
          },
          variants: {
            size: {
              small: {
                height: '0',
                width: '10px',
              },
            },
          },
        });
      `,
    },

    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          ...spreadProps,
          margin: 0,
          '@media': {
            '0rem': '0' // Key shouldn't be checked
          }
        });
      `,
      name: 'should ignore spread elements and object keys',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: \`0\${someUnit}\`, // Template literal
          padding: someVariable
        });
      `,
      name: 'should ignore non-literal values',
    },

    {
      code: `
      import { globalStyle } from '@vanilla-extract/css';
      const callExpression = someObject.fontFace({ src: '...' }); // Non-Identifier callee
    `,
      name: 'should ignore member expression callees',
    },
    {
      code: `
      import { fontFace } from '@vanilla-extract/css';
      fontFace(); // Missing arguments
    `,
      name: 'should handle missing fontFace arguments',
    },
    {
      code: `
      import { globalFontFace } from '@vanilla-extract/css';
      globalFontFace('my-font'); // Missing style argument
    `,
      name: 'should handle missing globalFontFace style argument',
    },
  ],
  invalid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0px',
          padding: '0rem',
        });
      `,
      errors: [{ messageId: 'noZeroUnit' }, { messageId: 'noZeroUnit' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0',
          padding: '0',
        });
      `,
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '0px',
          },
          variants: {
            size: {
              small: {
                height: '0vh',
              },
            },
          },
        });
      `,
      errors: [{ messageId: 'noZeroUnit' }, { messageId: 'noZeroUnit' }],
      output: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '0',
          },
          variants: {
            size: {
              small: {
                height: '0',
              },
            },
          },
        });
      `,
    },

    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0px',
          '@media': {
            '(min-width: 768px)': {
              padding: '0rem'
            }
          }
        });
      `,
      errors: 2,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0',
          '@media': {
            '(min-width: 768px)': {
              padding: '0'
            }
          }
        });
      `,
      name: 'should handle nested media queries',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '::before': {
            content: '""',
            margin: '0px'
          }
        });
      `,
      errors: 1,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '::before': {
            content: '""',
            margin: '0'
          }
        });
      `,
      name: 'should handle pseudo-elements',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0px',
          nested: {
            object: {
              padding: '0rem',
              deeper: {
                width: '0%'
              }
            }
          }
        });
      `,
      errors: 3,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0',
          nested: {
            object: {
              padding: '0',
              deeper: {
                width: '0'
              }
            }
          }
        });
      `,
      name: 'should handle multiple levels of nesting',
    },

    {
      code: `
    import { fontFace, globalFontFace } from '@vanilla-extract/css';

    fontFace({
      src: '...',
      lineGap: '0rem'
    });

    globalFontFace('my-font', {
      src: '...',
      sizeAdjust: '0%'
    });
  `,
      errors: 2,
      output: `
    import { fontFace, globalFontFace } from '@vanilla-extract/css';

    fontFace({
      src: '...',
      lineGap: '0'
    });

    globalFontFace('my-font', {
      src: '...',
      sizeAdjust: '0'
    });
  `,
      name: 'should handle fontFace and globalFontFace arguments',
    },

    // 0deg is valid (deg isn't in our unit check)
    {
      code: `
    import { globalKeyframes, globalStyle } from '@vanilla-extract/css';

    globalKeyframes('spin', {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(0deg)' }
    });

    globalStyle('html', {
      margin: '0px',
      padding: '0rem'
    });
  `,
      errors: 2,
      output: `
    import { globalKeyframes, globalStyle } from '@vanilla-extract/css';

    globalKeyframes('spin', {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(0deg)' }
    });

    globalStyle('html', {
      margin: '0',
      padding: '0'
    });
  `,
      name: 'should handle globalKeyframes and globalStyle arguments',
    },

    {
      code: `
      import { globalStyle } from '@vanilla-extract/css';
      globalStyle('html', {
        '@media': {
          '(min-width: 768px)': {
            margin: '0px'
          }
        }
      });
    `,
      errors: 1,
      output: `
      import { globalStyle } from '@vanilla-extract/css';
      globalStyle('html', {
        '@media': {
          '(min-width: 768px)': {
            margin: '0'
          }
        }
      });
    `,
      name: 'should handle nested globalStyle arguments',
    },

    {
      code: `
    import { style } from '@vanilla-extract/css';
    const myStyle = style({
      margin: '-0px',
      padding: '-0rem',
      top: '-0vh',
      left: '-0%',
    });
  `,
      errors: [
        { messageId: 'noZeroUnit' },
        { messageId: 'noZeroUnit' },
        { messageId: 'noZeroUnit' },
        { messageId: 'noZeroUnit' },
      ],
      output: `
    import { style } from '@vanilla-extract/css';
    const myStyle = style({
      margin: '0',
      padding: '0',
      top: '0',
      left: '0',
    });
  `,
      name: 'should convert negative zero with units to simple zero',
    },
  ],
});
