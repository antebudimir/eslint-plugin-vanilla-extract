import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { enforceUserDefinedGroupOrderInStyleObject } from './style-object-processor.js';
import type { SortRemainingProperties } from '../concentric-order/types.js';

/**
 * Enforces custom group ordering of CSS properties within a recipe function call.
 *
 * @param ruleContext The ESLint rule context for reporting and fixing issues.
 * @param callExpression The CallExpression node representing the recipe function call.
 * @param userDefinedGroups An array of property groups in the desired order.
 *
 * This function does the following:
 * 1. Validates that the first argument of the recipe function is an ObjectExpression.
 * 2. Processes the recipe object's properties if valid.
 * 3. Applies custom group ordering to CSS properties in relevant properties (e.g., 'base', 'variants').
 * 4. Processes nested selectors and style objects recursively.
 */
export const enforceUserDefinedGroupOrderInRecipe = (
  ruleContext: Rule.RuleContext,
  callExpression: TSESTree.CallExpression,
  userDefinedGroups: string[],
  sortRemainingProperties?: SortRemainingProperties,
): void => {
  if (callExpression.arguments[0]?.type === 'ObjectExpression') {
    const recipeObjectExpression = callExpression.arguments[0];

    processRecipeProperties(ruleContext, recipeObjectExpression, (currentContext, styleObject) =>
      processStyleNode(currentContext, styleObject, (styleContext, styleObjectNode) =>
        enforceUserDefinedGroupOrderInStyleObject(
          styleContext,
          styleObjectNode,
          userDefinedGroups,
          sortRemainingProperties,
        ),
      ),
    );
  }
};
