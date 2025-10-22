import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noTrailingZeroRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-trailing-zero',
  rule: noTrailingZeroRule,
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
          padding: '1px',
          width: '1.5rem',
          height: '0.5em',
          fontSize: '2rem',
        });
      `,
      name: 'should allow values without trailing zeros',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: 0,
          padding: 1,
          opacity: 0.5,
          lineHeight: 1.5,
        });
      `,
      name: 'should allow numeric literals without trailing zeros',
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '1px',
            padding: '0.5rem',
          },
          variants: {
            size: {
              small: {
                height: '10px',
                width: '0.75em',
              },
            },
          },
        });
      `,
      name: 'should allow recipe values without trailing zeros',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          ...spreadProps,
          margin: '1px',
          '@media': {
            '1.0rem': '0.5rem' // Key shouldn't be checked
          }
        });
      `,
      name: 'should ignore spread elements and object keys',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: \`1.0\${someUnit}\`, // Template literal
          padding: someVariable,
          width: calculateWidth(),
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
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '10px',
          padding: '100rem',
          width: '1000%',
        });
      `,
      name: 'should allow integers without decimal points',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '11.01rem',
          padding: '2.05em',
          width: '0.101%',
          height: '10.001px',
        });
      `,
      name: 'should not flag zeros in the middle of decimal numbers',
    },
  ],
  invalid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1.0px',
          padding: '2.50rem',
        });
      `,
      errors: [{ messageId: 'trailingZero' }, { messageId: 'trailingZero' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1px',
          padding: '2.5rem',
        });
      `,
      name: 'should fix trailing zeros in string values with units',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          opacity: 1.0,
          lineHeight: 2.50,
        });
      `,
      errors: [{ messageId: 'trailingZero' }, { messageId: 'trailingZero' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          opacity: 1,
          lineHeight: 2.5,
        });
      `,
      name: 'should fix trailing zeros in numeric literals',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0.0',
          padding: '0.00px',
          width: '0.0rem',
        });
      `,
      errors: [{ messageId: 'trailingZero' }, { messageId: 'trailingZero' }, { messageId: 'trailingZero' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0',
          padding: '0',
          width: '0',
        });
      `,
      name: 'should convert 0.0 to 0',
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '1.0px',
          },
          variants: {
            size: {
              small: {
                height: '2.50vh',
              },
            },
          },
        });
      `,
      errors: [{ messageId: 'trailingZero' }, { messageId: 'trailingZero' }],
      output: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '1px',
          },
          variants: {
            size: {
              small: {
                height: '2.5vh',
              },
            },
          },
        });
      `,
      name: 'should handle recipe trailing zeros',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1.0px',
          '@media': {
            '(min-width: 768px)': {
              padding: '2.50rem'
            }
          }
        });
      `,
      errors: 2,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1px',
          '@media': {
            '(min-width: 768px)': {
              padding: '2.5rem'
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
            margin: '1.0px'
          }
        });
      `,
      errors: 1,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '::before': {
            content: '""',
            margin: '1px'
          }
        });
      `,
      name: 'should handle pseudo-elements',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1.0px',
          nested: {
            object: {
              padding: '2.50rem',
              deeper: {
                width: '3.00%'
              }
            }
          }
        });
      `,
      errors: 3,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1px',
          nested: {
            object: {
              padding: '2.5rem',
              deeper: {
                width: '3%'
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
          lineGap: '1.0rem'
        });

        globalFontFace('my-font', {
          src: '...',
          sizeAdjust: '100.0%'
        });
      `,
      errors: 2,
      output: `
        import { fontFace, globalFontFace } from '@vanilla-extract/css';

        fontFace({
          src: '...',
          lineGap: '1rem'
        });

        globalFontFace('my-font', {
          src: '...',
          sizeAdjust: '100%'
        });
      `,
      name: 'should handle fontFace and globalFontFace arguments',
    },
    {
      code: `
        import { globalKeyframes, globalStyle } from '@vanilla-extract/css';

        globalKeyframes('spin', {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360.0deg)' }
        });

        globalStyle('html', {
          margin: '1.0px',
          padding: '2.50rem'
        });
      `,
      errors: 3,
      output: `
        import { globalKeyframes, globalStyle } from '@vanilla-extract/css';

        globalKeyframes('spin', {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        });

        globalStyle('html', {
          margin: '1px',
          padding: '2.5rem'
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
              margin: '1.0px'
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
              margin: '1px'
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
          margin: '-1.0px',
          padding: '-2.50rem',
          top: '-0.0vh',
        });
      `,
      errors: [{ messageId: 'trailingZero' }, { messageId: 'trailingZero' }, { messageId: 'trailingZero' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '-1px',
          padding: '-2.5rem',
          top: '0',
        });
      `,
      name: 'should handle negative values with trailing zeros',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1.50em',
          padding: '0.50rem',
          width: '10.00%',
        });
      `,
      errors: [{ messageId: 'trailingZero' }, { messageId: 'trailingZero' }, { messageId: 'trailingZero' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1.5em',
          padding: '0.5rem',
          width: '10%',
        });
      `,
      name: 'should remove trailing zeros from decimal values',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          padding: '1.0px 2.50rem 3.00em 0.50vh',
        });
      `,
      errors: 1,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          padding: '1px 2.5rem 3em 0.5vh',
        });
      `,
      name: 'should handle multiple values in a single string',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          transition: 'all 0.30s ease',
          animation: 'spin 2.0s linear',
        });
      `,
      errors: 2,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          transition: 'all 0.3s ease',
          animation: 'spin 2s linear',
        });
      `,
      name: 'should handle time units',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          transform: 'rotate(45.0deg)',
          filter: 'hue-rotate(180.00deg)',
        });
      `,
      errors: 2,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          transform: 'rotate(45deg)',
          filter: 'hue-rotate(180deg)',
        });
      `,
      name: 'should handle angle units',
    },
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          small: { padding: '1.0px' },
          medium: { padding: '2.50px' },
          large: { padding: '3.00px' },
        });
      `,
      errors: 3,
      output: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          small: { padding: '1px' },
          medium: { padding: '2.5px' },
          large: { padding: '3px' },
        });
      `,
      name: 'should handle styleVariants',
    },
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        const spin = keyframes({
          '0%': { transform: 'rotate(0.0deg)' },
          '50%': { transform: 'rotate(180.0deg)' },
          '100%': { transform: 'rotate(360.0deg)' },
        });
      `,
      errors: 3,
      output: `
        import { keyframes } from '@vanilla-extract/css';
        const spin = keyframes({
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(180deg)' },
          '100%': { transform: 'rotate(360deg)' },
        });
      `,
      name: 'should handle keyframes',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1.000px',
          padding: '2.5000rem',
          width: '0.00000em',
        });
      `,
      errors: 3,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '1px',
          padding: '2.5rem',
          width: '0',
        });
      `,
      name: 'should handle multiple trailing zeros',
    },
  ],
});
