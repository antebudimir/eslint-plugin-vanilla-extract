import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processUnknownUnitInStyleObject } from './unknown-unit-processor.js';

/**
 * Creates ESLint rule visitors for detecting and processing unknown CSS units
 * in style-related function calls.
 */
export const createUnknownUnitVisitors = (context: Rule.RuleContext): Rule.RuleListener => {
  return {
    CallExpression(node) {
      if (node.callee.type !== AST_NODE_TYPES.Identifier) {
        return;
      }

      if (['fontFace', 'globalFontFace'].includes(node.callee.name)) {
        const argumentIndex = node.callee.name === 'fontFace' ? 0 : 1;
        if (
          node.arguments.length > argumentIndex &&
          node.arguments[argumentIndex]?.type === AST_NODE_TYPES.ObjectExpression
        ) {
          processUnknownUnitInStyleObject(context, node.arguments[argumentIndex] as TSESTree.ObjectExpression);
        }
        return;
      }

      if (['keyframes', 'style', 'styleVariants'].includes(node.callee.name)) {
        if (node.arguments.length > 0) {
          processStyleNode(context, node.arguments[0] as TSESTree.ObjectExpression, processUnknownUnitInStyleObject);
        }
      }

      if (['globalKeyframes', 'globalStyle'].includes(node.callee.name) && node.arguments.length >= 2) {
        processStyleNode(context, node.arguments[1] as TSESTree.ObjectExpression, processUnknownUnitInStyleObject);
      }

      if (
        node.callee.name === 'recipe' &&
        node.arguments.length > 0 &&
        node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression
      ) {
        processRecipeProperties(
          context,
          node.arguments[0] as TSESTree.ObjectExpression,
          processUnknownUnitInStyleObject,
        );
      }
    },
  };
};
