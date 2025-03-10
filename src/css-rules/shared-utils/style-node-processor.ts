import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';

/**
 * Recursively processes a style node, which can be an object or an array of objects.
 * @param ruleContext The ESLint rule context.
 * @param node The node to process.
 * @param processProperty A function to process each object expression.
 */
export const processStyleNode = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.Node | undefined,
  processProperty: (ruleContext: Rule.RuleContext, value: TSESTree.ObjectExpression) => void,
): void => {
  if (node?.type === 'ObjectExpression') {
    processProperty(ruleContext, node);
  }

  if (node?.type === 'ArrayExpression') {
    node.elements.forEach((element) => {
      if (element && element.type === 'ObjectExpression') {
        processProperty(ruleContext, element);
      }
    });
  }
};
