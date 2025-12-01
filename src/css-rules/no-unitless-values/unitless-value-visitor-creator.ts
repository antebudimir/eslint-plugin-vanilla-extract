import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processUnitlessValueInStyleObject } from './unitless-value-processor.js';
import type { NoUnitlessValuesOptions } from './unitless-value-processor.js';

/**
 * Creates ESLint rule visitors for detecting unitless numeric values in style-related function calls.
 * Uses reference tracking to automatically detect vanilla-extract functions based on their import statements.
 *
 * @param context The ESLint rule context.
 * @param options Rule options including allowed property names.
 * @returns An object with visitor functions for the ESLint rule.
 */
export const createUnitlessValueVisitors = (
  context: Rule.RuleContext,
  options: NoUnitlessValuesOptions = {},
): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

  const processWithOptions = (ruleContext: Rule.RuleContext, node: TSESTree.ObjectExpression): void => {
    processUnitlessValueInStyleObject(ruleContext, node, options);
  };

  return {
    ...trackingVisitor,

    CallExpression(node) {
      if (node.callee.type !== AST_NODE_TYPES.Identifier) {
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
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            processWithOptions(context, node.arguments[0] as TSESTree.ObjectExpression);
          }
          break;

        case 'globalFontFace':
          if (node.arguments.length > 1 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            processWithOptions(context, node.arguments[1] as TSESTree.ObjectExpression);
          }
          break;

        case 'style':
        case 'styleVariants':
        case 'keyframes':
          if (node.arguments.length > 0) {
            processStyleNode(context, node.arguments[0] as TSESTree.ObjectExpression, processWithOptions);
          }
          break;

        case 'globalStyle':
        case 'globalKeyframes':
          if (node.arguments.length >= 2) {
            processStyleNode(context, node.arguments[1] as TSESTree.ObjectExpression, processWithOptions);
          }
          break;

        case 'recipe':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            processRecipeProperties(context, node.arguments[0] as TSESTree.ObjectExpression, processWithOptions);
          }
          break;
      }
    },
  };
};
