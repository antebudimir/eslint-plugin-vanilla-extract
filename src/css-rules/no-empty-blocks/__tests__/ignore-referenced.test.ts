import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import { expect } from 'vitest';
import noEmptyStyleBlocksRule from '../rule-definition.js';

// With `ignoreReferenced: true`, empty declarations that are exported or still referenced elsewhere (e.g. class-name hooks) are treated as intentional and not reported at all. Genuinely unused empty declarations and property-level empty blocks keep the default behavior.

run({
  name: 'vanilla-extract/no-empty-style-blocks/ignore-referenced',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Exported class-name hook - not reported with ignoreReferenced
    {
      code: `
        import { globalStyle, style } from '@vanilla-extract/css';

        export const buttonWrapper = style({});

        globalStyle(\`\${buttonWrapper} > svg\`, {
          color: 'red',
        });
      `,
      options: [{ ignoreReferenced: true }],
    },

    // Non-exported but referenced hook - not reported either
    {
      code: `
        import { globalStyle, style } from '@vanilla-extract/css';

        const wrapper = style({});

        globalStyle(\`\${wrapper} > svg\`, {
          color: 'red',
        });
      `,
      options: [{ ignoreReferenced: true }],
    },

    // Exported empty fontFace() declaration - not reported
    {
      code: `
        import { fontFace } from '@vanilla-extract/css';

        export const myFont = fontFace({});
      `,
      options: [{ ignoreReferenced: true }],
    },
  ],
  invalid: [
    // Unreferenced, non-exported empty style({}) is still reported and auto-removed
    {
      code: `
        import { style } from '@vanilla-extract/css';

        const unused = style({});
      `,
      options: [{ ignoreReferenced: true }],
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { style } from '@vanilla-extract/css';

      `,
    },

    // Identifier-less global API calls stay reported and auto-fixed
    {
      code: `
        import { globalStyle } from '@vanilla-extract/css';

        globalStyle('ul', {});
      `,
      options: [{ ignoreReferenced: true }],
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { globalStyle } from '@vanilla-extract/css';

      `,
    },

    // Property-level detections stay active: empty variant value in an exported recipe's still reported and fixed, even though the whole-declaration report's suppressed
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';

        const sprinkles = createSprinkles(defineProperties({
          properties: { display: ['flex'] }
        }));

        export const myRecipe = recipe({
          base: { color: 'black' },
          variants: {
            layout: {
              flex: sprinkles({}),
            },
          },
        });
      `,
      options: [{ ignoreReferenced: true }],
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain('export const myRecipe = recipe({');
        expect(output).toContain("base: { color: 'black' },");
        expect(output).not.toContain('flex:');
      },
    },
  ],
});
