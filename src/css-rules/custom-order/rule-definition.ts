import type { Rule } from 'eslint';
import { availableGroups } from '../concentric-order/concentric-groups.js';
import { createNodeVisitors } from '../shared-utils/order-strategy-visitor-creator.js';
import type { SortRemainingProperties } from '../concentric-order/types.js';

interface CustomGroupRuleConfiguration {
  groupOrder?: string[];
  sortRemainingProperties: SortRemainingProperties;
}

const customGroupOrderRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce custom group CSS property ordering in vanilla-extract styles',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          groupOrder: {
            type: 'array',
            items: {
              enum: availableGroups,
            },
          },
          sortRemainingProperties: {
            enum: ['alphabetical', 'concentric'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      // default message for ordering in case no groupOrder is provided
      alphabeticalOrder:
        "Property '{{nextProperty}}' should come before '{{currentProperty}}' according to alphabetical ordering.",
      fontFaceOrder:
        "Properties in fontFace should be ordered with 'src' first, followed by other properties in alphabetical order. Property '{{nextProperty}}' should come before '{{currentProperty}}'.",
      incorrectOrder:
        "Property '{{nextProperty}}' should come before '{{currentProperty}}' according to custom CSS group ordering.",
    },
  },
  create(ruleContext: Rule.RuleContext) {
    const ruleConfiguration = ruleContext.options[0] as CustomGroupRuleConfiguration;
    const userDefinedGroupOrder = ruleConfiguration?.groupOrder ?? [];
    const sortRemainingPropertiesMethod =
      ruleConfiguration?.sortRemainingProperties ?? ('alphabetical' as SortRemainingProperties);

    return createNodeVisitors(
      ruleContext,
      'userDefinedGroupOrder',
      userDefinedGroupOrder,
      sortRemainingPropertiesMethod,
    );
  },
};

export default customGroupOrderRule;
