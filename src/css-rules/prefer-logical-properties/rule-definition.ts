import type { Rule } from 'eslint';
import { createLogicalPropertiesVisitors } from './logical-properties-visitor-creator.js';

const preferLogicalPropertiesRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce logical CSS properties over physical directional properties in vanilla-extract',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
            description: 'List of physical properties to allow (supports both camelCase and kebab-case)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferLogicalProperty:
        'Prefer logical CSS property "{{ logical }}" over physical property "{{ physical }}". Logical properties adapt to writing direction.',
      preferLogicalValue:
        'Prefer logical value "{{ logical }}" over physical value "{{ physical }}" for property "{{ property }}". Logical values adapt to writing direction.',
    },
  },
  create(context) {
    return createLogicalPropertiesVisitors(context);
  },
};

export default preferLogicalPropertiesRule;
