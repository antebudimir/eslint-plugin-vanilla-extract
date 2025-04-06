import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import { expect } from 'vitest';
import noEmptyStyleBlocksRule from '../rule-definition.js';

// The output function approach with assertions is used instead of exact string comparison because ESLint's autofix functionality modifies whitespace in ways that are difficult to predict exactly, and ESLint v9 has stricter RuleTester checks that require output to match character-for-character. This approach allows for more flexible assertions about the important parts of the output without requiring exact whitespace matching, making tests more resilient to small changes in whitespace handling.

run({
  name: 'vanilla-extract/no-empty-style-blocks/style-variants',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // In the valid array:
    {
      code: `
    import { styleVariants } from '@vanilla-extract/css';

    const styles = { color: 'blue' };
    export const variantsWithSpread = styleVariants({
      ...styles,
      primary: { color: 'red' }
    });
  `,
    },

    // Valid style variants with non-empty objects
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const validVariants = styleVariants({
          primary: { color: 'blue' },
          secondary: { color: 'green' }
        });
      `,
    },
    // Valid style variants with arrays containing values
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const validArrayVariants = styleVariants({
          primary: [{ color: 'blue' }, { fontWeight: 'bold' }],
          secondary: [{ color: 'green' }]
        });
      `,
    },
    // Mixed valid variants
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const mixedVariants = styleVariants({
          primary: { color: 'blue' },
          secondary: [{ color: 'green' }, { fontWeight: 'bold' }]
        });
      `,
    },
  ],
  invalid: [
    // Empty style variants object
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const emptyVariants = styleVariants({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output(output) {
        expect(output).toContain('import { styleVariants } from');
        expect(output).not.toContain('export const emptyVariants');
      },
    },
    // Style variants with empty object property
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const variantsWithEmptyObject = styleVariants({
          primary: {},
          secondary: { color: 'green' }
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("secondary: { color: 'green' }");
        expect(output).not.toContain('primary: {}');
      },
    },
    // Style variants with empty array property
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const variantsWithEmptyArray = styleVariants({
          primary: [],
          secondary: { color: 'green' }
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("secondary: { color: 'green' }");
        expect(output).not.toContain('primary: []');
      },
    },
    // Style variants with multiple empty properties
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const variantsWithMultipleEmptyProps = styleVariants({
          primary: {},
          secondary: [],
          tertiary: { color: 'green' }
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }, { messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("tertiary: { color: 'green' }");
        expect(output).not.toContain('primary: {}');
        expect(output).not.toContain('secondary: []');
      },
    },
    // Style variants with all empty properties
    {
      code: `
    import { styleVariants } from '@vanilla-extract/css';

    export const allEmptyVariants = styleVariants({
      primary: {},
      secondary: []
    });
  `,
      errors: [{ messageId: 'emptyVariantValue' }, { messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain('import { styleVariants } from');
        expect(output).not.toContain('export const allEmptyVariants');
        expect(output).not.toContain('primary: {}');
        expect(output).not.toContain('secondary: []');
      },
    },

    // Style variants with trailing comma
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const variantsWithTrailingComma = styleVariants({
          primary: {},
          secondary: { color: 'green' },
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("secondary: { color: 'green' },");
        expect(output).not.toContain('primary: {}');
      },
    },
    // First empty property
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const firstEmptyProperty = styleVariants({
          primary: {},
          secondary: { color: 'green' },
          tertiary: { color: 'blue' }
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("secondary: { color: 'green' }");
        expect(output).toContain("tertiary: { color: 'blue' }");
        expect(output).not.toContain('primary: {}');
      },
    },
    // Middle empty property
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const middleEmptyProperty = styleVariants({
          primary: { color: 'red' },
          secondary: {},
          tertiary: { color: 'blue' }
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("primary: { color: 'red' }");
        expect(output).toContain("tertiary: { color: 'blue' }");
        expect(output).not.toContain('secondary: {}');
      },
    },
    // Last empty property
    {
      code: `
        import { styleVariants } from '@vanilla-extract/css';

        export const lastEmptyProperty = styleVariants({
          primary: { color: 'red' },
          secondary: { color: 'green' },
          tertiary: {}
        });
      `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output(output) {
        expect(output).toContain("primary: { color: 'red' }");
        expect(output).toContain("secondary: { color: 'green' }");
        expect(output).not.toContain('tertiary: {}');
      },
    },
  ],
});
