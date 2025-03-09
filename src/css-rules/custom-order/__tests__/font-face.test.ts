import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/font-face',
  rule: customGroupOrderRule,
  configs: {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },
  valid: [
    // fontFace
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';
        
        const myFont = fontFace({
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          ascentOverride: '90%',
          descentOverride: '10%',
          fontDisplay: 'swap',
          fontFeatureSettings: '"liga" 1',
          fontStretch: 'normal',
          fontStyle: 'normal',
          fontVariant: 'normal',
          fontWeight: '400'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },

    // globalFontFace
    {
      code: `
        import { globalFontFace } from '@vanilla-extract/css';
        
        globalFontFace('GlobalFont', {
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          ascentOverride: '90%',
          descentOverride: '10%',
          fontDisplay: 'swap',
          fontFeatureSettings: '"liga" 1',
          fontStretch: 'normal',
          fontStyle: 'normal',
          fontVariant: 'normal',
          fontWeight: '400'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },
  ],
  invalid: [
    // fontFace with src not first
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';
        const myFont = fontFace({
          fontWeight: '400',
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          ascentOverride: '90%',
          fontStyle: 'normal'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'fontFaceOrder' }],
      output: `
        import { fontFace } from '@vanilla-extract/css';
        const myFont = fontFace({
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          ascentOverride: '90%',
          fontStyle: 'normal',
          fontWeight: '400'
        });
      `,
    },

    // globalFontFace with src not first
    {
      code: `
        import { globalFontFace } from '@vanilla-extract/css';
        globalFontFace('GlobalFont', {
          fontWeight: '400',
          fontStyle: 'normal',
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          ascentOverride: '90%'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'fontFaceOrder' }],
      output: `
        import { globalFontFace } from '@vanilla-extract/css';
        globalFontFace('GlobalFont', {
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          ascentOverride: '90%',
          fontStyle: 'normal',
          fontWeight: '400'
        });
      `,
    },
  ],
});
