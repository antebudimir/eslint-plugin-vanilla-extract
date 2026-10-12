import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import { expect } from 'vitest';
import noEmptyStyleBlocksRule from '../rule-definition.js';

// Intentionally empty style({}) is a common vanilla-extract pattern used purely as a unique class-name "hook" that's targeted via globalStyle selectors or consumed as a className in other files. Autofix must never remove such declarations while their identifier's still referenced - the rule still reports them, but doesn't fix them.

run({
  name: 'vanilla-extract/no-empty-style-blocks/usage-references',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Class-name hook with a non-empty style object
    `
      import { globalStyle, style } from '@vanilla-extract/css';

      export const buttonWrapper = style({
        display: 'flex',
      });

      globalStyle(\`\${buttonWrapper} > svg\`, {
        color: 'red',
      });
    `,
  ],
  invalid: [
    {
      code: `
        import { globalStyle, style } from '@vanilla-extract/css';

        // used only as a class-name hook, not for its own properties
        export const buttonWrapper = style({});

        globalStyle(\`\${buttonWrapper} > svg\`, {
          color: 'red',
        });
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output(output) {
        expect(output).toContain('export const buttonWrapper = style({});');
        expect(output).toContain('globalStyle(');
      },
    },

    // Non-exported empty style({}) referenced in a globalStyle() template literal - reported, but not auto-fixed because the identifier's still referenced
    {
      code: `
        import { globalStyle, style } from '@vanilla-extract/css';

        const wrapper = style({});

        globalStyle(\`\${wrapper} > svg\`, {
          color: 'red',
        });
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output(output) {
        expect(output).toContain('const wrapper = style({});');
        expect(output).toContain('globalStyle(');
      },
    },

    // Empty style({}) referenced by another declaration in the same file - reported, but not auto-fixed
    {
      code: `
        import { style } from '@vanilla-extract/css';

        const base = style({});

        export const composed = style({
          selectors: { [\`\${base} &\`]: { color: 'red' } },
        });
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output(output) {
        expect(output).toContain('const base = style({});');
        expect(output).toContain('export const composed = style({');
      },
    },

    // Non-exported, unreferenced empty style({}) is still auto-fixed as before
    {
      code: `
        import { style } from '@vanilla-extract/css';

        const unused = style({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';

      `,
    },

    // Global API calls don't declare identifiers, so they remain auto-fixable
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

    // Exported empty fontFace() declaration - reported, but not auto-fixed
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';

        export const myFont = fontFace({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output(output) {
        expect(output).toContain('export const myFont = fontFace({});');
      },
    },

    // Non-exported, unreferenced fontFace() declaration's still auto-fixed as before
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';

        const myFont = fontFace({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { fontFace } from '@vanilla-extract/css';

      `,
    },
  ],
});
