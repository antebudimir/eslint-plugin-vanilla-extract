import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../../alphabetical-order/rule-definition.js';

run({
  name: 'vanilla-extract/style-node-processor-tests',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Test for empty array
    `
      import { style } from '@vanilla-extract/css';

      const emptyStyle = style([]);
    `,

    // Test for null/undefined handling
    `
      import { style } from '@vanilla-extract/css';

      const dynamicStyle = style(undefined);
      const nullStyle = style(null);
    `,
  ],
  invalid: [
    // Test for array with mixed content
    {
      code: `
        import { style } from '@vanilla-extract/css';

        const myStyle = style([
          { zIndex: 1, position: 'relative' },
          null,
          undefined,
          { display: 'flex', alignItems: 'center' }
        ]);
      `,
      errors: [{ messageId: 'alphabeticalOrder' }, { messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';

        const myStyle = style([
          { position: 'relative', zIndex: 1 },
          null,
          undefined,
          { alignItems: 'center', display: 'flex' }
        ]);
      `,
    },
  ],
});
