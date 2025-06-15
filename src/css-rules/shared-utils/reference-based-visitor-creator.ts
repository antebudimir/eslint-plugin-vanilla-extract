import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { enforceAlphabeticalCSSOrderInRecipe } from '../alphabetical-order/recipe-order-enforcer.js';
import { enforceAlphabeticalCSSOrderInStyleObject } from '../alphabetical-order/style-object-processor.js';
import { enforceConcentricCSSOrderInRecipe } from '../concentric-order/recipe-order-enforcer.js';
import { enforceConcentricCSSOrderInStyleObject } from '../concentric-order/style-object-processor.js';
import { enforceUserDefinedGroupOrderInRecipe } from '../custom-order/recipe-order-enforcer.js';
import { enforceUserDefinedGroupOrderInStyleObject } from '../custom-order/style-object-processor.js';
import { enforceFontFaceOrder } from './font-face-property-order-enforcer.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from './reference-tracker.js';
import { processStyleNode } from './style-node-processor.js';
import type { SortRemainingProperties } from '../concentric-order/types.js';
import type { OrderingStrategy } from '../types.js';

/**
 * Creates an ESLint rule listener with visitors for style-related function calls using reference tracking.
 * This automatically detects vanilla-extract functions based on their import statements.
 *
 * @param ruleContext The ESLint rule context.
 * @param orderingStrategy The strategy to use for ordering CSS properties.
 * @param userDefinedGroupOrder An optional array of property groups for the 'userDefinedGroupOrder' strategy.
 * @param sortRemainingProperties An optional strategy for sorting properties not in user-defined groups.
 * @returns An object with visitor functions for the ESLint rule.
 */
export const createReferenceBasedNodeVisitors = (
  ruleContext: Rule.RuleContext,
  orderingStrategy: OrderingStrategy,
  userDefinedGroupOrder?: string[],
  sortRemainingProperties?: SortRemainingProperties,
): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

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
        return (ruleContext: Rule.RuleContext, node: TSESTree.ObjectExpression) =>
          enforceUserDefinedGroupOrderInStyleObject(ruleContext, node, userDefinedGroupOrder, sortRemainingProperties);
      default:
        return enforceAlphabeticalCSSOrderInStyleObject;
    }
  })();

  return {
    // Include the reference tracking visitors
    ...trackingVisitor,

    CallExpression(callExpression) {
      if (callExpression.callee.type !== 'Identifier') {
        return;
      }

      const functionName = callExpression.callee.name;

      // Check if this function is tracked as a vanilla-extract function
      if (!tracker.isTrackedFunction(functionName)) {
        return;
      }

      const originalName = tracker.getOriginalName(functionName);
      if (!originalName) {
        return;
      }

      // Handle different function types based on their original imported name
      switch (originalName) {
        case 'fontFace':
          if (callExpression.arguments.length > 0) {
            const styleArguments = callExpression.arguments[0];
            enforceFontFaceOrder(ruleContext, styleArguments as TSESTree.ObjectExpression);
          }
          break;

        case 'globalFontFace':
          if (callExpression.arguments.length > 1) {
            const styleArguments = callExpression.arguments[1];
            enforceFontFaceOrder(ruleContext, styleArguments as TSESTree.ObjectExpression);
          }
          break;

        case 'style':
        case 'styleVariants':
        case 'keyframes':
          if (callExpression.arguments.length > 0) {
            const styleArguments = callExpression.arguments[0];
            processStyleNode(ruleContext, styleArguments as TSESTree.Node, processProperty);
          }
          break;

        case 'globalStyle':
        case 'globalKeyframes':
          if (callExpression.arguments.length > 1) {
            const styleArguments = callExpression.arguments[1];
            processStyleNode(ruleContext, styleArguments as TSESTree.Node, processProperty);
          }
          break;

        case 'recipe':
          switch (orderingStrategy) {
            case 'alphabetical':
              enforceAlphabeticalCSSOrderInRecipe(callExpression as TSESTree.CallExpression, ruleContext);
              break;
            case 'concentric':
              enforceConcentricCSSOrderInRecipe(ruleContext, callExpression as TSESTree.CallExpression);
              break;
            case 'userDefinedGroupOrder':
              if (userDefinedGroupOrder) {
                enforceUserDefinedGroupOrderInRecipe(
                  ruleContext,
                  callExpression as TSESTree.CallExpression,
                  userDefinedGroupOrder,
                  sortRemainingProperties,
                );
              }
              break;
          }
          break;
      }
    },
  };
};

/**
 * Backwards-compatible alias that maintains the original API.
 * Uses reference tracking internally for automatic detection of vanilla-extract functions.
 */
export const createNodeVisitors = createReferenceBasedNodeVisitors;
