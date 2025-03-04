import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { enforceAlphabeticalCSSOrderInStyleObject } from './style-object-processor.js';

/**
 * Enforces alphabetical ordering of CSS properties within a recipe function call.
 *
 * @param node The CallExpression node representing the recipe function call.
 * @param context The ESLint rule context.
 *
 * This function does the following:
 * 1. Checks if the first argument of the recipe function is an ObjectExpression.
 * 2. If valid, processes the recipe object's properties.
 * 3. For each relevant property (e.g., 'base', 'variants'), it applies alphabetical ordering to the CSS properties.
 */
export const enforceAlphabeticalCSSOrderInRecipe = (node: TSESTree.CallExpression, context: Rule.RuleContext): void => {
  if (!node.arguments[0] || node.arguments[0].type !== 'ObjectExpression') {
    return;
  }

  const recipeObject = node.arguments[0];

  processRecipeProperties(context, recipeObject, (context, object) =>
    processStyleNode(context, object, enforceAlphabeticalCSSOrderInStyleObject),
  );
};
