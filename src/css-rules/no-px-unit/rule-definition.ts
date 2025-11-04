import type { Rule } from 'eslint';
import { createNoPxUnitVisitors } from './px-unit-visitor-creator.js';

const noPxUnitRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "disallow 'px' units in vanilla-extract style objects, with allowlist option",
      category: 'Best Practices',
      recommended: false,
    },
    // Suggestions are reported from helper modules, so static analysis in this file can’t detect them; disable the false positive.
    // eslint-disable-next-line eslint-plugin/require-meta-has-suggestions
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noPxUnit: "Avoid using 'px' units. Use rem, em, or theme tokens instead.",
      replaceWithRem: "Replace 'px' with 'rem'.",
      removePx: "Remove 'px' unit.",
    },
  },
  create(context) {
    return createNoPxUnitVisitors(context);
  },
};

export default noPxUnitRule;
