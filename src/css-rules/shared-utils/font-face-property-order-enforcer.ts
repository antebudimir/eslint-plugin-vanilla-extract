import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { generateFixesForCSSOrder } from '../shared-utils/css-order-fixer.js';
import { getPropertyName, separateProperties } from '../shared-utils/property-separator.js';
import { comparePropertiesAlphabetically } from './alphabetical-property-comparator.js';

/**
 * Processes a font face declaration to enforce property ordering:
 * 'src' first, then other properties alphabetically.
 *
 * @param ruleContext The ESLint rule context for reporting and fixing issues.
 * @param fontFaceObject The object expression representing the font face declaration.
 */
export const enforceFontFaceOrder = (
  ruleContext: Rule.RuleContext,
  fontFaceObject: TSESTree.ObjectExpression,
): void => {
  if (!fontFaceObject || fontFaceObject.type !== AST_NODE_TYPES.ObjectExpression) {
    return;
  }

  const { regularProperties } = separateProperties(fontFaceObject.properties);

  if (regularProperties.length <= 1) {
    return;
  }

  // Create pairs of consecutive properties
  const propertyPairs = regularProperties.slice(0, -1).map((currentProperty, index) => ({
    currentProperty,
    nextProperty: regularProperties[index + 1] as TSESTree.Property,
  }));

  const violatingPair = propertyPairs.find(
    ({ currentProperty, nextProperty }) => comparePropertiesAlphabetically(currentProperty, nextProperty) > 0,
  );

  if (violatingPair) {
    const nextPropertyName = getPropertyName(violatingPair.nextProperty);
    const currentPropertyName = getPropertyName(violatingPair.currentProperty);

    ruleContext.report({
      node: violatingPair.nextProperty as Rule.Node,
      messageId: 'fontFaceOrder',
      data: {
        nextProperty: nextPropertyName,
        currentProperty: currentPropertyName,
      },
      fix: (fixer) =>
        generateFixesForCSSOrder(
          fixer,
          ruleContext,
          regularProperties,
          comparePropertiesAlphabetically,
          (property) => property as Rule.Node,
        ),
    });
  }
};
