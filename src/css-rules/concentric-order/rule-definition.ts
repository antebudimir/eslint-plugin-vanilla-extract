import type { Rule } from 'eslint';
import { createNodeVisitors } from '../shared-utils/order-strategy-visitor-creator.js';

const concentricOrderRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce concentric CSS property ordering in vanilla-extract styles',
      category: 'Stylistic Issues',
      recommended: true,
      url: 'https://rhodesmill.org/brandon/2011/concentric-css/',
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectOrder:
        "Property '{{nextProperty}}' should come before '{{currentProperty}}' according to concentric CSS ordering.",
      fontFaceOrder:
        "Properties in fontFace should be ordered with 'src' first, followed by other properties in alphabetical order. Property '{{nextProperty}}' should come before '{{currentProperty}}'.",
    },
  },
  create(context) {
    return createNodeVisitors(context, 'concentric');
  },
};

export default concentricOrderRule;
