import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { enforceAlphabeticalCSSOrderInRecipe } from '../alphabetical-order/recipe-order-enforcer.js';
import { enforceAlphabeticalCSSOrderInStyleObject } from '../alphabetical-order/style-object-processor.js';
import { enforceConcentricCSSOrderInRecipe } from '../concentric-order/recipe-order-enforcer.js';
import { enforceConcentricCSSOrderInStyleObject } from '../concentric-order/style-object-processor.js';
import { enforceUserDefinedGroupOrderInRecipe } from '../custom-order/recipe-order-enforcer.js';
import { enforceUserDefinedGroupOrderInStyleObject } from '../custom-order/style-object-processor.js';
import { enforceFontFaceOrder } from './font-face-property-order-enforcer.js';
import { processStyleNode } from './style-node-processor.js';
import type { SortRemainingProperties } from '../concentric-order/types.js';
import type { OrderingStrategy } from '../types.js';

/**
 * Creates an ESLint rule listener with visitors for style-related function calls.
 * @param ruleContext The ESLint rule context.
 * @param orderingStrategy The strategy to use for ordering CSS properties ('alphabetical', 'concentric', or 'userDefinedGroupOrder').
 * @param userDefinedGroupOrder An optional array of property groups for the 'userDefinedGroupOrder' strategy.
 * @param sortRemainingProperties An optional strategy for sorting properties not in user-defined groups.
 * @returns An object with visitor functions for the ESLint rule.
 *
 * This function sets up visitors for the following cases:
 * 1. The fontFace and globalFontFace functions.
 * 2. Style-related functions: 'keyframes', 'style', 'styleVariants'.
 * 3. The 'globalStyle' and 'globalKeyframes' function
 * 4. The 'recipe' function
 *
 * Each visitor applies the appropriate ordering strategy to the style objects in these function calls.
 */
export const createNodeVisitors = (
  ruleContext: Rule.RuleContext,
  orderingStrategy: OrderingStrategy,
  userDefinedGroupOrder?: string[],
  sortRemainingProperties?: SortRemainingProperties,
): Rule.RuleListener => {
  // Select the appropriate property processing function based on the ordering strategy
  const processProperty = (() => {
    switch (orderingStrategy) {
      case 'alphabetical':
        return enforceAlphabeticalCSSOrderInStyleObject;
      case 'concentric':
        return enforceConcentricCSSOrderInStyleObject;
      case 'userDefinedGroupOrder':
        if (!userDefinedGroupOrder || userDefinedGroupOrder.length === 0) {
          return enforceAlphabeticalCSSOrderInStyleObject;
        }
        return (ruleContext: Rule.RuleContext, node: TSESTree.Node) =>
          enforceUserDefinedGroupOrderInStyleObject(
            ruleContext,
            node as TSESTree.ObjectExpression,
            userDefinedGroupOrder,
            sortRemainingProperties,
          );
      default:
        return enforceAlphabeticalCSSOrderInStyleObject;
    }
  })();

  return {
    CallExpression(node) {
      if (node.callee.type !== 'Identifier') {
        return;
      }

      const fontFaceFunctionArgumentIndexMap = {
        fontFace: 0, // First argument (index 0)
        globalFontFace: 1, // Second argument (index 1)
      };

      // Handle font face functions with special ordering
      if (
        node.callee.name in fontFaceFunctionArgumentIndexMap &&
        node.arguments.length >
          fontFaceFunctionArgumentIndexMap[node.callee.name as keyof typeof fontFaceFunctionArgumentIndexMap]
      ) {
        const argumentIndex =
          fontFaceFunctionArgumentIndexMap[node.callee.name as keyof typeof fontFaceFunctionArgumentIndexMap];
        const styleArguments = node.arguments[argumentIndex];

        enforceFontFaceOrder(ruleContext, styleArguments as TSESTree.ObjectExpression);

        return;
      }

      // Handle style-related functions
      if (['keyframes', 'style', 'styleVariants'].includes(node.callee.name)) {
        if (node.arguments.length > 0) {
          const styleArguments = node.arguments[0];
          processStyleNode(ruleContext, styleArguments as TSESTree.Node, processProperty);
        }
      }

      // Handle global functions
      if (
        (node.callee.name === 'globalKeyframes' || node.callee.name === 'globalStyle') &&
        node.arguments.length >= 2
      ) {
        const styleArguments = node.arguments[1];
        processStyleNode(ruleContext, styleArguments as TSESTree.Node, processProperty);
      }

      // Handle recipe function
      if (node.callee.name === 'recipe') {
        switch (orderingStrategy) {
          case 'alphabetical':
            enforceAlphabeticalCSSOrderInRecipe(node as TSESTree.CallExpression, ruleContext);
            break;
          case 'concentric':
            enforceConcentricCSSOrderInRecipe(ruleContext, node as TSESTree.CallExpression);
            break;
          case 'userDefinedGroupOrder':
            if (userDefinedGroupOrder) {
              enforceUserDefinedGroupOrderInRecipe(
                ruleContext,
                node as TSESTree.CallExpression,
                userDefinedGroupOrder,
                sortRemainingProperties,
              );
            }
            break;
        }
      }
    },
  };
};
