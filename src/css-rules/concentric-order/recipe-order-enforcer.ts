import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { enforceConcentricCSSOrderInStyleObject } from './style-object-processor.js';

/**
 * Enforces concentric ordering of CSS properties within a recipe function call.
 *
 * @param ruleContext The ESLint rule context for reporting and fixing issues.
 * @param callExpression The CallExpression node representing the recipe function call.
 *
 * This function does the following:
 * 1. Checks if the first argument of the recipe function is an ObjectExpression.
 * 2. If valid, processes the recipe object's properties.
 * 3. For each relevant property (e.g., 'base', 'variants'), it applies concentric ordering to the CSS properties.
 */
export const enforceConcentricCSSOrderInRecipe = (
  ruleContext: Rule.RuleContext,
  callExpression: TSESTree.CallExpression,
): void => {
  if (callExpression.arguments[0]?.type === 'ObjectExpression') {
    const recipeObjectExpression = callExpression.arguments[0];

    processRecipeProperties(ruleContext, recipeObjectExpression, (currentContext, styleObject) =>
      processStyleNode(currentContext, styleObject, enforceConcentricCSSOrderInStyleObject),
    );
  }
};
