import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processNoPxUnitInStyleObject } from './px-unit-processor.js';

/**
 * Creates ESLint rule visitors for detecting and reporting 'px' units in vanilla-extract style objects.
 * - Tracks calls to vanilla-extract APIs (style, recipe, keyframes, globalStyle, fontFace, etc.).
 * This visitor only orchestrates traversal; the actual reporting and suggestion logic lives in the processor.
 * - Respects the `allow` option (camelCase or kebab-case) by passing it as a Set to the processor.
 *
 * @param context ESLint rule context used to read options and report diagnostics.
 * @returns Rule listener that inspects vanilla-extract call expressions and processes style objects.
 */
export const createNoPxUnitVisitors = (context: Rule.RuleContext): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);

  const options = (context.options?.[0] as { allow?: string[] } | undefined) || {};
  const allowSet = new Set((options.allow ?? []).map((string) => string));

  const process = (context: Rule.RuleContext, object: TSESTree.ObjectExpression) =>
    processNoPxUnitInStyleObject(context, object, allowSet);

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
            processStyleNode(context, node.arguments[0] as TSESTree.Node, (context, object) =>
              process(context, object),
            );
          }
          break;
        case 'globalStyle':
        case 'globalKeyframes':
          if (node.arguments.length >= 2) {
            processStyleNode(context, node.arguments[1] as TSESTree.Node, (context, object) =>
              process(context, object),
            );
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
