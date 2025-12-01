import type { Rule } from 'eslint';
import { createUnitlessValueVisitors } from './unitless-value-visitor-creator.js';
import type { NoUnitlessValuesOptions } from './unitless-value-processor.js';

const noUnitlessValuesRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow unitless numeric values for CSS properties that require units',
      category: 'Stylistic Issues',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noUnitlessValue:
        'Property "{{ property }}" has unitless value {{ value }}. Add an explicit unit (e.g., "{{ value }}px", "{{ value }}rem").',
    },
  },
  create(context) {
    const options: NoUnitlessValuesOptions = (context.options[0] as NoUnitlessValuesOptions | undefined) || {};
    return createUnitlessValueVisitors(context, options);
  },
};

export default noUnitlessValuesRule;
