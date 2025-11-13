import path from 'path';
import { fileURLToPath } from 'url';
import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import rule from '../rule-definition.js';

const valids = [
  // Using theme tokens - should pass
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { vars } from './test-theme.css';
      const myStyle = style({
        color: vars.colors.brand,
        backgroundColor: vars.colors.background,
      });
    `,
  },
  
  // Allowed keywords
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: 'transparent',
        backgroundColor: 'currentcolor',
      });
    `,
  },

  // When checks are disabled
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: '#ff0000',
      });
    `,
    options: [{ checkColors: false }],
  },

  // Allowed values option
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        margin: '0',
        padding: 'auto',
        width: '100%',
      });
    `,
  },

  // Allowed properties option
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderWidth: '1px',
      });
    `,
    options: [{ allowedProperties: ['borderWidth'] }],
  },

  // Helper functions are NOT flagged by default (checkHelperFunctions: false)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        padding: rem(16),
        margin: rem(8),
      });
    `,
    options: [{ themeContracts: ['./test-theme.css.ts'] }],
  },

  // Checks disabled for new categories
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderWidth: '2px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 10,
        opacity: 0.5,
        fontWeight: 700,
        transition: '0.3s ease',
      });
    `,
    options: [{ 
      checkBorderWidths: false,
      checkShadows: false,
      checkZIndex: false,
      checkOpacity: false,
      checkFontWeights: false,
      checkTransitions: false,
    }],
  },
];

// Resolve absolute path to the local test theme contracts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const themeAbs = path.resolve(__dirname, './test-theme.css.ts');
const themeWithRemAbs = path.resolve(__dirname, './test-theme-with-rem.css.ts');

const invalids = [
  // Hard-coded color with exact theme match via absolute themeContracts path
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: '#0055FF',
      });
    `,
    options: [{ themeContracts: [themeAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Hard-coded spacing with exact theme match via absolute themeContracts path
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        margin: '8px',
      });
    `,
    options: [{ themeContracts: [themeAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },
  // Hard-coded color without theme contract
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: '#0055FF',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Hard-coded spacing
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        margin: '8px',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Hard-coded font size
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        fontSize: '16px',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Hard-coded border radius
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderRadius: '4px',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // RGB color
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: 'rgb(255, 0, 0)',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Named color
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: 'red',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Multiple hard-coded values
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: '#0055FF',
        backgroundColor: '#ffffff',
        margin: '8px',
        fontSize: '16px',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Nested structures (media queries, selectors)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        '@media': {
          '(min-width: 768px)': {
            color: '#0055FF',
          },
        },
        selectors: {
          '&:hover': {
            backgroundColor: '#ffffff',
          },
        },
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Recipe with hard-coded values
  {
    code: `
      import { recipe } from '@vanilla-extract/recipes';
      const button = recipe({
        base: {
          color: '#0055FF',
        },
        variants: {
          size: {
            sm: { fontSize: '12px' },
            lg: { fontSize: '20px' },
          },
        },
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // globalStyle with hard-coded values
  {
    code: `
      import { globalStyle } from '@vanilla-extract/css';
      globalStyle('body', {
        color: '#1f2937',
        margin: '0px',
      });
    `,
    errors: [
      {
        messageId: 'hardCodedValueNoContract',
      },
      {
        messageId: 'hardCodedValueNoContract',
      },
    ],
  },

  // Test rem() evaluation - spacing
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        margin: '0.5rem',
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Test rem() evaluation - fontSize
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        fontSize: '1rem',
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Test rem() evaluation - borderRadius
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderRadius: '0.25rem',
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Test color matching with rem theme
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        backgroundColor: '#5614b8',
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Test RGB color matching with rem theme
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: 'rgb(255, 255, 255)',
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs] }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Test helper function detection with checkHelperFunctions: true
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        padding: rem(16),
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs], checkHelperFunctions: true }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
        data: {
          value: '1rem',
          property: 'padding',
          tokenPath: 'lightTheme.spacing.medium',
        },
      },
    ],
  },

  // Test helper function with multiple matches
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        fontSize: rem(16),
      });
    `,
    options: [{ themeContracts: [themeWithRemAbs], checkHelperFunctions: true }],
    errors: [
      {
        messageId: 'hardCodedValueWithToken',
      },
    ],
  },

  // Border widths - string literal
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderWidth: '2px',
        borderTopWidth: '1px',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Border shorthand
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        border: '1px solid red',
        borderTop: '2px dashed blue',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Shadows - boxShadow and textShadow
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textShadow: '1px 1px 2px black',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Z-index - numeric literal
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        zIndex: 10,
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Z-index - string literal
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        zIndex: '100',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Opacity - numeric literal
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        opacity: 0.5,
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Opacity - string literal
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        opacity: '0.8',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Font weight - numeric literal
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        fontWeight: 700,
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Font weight - string literal (named)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        fontWeight: 'bold',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Transitions - duration
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        transition: '0.3s ease-in-out',
        transitionDuration: '200ms',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Animation
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        animation: '1s ease-in',
        animationDuration: '500ms',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Template literal with helper functions (checkHelperFunctions: true)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        boxShadow: \`\${rem(4)} \${rem(8)} \${rem(16)} rgba(0,0,0,0.14)\`,
      });
    `,
    options: [{ checkHelperFunctions: true }],
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Multiple new categories together
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderWidth: '1px',
        boxShadow: '0 2px 4px black',
        zIndex: 999,
        opacity: 0.75,
        fontWeight: 600,
        transition: '0.2s linear',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // HSL color
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        color: 'hsl(200, 50%, 50%)',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // RGBA color
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Filter property (shadow category)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        filter: 'blur(10px)',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Numeric literals for all new categories
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        zIndex: 5,
        opacity: 1,
        fontWeight: 400,
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // fontFace with hard-coded values
  {
    code: `
      import { fontFace } from '@vanilla-extract/css';
      const myFont = fontFace({
        fontWeight: 700,
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // All new categories without theme contract (to test getCategoryName paths)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderWidth: '3px',
        borderTopWidth: '2px',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        textShadow: '2px 2px 4px black',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
        zIndex: 50,
        opacity: 0.9,
        fontWeight: 500,
        transition: '0.5s cubic-bezier(0.25,0.1,0.25,1)',
        animation: '2s ease-out',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // String variants of numeric categories
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        zIndex: '25',
        opacity: '0.3',
        fontWeight: '300',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Edge case: named font weights
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        fontWeight: 'bolder',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Edge case: various transition timing functions
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        transitionTimingFunction: 'ease',
        animationTimingFunction: 'linear',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Border shorthand variants
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        borderTop: '3px dotted green',
        borderRight: '1px solid black',
        borderBottom: '2px dashed blue',
        borderLeft: '4px double red',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Outline (also a border-width category property)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      const myStyle = style({
        outline: '2px solid red',
        outlineWidth: '3px',
      });
    `,
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Template literals for new categories (checkHelperFunctions: true)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        borderWidth: \`\${rem(2)}\`,
        boxShadow: \`\${rem(0)} \${rem(4)} \${rem(8)} rgba(0,0,0,0.2)\`,
        fontWeight: \`700\`,
        transition: \`\${0.3}s ease\`,
      });
    `,
    options: [{ checkHelperFunctions: true }],
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // CallExpression for new categories (checkHelperFunctions: true)
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        borderWidth: rem(2),
        borderRadius: rem(8),
      });
    `,
    options: [{ checkHelperFunctions: true }],
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // Template literals for spacing, fontSize, borderRadius with helpers
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        margin: \`\${rem(16)}\`,
        fontSize: \`\${rem(14)}\`,
        borderRadius: \`\${rem(4)}\`,
      });
    `,
    options: [{ checkHelperFunctions: true }],
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },

  // CallExpression for all main categories
  {
    code: `
      import { style } from '@vanilla-extract/css';
      import { rem } from 'polished';
      const myStyle = style({
        padding: rem(12),
        fontSize: rem(16),
        borderRadius: rem(8),
        borderWidth: rem(1),
      });
    `,
    options: [{ checkHelperFunctions: true }],
    errors: [
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
      { messageId: 'hardCodedValueNoContract' },
    ],
  },
];

run({
  name: 'vanilla-extract/prefer-theme-tokens',
  rule: rule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: valids,
  invalid: invalids,
});
