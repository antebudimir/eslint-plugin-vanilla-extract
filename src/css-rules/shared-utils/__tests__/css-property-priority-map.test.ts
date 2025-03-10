import type { Rule } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import concentricOrderRule from '../../concentric-order/rule-definition.js';
import { createCSSPropertyPriorityMap } from '../css-property-priority-map.js';

// A modified version of the rule that uses invalid group names
const testPropertyPriorityMapRule = {
  ...concentricOrderRule,
  create(context: Rule.RuleContext) {
    // This will trigger the || [] fallback by using non-existent group names
    createCSSPropertyPriorityMap(['non-existent-group', 'another-fake-group']);

    // Return the original rule's implementation
    return concentricOrderRule.create(context);
  },
};

run({
  name: 'vanilla-extract/css-property-priority-map-tests',
  rule: testPropertyPriorityMapRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Simple test case to execute the rule
    `
      import { style } from '@vanilla-extract/css';
      
      const myStyle = style({
        backgroundColor: 'white',
        color: 'blue'
      });
    `,
  ],
  invalid: [],
});
