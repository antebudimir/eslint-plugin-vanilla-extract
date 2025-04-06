import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyStyleBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-style-blocks/spread',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [],
  invalid: [
    // Style with empty spread object
    {
      code: `
        import { style } from '@vanilla-extract/css';
        
        const baseStyles = {
          color: 'blue',
          margin: '10px'
        };
        
        const spreadStyle = style({
          ...baseStyles,
          ...{}
        });
      `,
      errors: [{ messageId: 'emptySpreadObject' }],
      output: `
        import { style } from '@vanilla-extract/css';
        
        const baseStyles = {
          color: 'blue',
          margin: '10px'
        };
        
        const spreadStyle = style({
          ...baseStyles,
          
        });
      `,
    },
  ],
});
