import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import testRuleForPropertyNameExtractor from './test-property-name-rule.js';

run({
  name: 'vanilla-extract/property-name-extractor-tests',
  rule: testRuleForPropertyNameExtractor,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Test for identifier and string literal keys (should return names)
    `
      import { style } from '@vanilla-extract/css';

      const myStyle = style({
        color: 'blue',
        'background-color': 'white',
        fontSize: '16px'
      });
    `,

    // Test for computed property with non-string literal (should return empty string)
    `
      import { style } from '@vanilla-extract/css';

      const myStyle = style({
        [42]: 'numeric key',
        [true]: 'boolean key'
      });
    `,

    // Test for computed property with complex expression
    `
      import { style } from '@vanilla-extract/css';

      const myStyle = style({
        [Math.random() > 0.5 ? 'dynamicKey' : 'otherKey']: 'dynamic value'
      });
    `,

    // Test for property with template literal key
    `
      import { style } from '@vanilla-extract/css';

      const prefix = 'webkit';
      const myStyle = style({
        [\`-\${prefix}-appearance\`]: 'none'
      });
    `,
  ],
  invalid: [],
});
