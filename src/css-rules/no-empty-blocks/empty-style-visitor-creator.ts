import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { isCallExpressionWithEmptyObject, isEmptyObject } from '../shared-utils/empty-object-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processConditionalExpression } from './conditional-processor.js';
import { processEmptyNestedStyles } from './empty-nested-style-processor.js';
import { reportEmptyDeclaration } from './fix-utils.js';
import { getStyleKeyName } from './property-utils.js';
import { processRecipeProperties } from './recipe-processor.js';
import { processStyleVariants } from './style-variants-processor.js';

/**
 * Checks if a nested object (selectors, media, supports) contains only empty objects.
 */
const isNestedObjectEmpty = (obj: TSESTree.ObjectExpression): boolean => {
  if (obj.properties.length === 0) {
    return true;
  }

  return obj.properties.every((property) => {
    if (property.type !== 'Property') {
      return true; // Skip non-property elements
    }

    if (property.value.type === 'ObjectExpression') {
      return isEmptyObject(property.value);
    }

    return false; // Non-object values mean it's not empty
  });
};

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

      // CallExpression (e.g., sprinkles(), style()) is considered non-empty unless it has an empty object argument, e.g. sprinkles({})
      if (property.value.type === 'CallExpression') {
        if (!isCallExpressionWithEmptyObject(property.value)) {
          isBaseEmpty = false;
        }
      } else if (property.value.type === 'ObjectExpression' && !isEmptyObject(property.value)) {
        isBaseEmpty = false;
      }
    } else if (propertyName === 'variants') {
      hasVariantsProperty = true;
      if (property.value.type === 'ObjectExpression' && !isEmptyObject(property.value)) {
        areAllVariantsEmpty = false;
      }
    }
  }

  // If this looks like a recipe (has base or variants), check recipe-specific emptiness
  if (hasBaseProperty || hasVariantsProperty) {
    return isBaseEmpty && areAllVariantsEmpty;
  }

  // For regular style objects, check if all properties are effectively empty
  return stylesObject.properties.every((property) => {
    if (property.type !== 'Property') {
      return true; // Skip spread elements for emptiness check
    }

    const propertyName = getStyleKeyName(property.key);
    if (!propertyName) {
      return true; // Skip properties we can't identify
    }

    // Handle special nested objects like selectors, media queries, supports
    if (propertyName === 'selectors' || propertyName.startsWith('@')) {
      if (property.value.type === 'ObjectExpression') {
        return isNestedObjectEmpty(property.value);
      }
      return false; // Non-object values in these properties
    }

    // Handle regular CSS properties
    if (property.value.type === 'ObjectExpression') {
      return isEmptyObject(property.value);
    }

    return false; // Non-empty property (literal values, etc.)
  });
};

/**
 * Creates ESLint rule visitors for detecting empty style blocks using reference tracking.
 * This automatically detects vanilla-extract functions based on their import statements.
 */
export const createEmptyStyleVisitors = (ruleContext: Rule.RuleContext): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);
  const reportedNodes = new Set<TSESTree.ObjectExpression>();

  return {
    // Include the reference tracking visitors
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
      const wrapperInfo = tracker.getWrapperInfo(functionName);

      if (!originalName || node.arguments.length === 0) {
        return;
      }

      // Handle styleVariants specifically
      if (originalName === 'styleVariants') {
        // For wrapper functions, use the correct parameter index
        const styleArgumentIndex = wrapperInfo?.parameterMapping ?? 0;
        if (node.arguments.length <= styleArgumentIndex) {
          return;
        }

        if (node.arguments[styleArgumentIndex]?.type === 'ObjectExpression') {
          processStyleVariants(
            ruleContext,
            node.arguments[styleArgumentIndex] as TSESTree.ObjectExpression,
            reportedNodes,
          );

          // If the entire styleVariants object is empty after processing, remove the declaration
          if (isEmptyObject(node.arguments[styleArgumentIndex] as TSESTree.ObjectExpression)) {
            reportEmptyDeclaration(
              ruleContext,
              node.arguments[styleArgumentIndex] as TSESTree.Node,
              node as TSESTree.CallExpression,
            );
          }
        }
        return;
      }

      // Determine the style argument index based on the original function name and wrapper info
      let styleArgumentIndex: number;
      if (wrapperInfo) {
        // Use wrapper function parameter mapping
        styleArgumentIndex = wrapperInfo.parameterMapping;
      } else {
        // Use original logic for direct vanilla-extract calls
        styleArgumentIndex =
          originalName === 'globalStyle' || originalName === 'globalKeyframes' || originalName === 'globalFontFace'
            ? 1
            : 0;
      }

      // For global functions, check if we have enough arguments
      if (
        (originalName === 'globalStyle' || originalName === 'globalKeyframes' || originalName === 'globalFontFace') &&
        node.arguments.length <= styleArgumentIndex
      ) {
        return;
      }

      // For wrapper functions, ensure we have enough arguments
      if (wrapperInfo && node.arguments.length <= styleArgumentIndex) {
        return;
      }

      const styleArgument = node.arguments[styleArgumentIndex];

      // This defensive check prevents duplicate processing of nodes.
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
      if (originalName === 'recipe') {
        if (styleArgument?.type === 'ObjectExpression') {
          if (isEffectivelyEmptyStylesObject(styleArgument as TSESTree.ObjectExpression)) {
            reportedNodes.add(styleArgument as TSESTree.ObjectExpression);
            reportEmptyDeclaration(ruleContext, styleArgument as TSESTree.Node, node as TSESTree.CallExpression);
            return;
          }

          // Process individual properties in recipe
          processRecipeProperties(ruleContext, styleArgument as TSESTree.ObjectExpression, reportedNodes);
        }
        return;
      }

      // Handle fontFace functions - both fontFace and globalFontFace need empty object checks
      if (originalName === 'fontFace' || originalName === 'globalFontFace') {
        // Direct empty object case - remove the entire declaration
        if (styleArgument?.type === 'ObjectExpression' && isEmptyObject(styleArgument as TSESTree.ObjectExpression)) {
          reportedNodes.add(styleArgument as TSESTree.ObjectExpression);
          reportEmptyDeclaration(ruleContext, styleArgument as TSESTree.Node, node as TSESTree.CallExpression);
          return;
        }
        return;
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
                if (property.range) {
                  return fixer.removeRange([property.range[0], property.range[1]]);
                }
                return null;
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
