import { TSESTree } from '@typescript-eslint/utils';

/**
 * Type guard to check if a node is an ObjectExpression.
 */
export const isObjectExpression = (node: TSESTree.Node): node is TSESTree.ObjectExpression => {
  return node.type === 'ObjectExpression';
};

/**
 * Checks if an object expression is empty (has no properties).
 * @param node The node to check.
 * @returns True if the node is an ObjectExpression with no properties.
 */
export const isEmptyObject = (node: TSESTree.Node): boolean => {
  return isObjectExpression(node) && node.properties.length === 0;
};
