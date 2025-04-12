import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { isEmptyObject } from '../shared-utils/empty-object-processor.js';
import { processConditionalExpression } from './conditional-processor.js';
import { processEmptyNestedStyles } from './empty-nested-style-processor.js';
import { reportEmptyDeclaration } from './fix-utils.js';
import { removeNodeWithComma } from './node-remover.js';
import { getStyleKeyName } from './property-utils.js';
import { processRecipeProperties } from './recipe-processor.js';
import { processStyleVariants } from './style-variants-processor.js';

/**
 * Checks if a style object is effectively empty (contains only empty objects).
 */
export const isEffectivelyEmptyStylesObject = (stylesObject: TSESTree.ObjectExpression): boolean => {
  // Empty object itself
  if (stylesObject.properties.length === 0) {
    return true;
  }

  // For recipe objects, we need special handling
  let hasBaseProperty = false;
  let isBaseEmpty = true;
  let hasVariantsProperty = false;
  let areAllVariantsEmpty = true;

  // First pass: identify recipe properties
  for (const property of stylesObject.properties) {
    if (property.type !== 'Property') {
      continue;
    }

    const propertyName = getStyleKeyName(property.key);
    if (!propertyName) {
      continue;
    }

    if (propertyName === 'base') {
      hasBaseProperty = true;
      if (property.value.type === 'ObjectExpression' && !isEmptyObject(property.value)) {
        isBaseEmpty = false;
      }
    } else if (propertyName === 'variants') {
      hasVariantsProperty = true;
      if (property.value.type === 'ObjectExpression' && !isEmptyObject(property.value)) {
        areAllVariantsEmpty = false;
      }
    }
  }

  // If this looks like a recipe object (has base or variants)
  if (hasBaseProperty || hasVariantsProperty) {
    // A recipe is effectively empty if both base and variants are empty
    return isBaseEmpty && areAllVariantsEmpty;
  }

  // / For non-recipe objects, check if all special properties (selectors, media queries, variants) are effectively empty
  function isSpecialProperty(propertyName: string | null): boolean {
    return (
      propertyName === 'selectors' || (propertyName && propertyName.startsWith('@')) || propertyName === 'variants'
    );
  }

  const specialProperties = stylesObject.properties.filter(
    (prop): prop is TSESTree.Property => prop.type === 'Property' && isSpecialProperty(getStyleKeyName(prop.key)),
  );

  const allSpecialPropertiesEmpty = specialProperties.every((property) => {
    if (property.value.type === 'ObjectExpression' && isEmptyObject(property.value)) {
      return true;
    }

    const propertyName = getStyleKeyName(property.key);
    // This defensive check handles malformed AST nodes that lack valid property names.
    // This is difficult to test because it's challenging to construct a valid AST
    // where getStyleKeyName would return a falsy value.
    if (!propertyName) {
      return false;
    }

    // For selectors, media queries and supports, check if all nested objects are empty
    if (
      (propertyName === 'selectors' || (propertyName && propertyName.startsWith('@'))) &&
      property.value.type === 'ObjectExpression'
    ) {
      // This handles the edge case of an empty properties array.
      // This code path is difficult to test in isolation because it requires
      // constructing a specific AST structure that bypasses earlier conditions.
      if (property.value.properties.length === 0) {
        return true;
      }

      return property.value.properties.every((nestedProperty) => {
        return (
          nestedProperty.type === 'Property' &&
          nestedProperty.value.type === 'ObjectExpression' &&
          isEmptyObject(nestedProperty.value)
        );
      });
    }

    // Default fallback for cases not handled by the conditions above.
    // This is difficult to test because it requires creating an AST structure
    // that doesn't trigger any of the preceding return statements.
    return false;
  });

  // If we have special properties and they're all empty, the style is effectively empty
  return specialProperties.length > 0 && allSpecialPropertiesEmpty;
};

/**
 * Creates ESLint rule visitors for detecting empty style blocks in vanilla-extract.
 * @param ruleContext The ESLint rule rule context.
 * @returns An object with visitor functions for the ESLint rule.
 */
export const createEmptyStyleVisitors = (ruleContext: Rule.RuleContext): Rule.RuleListener => {
  // Track reported nodes to prevent duplicate reports
  const reportedNodes = new Set<TSESTree.ObjectExpression>();

  return {
    CallExpression(node) {
      if (node.callee.type !== 'Identifier') {
        return;
      }

      // Target vanilla-extract style functions
      const styleApiFunctions = [
        'style',
        'styleVariants',
        'recipe',
        'globalStyle',
        'fontFace',
        'globalFontFace',
        'keyframes',
        'globalKeyframes',
      ];

      if (!styleApiFunctions.includes(node.callee.name) || node.arguments.length === 0) {
        return;
      }

      // Handle styleVariants specifically
      if (node.callee.name === 'styleVariants' && node.arguments[0]?.type === 'ObjectExpression') {
        processStyleVariants(ruleContext, node.arguments[0] as TSESTree.ObjectExpression, reportedNodes);

        // If the entire styleVariants object is empty after processing, remove the declaration
        if (isEmptyObject(node.arguments[0] as TSESTree.ObjectExpression)) {
          reportEmptyDeclaration(ruleContext, node.arguments[0] as TSESTree.Node, node as TSESTree.CallExpression);
        }
        return;
      }

      const defaultStyleArgumentIndex = 0;
      const globalFunctionNames = ['globalStyle', 'globalFontFace', 'globalKeyframes'];
      // Determine the style argument index based on the function name
      const styleArgumentIndex = globalFunctionNames.includes(node.callee.name) ? 1 : defaultStyleArgumentIndex;

      // For global functions, check if we have enough arguments
      if (styleArgumentIndex === 1 && node.arguments.length <= styleArgumentIndex) {
        return;
      }

      const styleArgument = node.arguments[styleArgumentIndex];

      // This defensive check prevents duplicate processing of nodes.
      // This code path's difficult to test because the ESLint visitor pattern
      // typically ensures each node is only visited once per rule execution.
      if (reportedNodes.has(styleArgument as TSESTree.ObjectExpression)) {
        return;
      }

      // Handle conditional expressions
      if (styleArgument?.type === 'ConditionalExpression') {
        processConditionalExpression(
          ruleContext,
          styleArgument as TSESTree.ConditionalExpression,
          reportedNodes,
          node as TSESTree.CallExpression,
        );
        return;
      }

      // Direct empty object case - remove the entire declaration
      if (styleArgument?.type === 'ObjectExpression' && isEmptyObject(styleArgument as TSESTree.ObjectExpression)) {
        reportedNodes.add(styleArgument as TSESTree.ObjectExpression);
        reportEmptyDeclaration(ruleContext, styleArgument as TSESTree.Node, node as TSESTree.CallExpression);
        return;
      }

      // For recipe - check if entire recipe is effectively empty
      if (node.callee.name === 'recipe' && styleArgument?.type === 'ObjectExpression') {
        if (isEffectivelyEmptyStylesObject(styleArgument as TSESTree.ObjectExpression)) {
          reportedNodes.add(styleArgument as TSESTree.ObjectExpression);
          reportEmptyDeclaration(ruleContext, styleArgument as TSESTree.Node, node as TSESTree.CallExpression);
          return;
        }

        // Process individual properties in recipe
        processRecipeProperties(ruleContext, styleArgument as TSESTree.ObjectExpression, reportedNodes);
      }

      // For style objects with nested empty objects
      if (styleArgument?.type === 'ObjectExpression') {
        // Check for spread elements
        styleArgument.properties.forEach((property) => {
          if (
            property.type === 'SpreadElement' &&
            property.argument.type === 'ObjectExpression' &&
            isEmptyObject(property.argument as TSESTree.ObjectExpression)
          ) {
            reportedNodes.add(property.argument as TSESTree.ObjectExpression);
            ruleContext.report({
              node: property.argument as Rule.Node,
              messageId: 'emptySpreadObject',
              fix(fixer) {
                return removeNodeWithComma(ruleContext, property as TSESTree.Node, fixer);
              },
            });
          }
        });

        // Process nested selectors and media queries
        processEmptyNestedStyles(ruleContext, styleArgument as TSESTree.ObjectExpression, reportedNodes);
      }
    },
  };
};
