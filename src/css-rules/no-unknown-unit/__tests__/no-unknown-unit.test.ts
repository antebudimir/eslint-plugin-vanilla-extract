import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noUnknownUnitRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-unknown-unit',
  rule: noUnknownUnitRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    `
      import { style } from '@vanilla-extract/css';
      const valid = style({
        width: '100%',
        padding: '2rem',
        margin: '0',
        fontSize: '1.5em',
      });
    `,

    `
      import { style } from '@vanilla-extract/css';
      const nested = style({
        '@media': {
          '(min-width: 768px)': {
            padding: '2cqw',
            margin: '1svh'
          }
        },
        selectors: {
          '&:hover': {
            rotate: '45deg'
          }
        }
      });
    `,

    `
      import { recipe } from '@vanilla-extract/css';
      const button = recipe({
        variants: {
          size: {
            small: { padding: '4mm' },
            large: { fontSize: '2lh' }
          }
        }
      });
    `,

    `
      import { fontFace } from '@vanilla-extract/css';
      const myFont = fontFace({
        src: 'local("Comic Sans")',
        lineGap: '2.3ex'
      });
    `,

    `
      import { style } from '@vanilla-extract/css';
      const noUnits = style({
        zIndex: 100,
        opacity: 0.5,
        flexGrow: 1
      });
    `,

    {
      code: `
        import { style } from '@vanilla-extract/css';
        const caseTest = style({
          width: '10Px' // Should be valid (CSS is case-insensitive)
        });
      `,
    },

    {
      code: `
      import { style } from '@vanilla-extract/css';
      const viaMemberExpression = someObject.style({
        width: '10invalid' // Should be ignored
      });
    `,
    },
    {
      code: `
      import { style } from '@vanilla-extract/css';
      const viaCallExpression = (style)();
    `,
    },
    {
      code: `
      import { style } from '@vanilla-extract/css';
      const nestedCall = someFn().style({
        padding: '5pct' // Should be ignored
      });
    `,
    },
    {
      code: `
      import { style } from '@vanilla-extract/css';
      const taggedTemplate = style\`width: 10pxx\`; // Different AST structure
    `,
    },

    {
      code: `
    import { style } from '@vanilla-extract/css';
    style({
      width: \`10px\`, // Valid unit in template literal
      height: \`calc(100% - \${10}px)\` // Should be ignored (multiple quasis)
    });
  `,
    },

    {
      code: `
    import { style } from '@vanilla-extract/css';
    style({
      margin: \` \${''} \`, // Empty template literal
      padding: \`\${'2rem'}\` // Interpolation only
    });
  `,
    },

    {
      code: `
    import { style } from '@vanilla-extract/css';
    style({
      valid: '10px',
      // Add nested non-object properties
      invalidNested: [ { invalid: '10pxx' } ], // Array expression
      invalidMedia: {
        '@media': 'invalid-string' // String instead of object
      }
    });
  `,
    },

    {
      code: `
    import { recipe } from '@vanilla-extract/css';
    recipe({
      base: {
        valid: '1rem',
        // Invalid nested structure
        nestedInvalid: 'not-an-object'
      }
    });
  `,
    },

    {
      code: `
    import { style } from '@vanilla-extract/css';
    const baseStyles = { padding: '1rem' };
    style({
      ...baseStyles, // Spread element (not a Property node)
      margin: '2em'
    });
  `,
    },
    {
      code: `
    import { style } from '@vanilla-extract/css';
    style({
      ...{ width: '10px' }, // Inline spread
      height: '20vh'
    });
  `,
    },
  ],

  invalid: [
    // Basic invalid units
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const invalid = style({
          width: '10pxx',
          padding: '5pct'
        });y
      `,
      errors: [
        {
          messageId: 'unknownUnit',
          data: { unit: 'pxx', value: '10pxx' },
        },
        {
          messageId: 'unknownUnit',
          data: { unit: 'pct', value: '5pct' },
        },
      ],
    },

    // Invalid units in nested contexts
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const nestedInvalid = style({
          '@media': {
            '(min-width: 768px)': {
              margin: '10dvhx'
            }
          },
          selectors: {
            '&:active': {
              rotate: '90rads'
            }
          }
        });
      `,
      errors: [
        { messageId: 'unknownUnit', data: { unit: 'dvhx', value: '10dvhx' } },
        { messageId: 'unknownUnit', data: { unit: 'rads', value: '90rads' } },
      ],
    },

    // Invalid units in recipes
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const invalidRecipe = recipe({
          base: {
            fontSize: '12ptx'
          },
          variants: {
            spacing: {
              large: { padding: '20inchs' }
            }
          }
        });
      `,
      errors: [
        { messageId: 'unknownUnit', data: { unit: 'ptx', value: '12ptx' } },
        { messageId: 'unknownUnit', data: { unit: 'inchs', value: '20inchs' } },
      ],
    },

    // Invalid units in global styles
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('body', {
          margin: '5foot'
        });
      `,
      errors: [{ messageId: 'unknownUnit', data: { unit: 'foot', value: '5foot' } }],
    },

    // Complex value patterns
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const complexValues = style({
          padding: '10px 20cmm', // Second value is invalid
          margin: '1rem 2 3em 4whatever'
        });
      `,
      errors: [
        { messageId: 'unknownUnit', data: { unit: 'cmm', value: '20cmm' } },
        { messageId: 'unknownUnit', data: { unit: 'whatever', value: '4whatever' } },
      ],
    },

    {
      code: `
      import { fontFace } from '@vanilla-extract/css';
      fontFace({
        src: 'local("Test Font")',
        lineGap: '5foot' // Invalid unit
      });
    `,
      errors: [{ messageId: 'unknownUnit', data: { unit: 'foot', value: '5foot' } }],
    },

    {
      code: `
      import { globalFontFace } from '@vanilla-extract/css';
      globalFontFace('MyFont', {
        src: 'local("Test Font")',
        ascentOverride: '10hand' // Invalid unit
      });
    `,
      errors: [{ messageId: 'unknownUnit', data: { unit: 'hand', value: '10hand' } }],
    },
  ],
});
