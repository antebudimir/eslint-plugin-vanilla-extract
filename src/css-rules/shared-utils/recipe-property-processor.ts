import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';

/**
 * Processes the `base` and `variants` properties of a recipe object.
 * @param ruleContext The ESLint rule context.
 * @param recipeNode The recipe object node to process.
 * @param processProperty A callback function to process each property object (e.g., for alphabetical or concentric ordering).
 *
 * This function iterates through the properties of the recipe object:
 * - For the `base` property, it directly processes the object.
 * - For the `variants` property, it processes each variant's options individually.
 *
 * The function skips any non-Property nodes or nodes without an Identifier key.
 * It only processes ObjectExpression values to ensure type safety.
 */
export const processRecipeProperties = (
  ruleContext: Rule.RuleContext,
  recipeNode: TSESTree.ObjectExpression,
  processProperty: (ruleContext: Rule.RuleContext, value: TSESTree.ObjectExpression) => void,
): void => {
  recipeNode.properties.forEach((property: TSESTree.Property | TSESTree.SpreadElement) => {
    if (property.type !== 'Property' || property.key.type !== 'Identifier') {
      return; // Skip non-property nodes or nodes without an identifier key
    }

    // Process the `base` property
    if (property.key.name === 'base' && property.value.type === 'ObjectExpression') {
      processProperty(ruleContext, property.value);
    }

    // Process the `variants` property
    if (property.key.name === 'variants' && property.value.type === 'ObjectExpression') {
      property.value.properties.forEach((variantProperty) => {
        if (variantProperty.type === 'Property' && variantProperty.value.type === 'ObjectExpression') {
          variantProperty.value.properties.forEach((optionProperty) => {
            if (optionProperty.type === 'Property' && optionProperty.value.type === 'ObjectExpression') {
              processProperty(ruleContext, optionProperty.value);
            }
          });
        }
      });
    }
  });
};
