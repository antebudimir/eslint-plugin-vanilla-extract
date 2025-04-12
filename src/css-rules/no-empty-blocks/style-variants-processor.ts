import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { isEmptyObject } from '../shared-utils/empty-object-processor.js';
import { removeNodeWithComma } from './node-remover.js';

/**
 * Processes styleVariants function calls to detect and remove empty style variants.
 *
 * @param ruleContext The ESLint rule context.
 * @param node The styleVariants call argument (object expression).
 * @param reportedNodes A set of nodes that have already been reported.
 */
export const processStyleVariants = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
  reportedNodes: Set<TSESTree.Node>,
): void => {
  node.properties.forEach((property) => {
    if (property.type !== 'Property') {
      return;
    }

    // Check for empty arrays
    if (property.value.type === 'ArrayExpression' && property.value.elements.length === 0) {
      if (!reportedNodes.has(property)) {
        reportedNodes.add(property);
        ruleContext.report({
          node: property as Rule.Node,
          messageId: 'emptyVariantValue',
          fix(fixer) {
            return removeNodeWithComma(ruleContext, property, fixer);
          },
        });
      }
      return;
    }

    // Check for empty objects
    if (property.value.type === 'ObjectExpression' && isEmptyObject(property.value)) {
      if (!reportedNodes.has(property)) {
        reportedNodes.add(property);
        ruleContext.report({
          node: property as Rule.Node,
          messageId: 'emptyVariantValue',
          fix(fixer) {
            return removeNodeWithComma(ruleContext, property, fixer);
          },
        });
      }
      return;
    }
  });
};
