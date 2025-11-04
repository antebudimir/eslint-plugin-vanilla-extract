import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noPxUnitRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-px-unit',
  rule: noPxUnitRule,
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
          margin: '1rem',
          padding: 8,
          width: '100%',
          color: vars.color.primary,
        });
      `,
      name: 'allows rem, numbers, and token references',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderWidth: '1px',
          outlineOffset: '2px',
        });
      `,
      options: [{ allow: ['border-width', 'outline-offset', 'borderWidth', 'outlineOffset'] }],
      name: 'respects allowlist for kebab and camelCase',
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: { margin: '1rem' },
          variants: {
            size: {
              sm: { padding: '0.5rem' },
            },
          },
        });
      `,
      name: 'passes when no px in recipe base/variants',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const s = style({
          border: '1px solid',
          borderWidth: '2px'
        });
      `,
      options: [{ allow: ['borderWidth', 'border'] }],
      name: 'does not report whitelisted properties',
    },
  ],
  invalid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          margin: '10px',
          padding: '2px',
        });
      `,
      errors: [{ messageId: 'noPxUnit' }, { messageId: 'noPxUnit' }],
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const s = style({
          '@media': {
            '(min-width: 768px)': {
              lineHeight: '12px',
            }
          },
          selectors: {
            '&:hover': { gap: '4px' }
          }
        });
      `,
      errors: [{ messageId: 'noPxUnit' }, { messageId: 'noPxUnit' }],
      name: 'reports within nested @media and selectors',
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const r = recipe({
          base: { marginTop: '3px' },
          variants: { size: { md: { paddingBottom: '6px' } } }
        });
      `,
      errors: [{ messageId: 'noPxUnit' }, { messageId: 'noPxUnit' }],
      name: 'reports within recipe base and variants',
    },
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';
        fontFace({ sizeAdjust: '10px' });
      `,
      errors: [{ messageId: 'noPxUnit' }],
      name: 'reports in fontFace() first-arg object (covers fontFace branch)',
    },
    {
      code: `
        import { globalFontFace } from '@vanilla-extract/css';
        globalFontFace('MyFont', { lineGapOverride: '12px' });
      `,
      errors: [{ messageId: 'noPxUnit' }],
      name: 'reports in globalFontFace() second-arg object (covers globalFontFace branch)',
    },
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';
        globalStyle('html', { boxShadow: '0 1px 2px black' });
      `,
      errors: [{ messageId: 'noPxUnit' }],
      name: 'reports in globalStyle() second-arg object (covers globalStyle branch)',
    },
    {
      code: `
        import { globalKeyframes } from '@vanilla-extract/css';
        globalKeyframes('fade', {
          from: { margin: '5px' },
          to: { padding: '3px' }
        });
      `,
      errors: [{ messageId: 'noPxUnit' }, { messageId: 'noPxUnit' }],
      name: 'reports in globalKeyframes() frames (covers globalKeyframes branch)',
    },
    {
      code:
        `
        import { style } from '@vanilla-extract/css';
        const s = style({
          margin: ` +
        '`10px`' +
        `,
        });
      `,
      errors: [{ messageId: 'noPxUnit' }],
      name: 'reports for simple template literal with px',
    },
    {
      code:
        `
        import { style } from '@vanilla-extract/css';
        const s = style({
          margin: ` +
        '`${token}px`' +
        `,
        });
      `,
      errors: [{ messageId: 'noPxUnit' }],
      name: 'reports for complex template literals with expressions containing px',
    },
  ],
});
