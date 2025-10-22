import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processTrailingZeroInStyleObject } from './trailing-zero-processor.js';

/**
 * Creates ESLint rule visitors for detecting and processing trailing zeros in numeric CSS values.
 * Uses reference tracking to automatically detect vanilla-extract functions based on their import statements.
 *
 * @param context The ESLint rule context.
 * @returns An object with visitor functions for the ESLint rule.
 */
export const createTrailingZeroVisitors = (context: Rule.RuleContext): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

  return {
    // Include the reference tracking visitors
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
            processTrailingZeroInStyleObject(context, node.arguments[0] as TSESTree.ObjectExpression);
          }
          break;

        case 'globalFontFace':
          if (node.arguments.length > 1 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            processTrailingZeroInStyleObject(context, node.arguments[1] as TSESTree.ObjectExpression);
          }
          break;

        case 'style':
          if (node.arguments.length > 0) {
            processStyleNode(context, node.arguments[0] as TSESTree.ObjectExpression, processTrailingZeroInStyleObject);
          }
          break;

        case 'styleVariants':
        case 'keyframes':
          // For styleVariants and keyframes, the argument is an object where each property value is a style object
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            const variantsObject = node.arguments[0] as TSESTree.ObjectExpression;
            variantsObject.properties.forEach((property) => {
              if (property.type === 'Property' && property.value.type === 'ObjectExpression') {
                processTrailingZeroInStyleObject(context, property.value);
              }
            });
          }
          break;

        case 'globalStyle':
          if (node.arguments.length >= 2) {
            processStyleNode(context, node.arguments[1] as TSESTree.ObjectExpression, processTrailingZeroInStyleObject);
          }
          break;

        case 'globalKeyframes':
          // For globalKeyframes, the second argument is an object where each property value is a style object
          if (node.arguments.length >= 2 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            const keyframesObject = node.arguments[1] as TSESTree.ObjectExpression;
            keyframesObject.properties.forEach((property) => {
              if (property.type === 'Property' && property.value.type === 'ObjectExpression') {
                processTrailingZeroInStyleObject(context, property.value);
              }
            });
          }
          break;

        case 'recipe':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            processRecipeProperties(
              context,
              node.arguments[0] as TSESTree.ObjectExpression,
              processTrailingZeroInStyleObject,
            );
          }
          break;
      }
    },
  };
};
