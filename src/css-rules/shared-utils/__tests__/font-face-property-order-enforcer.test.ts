import type { Rule } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../../alphabetical-order/rule-definition.js';
import { enforceFontFaceOrder } from '../font-face-property-order-enforcer.js';
import type { TSESTree } from '@typescript-eslint/utils';

// A modified version of the rule that tests the edge cases
const fontFaceEdgeCasesRule = {
  ...alphabeticalOrderRule,
  create(context: Rule.RuleContext) {
    return {
      // Test case for null/undefined fontFaceObject
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'testNullCase') {
          // This will trigger the first early return
          enforceFontFaceOrder(context, null as unknown as TSESTree.ObjectExpression);
        }

        // Test case for non-ObjectExpression node
        if (node.callee.type === 'Identifier' && node.callee.name === 'testNonObjectCase') {
          // This will trigger the first early return (wrong type)
          enforceFontFaceOrder(context, { type: 'Literal' } as unknown as TSESTree.ObjectExpression);
        }

        // Test case for empty or single property object
        if (node.callee.type === 'Identifier' && node.callee.name === 'testSinglePropertyCase') {
          // This will trigger the second early return (regularProperties.length <= 1)
          enforceFontFaceOrder(context, {
            type: 'ObjectExpression',
            properties: [
              {
                type: 'Property',
                key: { type: 'Identifier', name: 'fontFamily' },
                value: { type: 'Literal', value: 'Arial' },
                computed: false,
                kind: 'init',
                method: false,
                shorthand: false,
              },
            ],
          } as TSESTree.ObjectExpression);
        }
      },
    };
  },
};

run({
  name: 'vanilla-extract/font-face-edge-cases',
  rule: fontFaceEdgeCasesRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [`testNullCase();`, `testNonObjectCase();`, `testSinglePropertyCase();`],
  invalid: [],
});
