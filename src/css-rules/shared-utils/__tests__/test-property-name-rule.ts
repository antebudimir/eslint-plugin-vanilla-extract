import type { Rule } from 'eslint';
import { getPropertyNameForSorting } from '../property-separator.js';
import type { TSESTree } from '@typescript-eslint/utils';

const testRuleForPropertyNameExtractor: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce test rule for property name extraction',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: undefined,
    schema: [],
    messages: {
      emptyName: 'Property name extraction returned an empty string for this property',
    },
  },
  create() {
    return {
      ObjectExpression(node) {
        // Extract property names without enforcing any order
        node.properties.forEach((property) => {
          if (property.type === 'Property') {
            // Test the getPropertyNameForSorting function
            getPropertyNameForSorting(property as TSESTree.Property);
          }
        });
      },
    };
  },
};

export default testRuleForPropertyNameExtractor;
