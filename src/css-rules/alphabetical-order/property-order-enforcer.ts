import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { comparePropertiesAlphabetically } from '../shared-utils/alphabetical-property-comparator.js';
import { generateFixesForCSSOrder } from '../shared-utils/css-order-fixer.js';
import { getPropertyNameForSorting } from '../shared-utils/property-separator.js';

/**
 * Reports an ordering issue to ESLint and generates fixes.
 * @param ruleContext The ESLint rule context.
 * @param currentProperty The current property in the order.
 * @param nextProperty The next property that is out of order.
 * @param regularProperties The full list of regular properties to be reordered.
 */
const reportOrderingIssue = (
  ruleContext: Rule.RuleContext,
  currentProperty: TSESTree.Property,
  nextProperty: TSESTree.Property,
  regularProperties: TSESTree.Property[],
): void => {
  ruleContext.report({
    node: nextProperty as Rule.Node,
    messageId: 'alphabeticalOrder',
    data: {
      nextProperty: getPropertyNameForSorting(nextProperty),
      currentProperty: getPropertyNameForSorting(currentProperty),
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
};

/**
 * Enforces alphabetical ordering of CSS properties.
 * @param ruleContext The ESLint rule context.
 * @param regularProperties An array of regular CSS properties to be checked.
 *
 * This function does the following:
 * 1. Checks if there are enough properties to compare (more than 1).
 * 2. Creates pairs of consecutive properties for comparison.
 * 3. Finds the first pair that violates alphabetical order.
 * 4. If a violation is found, reports the issue and generates fixes.
 */
export const enforceAlphabeticalCSSOrder = (
  ruleContext: Rule.RuleContext,
  regularProperties: TSESTree.Property[],
): void => {
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
    reportOrderingIssue(ruleContext, violatingPair.currentProperty, violatingPair.nextProperty, regularProperties);
  }
};
