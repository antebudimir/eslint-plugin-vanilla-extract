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
      noZeroUnit: 'Zero values don’t need a unit. Replace with "0".',
    },
  },
  create(context) {
    return createZeroUnitVisitors(context);
  },
};

export default noZeroUnitRule;
