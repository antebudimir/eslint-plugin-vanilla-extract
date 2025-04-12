import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { processZeroUnitInStyleObject } from './zero-unit-processor.js';

/**
 * Creates ESLint rule visitors for detecting and processing zero values with units in style-related function calls.
 *
 * @param context The ESLint rule context.
 * @returns An object with visitor functions for the ESLint rule.
 *
 * This function sets up visitors for the following cases:
 * 1. The `fontFace` and `globalFontFace` functions, processing their object arguments.
 * 2. Style-related functions: `keyframes`, `style`, `styleVariants`, processing their style objects.
 * 3. The `globalKeyframes` and `globalStyle` functions, processing the second argument as style objects.
 * 4. The `recipe` function, processing the first argument as the recipe object.
 */
export const createZeroUnitVisitors = (context: Rule.RuleContext): Rule.RuleListener => {
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
          processZeroUnitInStyleObject(context, node.arguments[argumentIndex] as TSESTree.ObjectExpression);
        }
        return;
      }

      if (['keyframes', 'style', 'styleVariants'].includes(node.callee.name)) {
        if (node.arguments.length > 0) {
          processStyleNode(context, node.arguments[0] as TSESTree.ObjectExpression, processZeroUnitInStyleObject);
        }
      }

      if (['globalKeyframes', 'globalStyle'].includes(node.callee.name) && node.arguments.length >= 2) {
        processStyleNode(context, node.arguments[1] as TSESTree.ObjectExpression, processZeroUnitInStyleObject);
      }

      if (
        node.callee.name === 'recipe' &&
        node.arguments.length > 0 &&
        node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression
      ) {
        processRecipeProperties(context, node.arguments[0] as TSESTree.ObjectExpression, processZeroUnitInStyleObject);
      }
    },
  };
};
