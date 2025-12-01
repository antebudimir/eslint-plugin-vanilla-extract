import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noUnitlessValuesRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-unitless-values',
  rule: noUnitlessValuesRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Zero values are allowed
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: 0,
          padding: 0,
          width: 0,
        });
      `,
      name: 'should allow zero values without units',
    },

    // String values with units
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '100px',
          margin: '20px',
          padding: '1rem',
          fontSize: '16px',
        });
      `,
      name: 'should allow string values with units',
    },

    // String zero values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '0',
          padding: '0',
        });
      `,
      name: 'should allow string zero values without units',
    },

    // Unitless-valid properties
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          opacity: 0.5,
          zIndex: 10,
          lineHeight: 1.5,
          flexGrow: 1,
          flexShrink: 0,
          order: 2,
          fontWeight: 700,
          zoom: 1.2,
        });
      `,
      name: 'should allow unitless values for properties that accept them',
    },

    // Recipe with valid values
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: '0',
            padding: 0,
            opacity: 0.8,
          },
          variants: {
            size: {
              small: {
                height: '10px',
                width: '10px',
                zIndex: 1,
              },
            },
          },
        });
      `,
      name: 'should allow valid values in recipe',
    },

    // Template literals (not checked)
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: \`\${someValue}px\`,
          padding: someVariable,
        });
      `,
      name: 'should ignore template literals and variables',
    },

    // Nested selectors with valid values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '100px',
          ':hover': {
            margin: '20px',
            opacity: 0.8,
          },
        });
      `,
      name: 'should allow valid values in nested selectors',
    },

    // Media queries with valid values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: 0,
          '@media': {
            '(min-width: 768px)': {
              padding: '20px',
              zIndex: 10,
            }
          }
        });
      `,
      name: 'should allow valid values in media queries',
    },

    // globalStyle with valid values
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('html', {
          margin: '0',
          padding: 0,
          lineHeight: 1.5,
        });
      `,
      name: 'should allow valid values in globalStyle',
    },

    // fontFace with valid values
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';
        fontFace({
          src: 'url(...)',
          fontWeight: 400,
        });
      `,
      name: 'should allow valid values in fontFace',
    },

    // keyframes (animation values are strings)
    {
      code: `
        import { keyframes } from '@vanilla-extract/css';
        const spin = keyframes({
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        });
      `,
      name: 'should allow keyframes with string values',
    },

    // allow option
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: 100,
          margin: '20px',
        });
      `,
      options: [{ allow: ['width'] }],
      name: 'should allow properties specified in allow option',
    },

    // Kebab-case unitless-valid properties
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          'z-index': 10,
          'line-height': 1.5,
          'flex-grow': 1,
        });
      `,
      name: 'should allow unitless values for kebab-case unitless-valid properties',
    },
  ],

  invalid: [
    // Basic unitless values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: 100,
          margin: 20,
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'width', value: '100' } },
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '20' } },
      ],
      name: 'should flag unitless numeric values for length properties',
    },

    // Decimal values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          padding: 10.5,
          fontSize: 16.5,
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'padding', value: '10.5' } },
        { messageId: 'noUnitlessValue', data: { property: 'fontSize', value: '16.5' } },
      ],
      name: 'should flag decimal unitless values',
    },

    // Recipe with unitless values
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            margin: 10,
          },
          variants: {
            size: {
              small: {
                height: 20,
              },
            },
          },
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '10' } },
        { messageId: 'noUnitlessValue', data: { property: 'height', value: '20' } },
      ],
      name: 'should flag unitless values in recipe',
    },

    // Nested selectors with unitless values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: 100,
          ':hover': {
            margin: 20,
          },
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'width', value: '100' } },
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '20' } },
      ],
      name: 'should flag unitless values in nested selectors',
    },

    // Media queries with unitless values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '@media': {
            '(min-width: 768px)': {
              padding: 20,
            }
          }
        });
      `,
      errors: [{ messageId: 'noUnitlessValue', data: { property: 'padding', value: '20' } }],
      name: 'should flag unitless values in media queries',
    },

    // Multiple levels of nesting
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: 10,
          nested: {
            object: {
              padding: 20,
              deeper: {
                width: 30
              }
            }
          }
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '10' } },
        { messageId: 'noUnitlessValue', data: { property: 'padding', value: '20' } },
        { messageId: 'noUnitlessValue', data: { property: 'width', value: '30' } },
      ],
      name: 'should flag unitless values in deeply nested objects',
    },

    // globalStyle with unitless values
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('html', {
          margin: 10,
          padding: 20,
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '10' } },
        { messageId: 'noUnitlessValue', data: { property: 'padding', value: '20' } },
      ],
      name: 'should flag unitless values in globalStyle',
    },

    // Various length properties
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: 100,
          height: 200,
          minWidth: 50,
          maxWidth: 500,
          top: 10,
          left: 20,
          borderWidth: 2,
          borderRadius: 5,
          gap: 15,
          fontSize: 16,
        });
      `,
      errors: 10,
      name: 'should flag all unitless values for various length properties',
    },

    // Kebab-case properties
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          'margin-top': 10,
          'padding-left': 20,
          'font-size': 16,
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'margin-top', value: '10' } },
        { messageId: 'noUnitlessValue', data: { property: 'padding-left', value: '20' } },
        { messageId: 'noUnitlessValue', data: { property: 'font-size', value: '16' } },
      ],
      name: 'should flag unitless values for kebab-case properties',
    },

    // Logical properties
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginBlock: 10,
          paddingInline: 20,
          insetBlockStart: 5,
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'marginBlock', value: '10' } },
        { messageId: 'noUnitlessValue', data: { property: 'paddingInline', value: '20' } },
        { messageId: 'noUnitlessValue', data: { property: 'insetBlockStart', value: '5' } },
      ],
      name: 'should flag unitless values for logical properties',
    },

    // styleVariants
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';
        const variants = styleVariants({
          small: { width: 10 },
          large: { width: 100 },
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'width', value: '10' } },
        { messageId: 'noUnitlessValue', data: { property: 'width', value: '100' } },
      ],
      name: 'should flag unitless values in styleVariants',
    },

    // globalKeyframes
    {
      code: `
        import { globalKeyframes } from '@vanilla-extract/css';
        globalKeyframes('slide', {
          '0%': { left: 0 },
          '100%': { left: 100 }
        });
      `,
      errors: [{ messageId: 'noUnitlessValue', data: { property: 'left', value: '100' } }],
      name: 'should flag unitless values in globalKeyframes',
    },

    // Negative values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: -10,
          top: -5,
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '-10' } },
        { messageId: 'noUnitlessValue', data: { property: 'top', value: '-5' } },
      ],
      name: 'should flag negative unitless values',
    },

    // String unitless values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '100',
          margin: '20',
          padding: '10.5',
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'width', value: '100' } },
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '20' } },
        { messageId: 'noUnitlessValue', data: { property: 'padding', value: '10.5' } },
      ],
      name: 'should flag string unitless values',
    },

    // String negative unitless values
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '-10',
          top: '-5.5',
        });
      `,
      errors: [
        { messageId: 'noUnitlessValue', data: { property: 'margin', value: '-10' } },
        { messageId: 'noUnitlessValue', data: { property: 'top', value: '-5.5' } },
      ],
      name: 'should flag string negative unitless values',
    },
  ],
});
