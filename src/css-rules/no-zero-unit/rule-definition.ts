import type { Rule } from 'eslint';
import { createZeroUnitVisitors } from './zero-unit-visitor-creator.js';

const noZeroUnitRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce unitless zero in numeric values',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noZeroUnit: 'Unit with zero value is unnecessary. Use 0 instead.',
    },
  },
  create(context) {
    return createZeroUnitVisitors(context);
  },
};

export default noZeroUnitRule;
