import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processUnknownUnitInStyleObject } from './unknown-unit-processor.js';

/**
 * Creates ESLint rule visitors for detecting and processing unknown CSS units
 * in style-related function calls using reference tracking.
 * This automatically detects vanilla-extract functions based on their import statements.
 */
export const createUnknownUnitVisitors = (context: Rule.RuleContext): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

  return {
    // Include the import/variable tracking visitors
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
            processUnknownUnitInStyleObject(context, node.arguments[0] as TSESTree.ObjectExpression);
          }
          break;

        case 'globalFontFace':
          if (node.arguments.length > 1 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            processUnknownUnitInStyleObject(context, node.arguments[1] as TSESTree.ObjectExpression);
          }
          break;

        case 'style':
        case 'styleVariants':
        case 'keyframes':
          if (node.arguments.length > 0) {
            processStyleNode(context, node.arguments[0] as TSESTree.ObjectExpression, processUnknownUnitInStyleObject);
          }
          break;

        case 'globalStyle':
        case 'globalKeyframes':
          if (node.arguments.length >= 2) {
            processStyleNode(context, node.arguments[1] as TSESTree.ObjectExpression, processUnknownUnitInStyleObject);
          }
          break;

        case 'recipe':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            processRecipeProperties(
              context,
              node.arguments[0] as TSESTree.ObjectExpression,
              processUnknownUnitInStyleObject,
            );
          }
          break;
      }
    },
  };
};
