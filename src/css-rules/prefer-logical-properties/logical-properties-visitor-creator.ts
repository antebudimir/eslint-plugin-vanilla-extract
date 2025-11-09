import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processLogicalPropertiesInStyleObject, type LogicalPropertiesOptions } from './logical-properties-processor.js';

/**
 * Creates ESLint rule visitors for detecting and reporting physical CSS properties
 * in vanilla-extract style objects.
 *
 * - Tracks calls to vanilla-extract APIs (style, recipe, keyframes, globalStyle, fontFace, etc.)
 * - Detects physical property names and directional values
 * - Respects the `allow` option for allowlisting properties
 * - Provides auto-fixes for unambiguous conversions
 *
 * @param context ESLint rule context used to read options and report diagnostics
 * @returns Rule listener that inspects vanilla-extract call expressions and processes style objects
 */
export const createLogicalPropertiesVisitors = (context: Rule.RuleContext): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

  const options = (context.options?.[0] as LogicalPropertiesOptions | undefined) || {};
  const allowSet = new Set((options.allow ?? []).map((prop) => prop));

  const process = (context: Rule.RuleContext, object: TSESTree.ObjectExpression) =>
    processLogicalPropertiesInStyleObject(context, object, allowSet);

  return {
    ...trackingVisitor,

    CallExpression(node) {
      if (node.callee.type !== AST_NODE_TYPES.Identifier) return;

      const functionName = node.callee.name;
      if (!tracker.isTrackedFunction(functionName)) return;

      const originalName = tracker.getOriginalName(functionName);
      if (!originalName) return;

      switch (originalName) {
        case 'fontFace':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            process(context, node.arguments[0] as TSESTree.ObjectExpression);
          }
          break;
        case 'globalFontFace':
          if (node.arguments.length > 1 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            process(context, node.arguments[1] as TSESTree.ObjectExpression);
          }
          break;
        case 'style':
        case 'styleVariants':
        case 'keyframes':
          if (node.arguments.length > 0) {
            processStyleNode(context, node.arguments[0] as TSESTree.Node, (context, object) => process(context, object));
          }
          break;
        case 'globalStyle':
        case 'globalKeyframes':
          if (node.arguments.length >= 2) {
            processStyleNode(context, node.arguments[1] as TSESTree.Node, (context, object) => process(context, object));
          }
          break;
        case 'recipe':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            processRecipeProperties(context, node.arguments[0] as TSESTree.ObjectExpression, (context, object) =>
              process(context, object),
            );
          }
          break;
      }
    },
  };
};
