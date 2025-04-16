import type { Rule } from 'eslint';
import { createUnknownUnitVisitors } from './unknown-unit-visitor-creator.js';

const noUnknownUnitRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow invalid or unknown CSS units in vanilla-extract style objects',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
    messages: {
      unknownUnit: 'The unit "{{ unit }}" in value "{{ value }}" is not recognized as a valid CSS unit.',
    },
  },
  create(context) {
    return createUnknownUnitVisitors(context);
  },
};

export default noUnknownUnitRule;
