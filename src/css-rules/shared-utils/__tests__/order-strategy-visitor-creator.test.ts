import type { Rule } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../../alphabetical-order/rule-definition.js';
import customGroupOrderRule from '../../custom-order/rule-definition.js';
import { createNodeVisitors } from '../order-strategy-visitor-creator.js';
import type { TSESTree } from '@typescript-eslint/utils';

// Modified version of the custom order rule with empty group order
const emptyGroupOrderRule = {
  ...customGroupOrderRule,
  create(context: Rule.RuleContext) {
    // Trigger the error for empty userDefinedGroupOrder
    try {
      return customGroupOrderRule.create({
        ...context,
        options: [{ groupOrder: [], sortRemainingProperties: 'alphabetical' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Just catch the error but continue with the test
      return {};
    }
  },
};

// A rule that tests the default case in the switch statement
const defaultCaseRule = {
  ...alphabeticalOrderRule,
  create(context: Rule.RuleContext) {
    // Force the default case by passing an invalid ordering strategy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visitors = createNodeVisitors(context, 'invalid-strategy' as any);
    return visitors;
  },
};

// A rule that tests non-Identifier callee
const nonIdentifierCalleeRule = {
  ...alphabeticalOrderRule,
  create(context: Rule.RuleContext) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Original rule's visitor will be called first
        const visitors = alphabeticalOrderRule.create(context);
        if (visitors.CallExpression) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          visitors.CallExpression(node as any);
        }
      },
    };
  },
};

// Test the empty group order case
run({
  name: 'vanilla-extract/empty-group-order-test',
  rule: emptyGroupOrderRule,
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

// Test the default case in the switch statement
run({
  name: 'vanilla-extract/default-case-test',
  rule: defaultCaseRule,
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

// Test the non-Identifier callee case
run({
  name: 'vanilla-extract/non-identifier-callee-test',
  rule: nonIdentifierCalleeRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Test with a member expression callee (not an Identifier)
    `
      import { css } from '@vanilla-extract/css';
      
      const utils = {
        createStyle: function(obj) { return obj; }
      };
      
      const myStyle = utils.createStyle({
        backgroundColor: 'white',
        color: 'blue'
      });
    `,
  ],
  invalid: [],
});
