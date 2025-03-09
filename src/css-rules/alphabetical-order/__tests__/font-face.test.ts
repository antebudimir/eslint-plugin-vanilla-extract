import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/alphabetical-order/font-face',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // fontFace with src first and other properties alphabetically ordered
    `
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

    // globalFontFace with src first and other properties alphabetically ordered
    `
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

    // fontFace with src first but other properties not in alphabetical order
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';
        const myFont = fontFace({
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          fontWeight: '400',
          ascentOverride: '90%',
          fontStyle: 'normal'
        });
      `,
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

    // globalFontFace with src first but other properties not in alphabetical order
    {
      code: `
        import { globalFontFace } from '@vanilla-extract/css';
        globalFontFace('GlobalFont', {
          src: ['url("/fonts/MyFont.woff2") format("woff2")'],
          fontWeight: '400',
          fontStyle: 'normal',
          ascentOverride: '90%'
        });
      `,
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
