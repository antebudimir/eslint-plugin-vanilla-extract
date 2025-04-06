import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyStyleBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-style-blocks/conditional',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Valid cases with non-empty objects
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style(condition ? { color: 'red' } : { background: 'blue' });
      `,
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style(condition ? { /* comment */ color: 'red' } : { background: 'blue' });
      `,
    },
  ],
  invalid: [
    // Test empty consequent (first branch)
    {
      code: `import { style } from '@vanilla-extract/css';
const myStyle = style(condition ? {} : { background: 'blue' });`,
      errors: [{ messageId: 'emptyConditionalStyle' }],
    },
    // Test empty alternate (second branch)
    {
      code: `import { style } from '@vanilla-extract/css';
const myStyle = style(condition ? { color: 'red' } : {});`,
      errors: [{ messageId: 'emptyConditionalStyle' }],
    },
    // Test both branches empty - should report the entire declaration
    {
      code: `import { style } from '@vanilla-extract/css';
const myStyle = style(condition ? {} : {});

`,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
    },
    // Test nested conditional expressions with empty objects
    {
      code: `import { style } from '@vanilla-extract/css';
const myStyle = style(outerCondition ? (innerCondition ? {} : { color: 'blue' }) : {});`,
      errors: [{ messageId: 'emptyConditionalStyle' }],
    },
  ],
});
