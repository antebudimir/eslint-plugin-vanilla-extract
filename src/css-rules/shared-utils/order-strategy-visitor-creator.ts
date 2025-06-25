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
 * @param orderingStrategy The strategy to use for ordering CSS properties ('alphabetical', 'concentric', or 'userDefinedGroupOrder').
 * @param userDefinedGroupOrder An optional array of property groups for the 'userDefinedGroupOrder' strategy.
 * @param sortRemainingProperties An optional strategy for sorting properties not in user-defined groups.
 * @returns An object with visitor functions for the ESLint rule.
 */
export const createNodeVisitors = (
  ruleContext: Rule.RuleContext,
  orderingStrategy: OrderingStrategy,
  userDefinedGroupOrder?: string[],
  sortRemainingProperties?: SortRemainingProperties,
): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

  return {
    // Include the import/variable tracking visitors
    ...trackingVisitor,

    CallExpression(node) {
      if (node.callee.type !== 'Identifier') {
        return;
      }

      const functionName = node.callee.name;

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
          processFontFaceOrdering(ruleContext, node as TSESTree.CallExpression, 0);
          break;

        case 'globalFontFace':
          processFontFaceOrdering(ruleContext, node as TSESTree.CallExpression, 1);
          break;

        case 'style':
        case 'styleVariants':
        case 'keyframes':
          // Check if this is a wrapper function
          const wrapperInfo = tracker.getWrapperInfo(functionName);
          const argumentIndex = wrapperInfo?.parameterMapping ?? 0;

          processStyleOrdering(
            ruleContext,
            node as TSESTree.CallExpression,
            orderingStrategy,
            userDefinedGroupOrder,
            sortRemainingProperties,
            argumentIndex,
          );
          break;

        case 'globalStyle':
        case 'globalKeyframes':
          processStyleOrdering(
            ruleContext,
            node as TSESTree.CallExpression,
            orderingStrategy,
            userDefinedGroupOrder,
            sortRemainingProperties,
            1,
          );
          break;

        case 'recipe':
          processRecipeOrdering(
            ruleContext,
            node as TSESTree.CallExpression,
            orderingStrategy,
            userDefinedGroupOrder,
            sortRemainingProperties,
          );
          break;
      }
    },
  };
};

/**
 * Helper function to process style ordering for style-related functions
 */
const processStyleOrdering = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.CallExpression,
  orderingStrategy: OrderingStrategy,
  userDefinedGroupOrder?: string[],
  sortRemainingProperties?: SortRemainingProperties,
  argumentIndex: number = 0,
) => {
  if (node.arguments.length > argumentIndex) {
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
            enforceUserDefinedGroupOrderInStyleObject(
              ruleContext,
              node,
              userDefinedGroupOrder,
              sortRemainingProperties,
            );
        default:
          return enforceAlphabeticalCSSOrderInStyleObject;
      }
    })();

    processStyleNode(ruleContext, node.arguments[argumentIndex] as TSESTree.ObjectExpression, processProperty);
  }
};

/**
 * Helper function to process font face ordering
 */
const processFontFaceOrdering = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.CallExpression,
  argumentIndex: number,
) => {
  if (node.arguments.length > argumentIndex) {
    enforceFontFaceOrder(ruleContext, node.arguments[argumentIndex] as TSESTree.ObjectExpression);
  }
};

/**
 * Helper function to process recipe ordering
 */
const processRecipeOrdering = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.CallExpression,
  orderingStrategy: OrderingStrategy,
  userDefinedGroupOrder?: string[],
  sortRemainingProperties?: SortRemainingProperties,
) => {
  if (node.arguments.length > 0) {
    switch (orderingStrategy) {
      case 'alphabetical':
        enforceAlphabeticalCSSOrderInRecipe(node, ruleContext);
        break;
      case 'concentric':
        enforceConcentricCSSOrderInRecipe(ruleContext, node);
        break;
      case 'userDefinedGroupOrder':
        if (userDefinedGroupOrder) {
          enforceUserDefinedGroupOrderInRecipe(ruleContext, node, userDefinedGroupOrder, sortRemainingProperties);
        }
        break;
    }
  }
};
