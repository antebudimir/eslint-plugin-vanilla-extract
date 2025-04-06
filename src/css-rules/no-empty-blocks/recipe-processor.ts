import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { isEmptyObject } from '../shared-utils/empty-object-processor.js';
import { processEmptyNestedStyles } from './empty-nested-style-processor.js';
import { removeNodeWithComma } from './node-remover.js';
import { areAllChildrenEmpty, getStyleKeyName } from './property-utils.js';

/**
 * Processes a recipe object, removing empty `base` and `variants` properties, as well as empty
 * variant categories and values.
 *
 * @param ruleContext The ESLint rule context.
 * @param recipeNode The recipe object node to process.
 * @param reportedNodes A set of nodes that have already been reported by other processors.
 */
export function processRecipeProperties(
  ruleContext: Rule.RuleContext,
  recipeNode: TSESTree.ObjectExpression,
  reportedNodes: Set<TSESTree.Node>,
): void {
  recipeNode.properties.forEach((property) => {
    if (property.type !== 'Property') {
      return;
    }

    const propertyName = getStyleKeyName(property.key);
    if (!propertyName) {
      return;
    }

    // Handle empty base or variants properties
    if (
      (propertyName === 'base' || propertyName === 'variants') &&
      property.value.type === 'ObjectExpression' &&
      isEmptyObject(property.value)
    ) {
      if (!reportedNodes.has(property)) {
        reportedNodes.add(property);
        ruleContext.report({
          node: property as Rule.Node,
          messageId: 'emptyRecipeProperty',
          data: {
            propertyName,
          },
          fix(fixer) {
            return removeNodeWithComma(ruleContext, property, fixer);
          },
        });
      }
    }

    // Process base property nested objects
    if (propertyName === 'base' && property.value.type === 'ObjectExpression') {
      processEmptyNestedStyles(ruleContext, property.value, reportedNodes);
    }

    // Process variant values
    if (propertyName === 'variants' && property.value.type === 'ObjectExpression') {
      // If variants is empty, it will be handled by the check above
      if (!isEmptyObject(property.value)) {
        // Process variant categories
        property.value.properties.forEach((variantCategoryProperty) => {
          if (
            variantCategoryProperty.type !== 'Property' ||
            variantCategoryProperty.value.type !== 'ObjectExpression'
          ) {
            return;
          }

          // Check if all values in this category are empty
          if (isEmptyObject(variantCategoryProperty.value) || areAllChildrenEmpty(variantCategoryProperty.value)) {
            if (!reportedNodes.has(variantCategoryProperty)) {
              reportedNodes.add(variantCategoryProperty);
              ruleContext.report({
                node: variantCategoryProperty as Rule.Node,
                messageId: 'emptyVariantCategory',
                fix(fixer) {
                  return removeNodeWithComma(ruleContext, variantCategoryProperty, fixer);
                },
              });
            }
            return;
          }

          // Process individual variant values
          variantCategoryProperty.value.properties.forEach((variantValueProperty) => {
            if (variantValueProperty.type !== 'Property') {
              return;
            }

            // Check for non-object variant values
            if (variantValueProperty.value.type !== 'ObjectExpression') {
              if (!reportedNodes.has(variantValueProperty)) {
                reportedNodes.add(variantValueProperty);

                // Get a user-friendly type description as a string
                const friendlyType = (() => {
                  const nodeType = variantValueProperty.value.type;

                  if (nodeType === 'Literal') {
                    const literalValue = variantValueProperty.value as TSESTree.Literal;
                    return literalValue.value === null ? 'null' : typeof literalValue.value;
                  } else if (nodeType === 'Identifier') {
                    return 'variable';
                  }

                  return nodeType;
                })();

                ruleContext.report({
                  node: variantValueProperty as Rule.Node,
                  messageId: 'invalidPropertyType',
                  data: {
                    type: friendlyType,
                  },
                });
              }
              return;
            }

            // Check for empty objects in variant properties
            if (isEmptyObject(variantValueProperty.value)) {
              if (!reportedNodes.has(variantValueProperty)) {
                reportedNodes.add(variantValueProperty);
                ruleContext.report({
                  node: variantValueProperty as Rule.Node,
                  messageId: 'emptyVariantValue',
                  fix(fixer) {
                    return removeNodeWithComma(ruleContext, variantValueProperty, fixer);
                  },
                });
              }
            } else {
              // Process nested styles within variant values
              processEmptyNestedStyles(ruleContext, variantValueProperty.value, reportedNodes);
            }
          });
        });
      }
    }
  });
}
