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
      alphabeticalOrder: "Property '{{nextProperty}}' should come before '{{currentProperty}}' in alphabetical order.",
      fontFaceOrder:
        "Properties in fontFace should be ordered with 'src' first, followed by other properties in alphabetical order. Property '{{nextProperty}}' should come before '{{currentProperty}}'.",
    },
  },
  create(context) {
    return createNodeVisitors(context, 'alphabetical');
  },
};

export default alphabeticalOrderRule;
