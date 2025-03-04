import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

/**
 * Determines if the given object node is a 'selectors' object within a style definition.
 * @param objectNode The object expression node to check.
 * @returns True if the node is a 'selectors' object, false otherwise.
 *
 * This function checks if:
 * 1. The node has a parent
 * 2. The parent is a Property node
 * 3. The parent's key is an Identifier
 * 4. The parent's key name is 'selectors'
 */
export const isSelectorsObject = (objectNode: TSESTree.ObjectExpression): boolean => {
  return (
    objectNode.parent &&
    objectNode.parent.type === AST_NODE_TYPES.Property &&
    objectNode.parent.key.type === 'Identifier' &&
    objectNode.parent.key.name === 'selectors'
  );
};

/**
 * Processes nested selectors within a 'selectors' object by recursively validating their value objects.
 * @param context The ESLint rule context.
 * @param objectNode The object expression node representing the 'selectors' object.
 * @param validateFn A function to validate each nested selector's value object.
 *
 * This function iterates through each property of the 'selectors' object:
 * - If a property's value is an ObjectExpression, it applies the validateFn to that object.
 * - This allows for validation of nested style objects within selectors.
 */
export const processNestedSelectors = (
  context: Rule.RuleContext,
  objectNode: TSESTree.ObjectExpression,
  validateFn: (context: Rule.RuleContext, objectNode: TSESTree.ObjectExpression) => void,
): void => {
  objectNode.properties.forEach((property) => {
    if (property.type === AST_NODE_TYPES.Property && property.value.type === AST_NODE_TYPES.ObjectExpression) {
      validateFn(context, property.value);
    }
  });
};
