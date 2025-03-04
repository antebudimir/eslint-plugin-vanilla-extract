import type { Rule } from 'eslint';
import { createNodeVisitors } from '../shared-utils/order-strategy-visitor-creator.js';

const alphabeticalOrderRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce alphabetical CSS property ordering in vanilla-extract styles',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      alphabeticalOrder: "Property '{{next}}' should come before '{{current}}' in alphabetical order.",
    },
  },
  create(context) {
    return createNodeVisitors(context, 'alphabetical');
  },
};

export default alphabeticalOrderRule;
