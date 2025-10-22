import type { Rule } from 'eslint';
import { createTrailingZeroVisitors } from './trailing-zero-visitor-creator.js';

const noTrailingZeroRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow trailing zeros in numeric CSS values',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      trailingZero: 'Numeric value "{{ value }}" has unnecessary trailing zeros. Use "{{ fixed }}" instead.',
    },
  },
  create(context) {
    return createTrailingZeroVisitors(context);
  },
};

export default noTrailingZeroRule;
