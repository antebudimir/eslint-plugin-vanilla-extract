import type { Rule } from 'eslint';
import { createNodeVisitors } from '../shared-utils/order-strategy-visitor-creator.js';

const concentricOrderRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce concentric CSS property ordering in vanilla-extract styles',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectOrder: "Property '{{next}}' should come before '{{current}}' according to concentric CSS ordering.",
    },
  },
  create(context) {
    return createNodeVisitors(context, 'concentric');
  },
};

export default concentricOrderRule;
