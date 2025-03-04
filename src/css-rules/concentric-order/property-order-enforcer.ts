import type { Rule } from 'eslint';
import { generateFixesForCSSOrder } from '../shared-utils/css-order-fixer.js';
import type { CSSPropertyInfo } from './types.js';

/**
 * Reports a violation of the concentric CSS ordering rule and generates fixes.
 *
 * @param ruleContext The ESLint rule context used for reporting and fixing.
 * @param currentProperty The current property in the order.
 * @param nextProperty The next property that is out of order.
 * @param cssPropertyInfoList The full list of CSS properties to be reordered.
 */
const reportOrderingIssue = (
  ruleContext: Rule.RuleContext,
  currentProperty: CSSPropertyInfo,
  nextProperty: CSSPropertyInfo,
  cssPropertyInfoList: CSSPropertyInfo[],
): void => {
  ruleContext.report({
    node: nextProperty.node as Rule.Node,
    messageId: 'incorrectOrder',
    data: {
      next: nextProperty.name,
      current: currentProperty.name,
    },
    fix: (fixer) =>
      generateFixesForCSSOrder(
        fixer,
        ruleContext,
        cssPropertyInfoList,
        compareProperties,
        (propertyInfo) => propertyInfo.node as Rule.Node,
      ),
  });
};

/**
 * Compares two CSS properties based on their priority and position within their group.
 *
 * @param firstProperty The first property to compare.
 * @param secondProperty The second property to compare.
 * @returns A number indicating the relative order of the properties (-1, 0, or 1).
 */
const compareProperties = (firstProperty: CSSPropertyInfo, secondProperty: CSSPropertyInfo): number => {
  if (firstProperty.priority !== secondProperty.priority) {
    return firstProperty.priority - secondProperty.priority;
  }
  return firstProperty.positionInGroup - secondProperty.positionInGroup;
};

/**
 * Enforces concentric ordering of CSS properties.
 *
 * This function checks the order of CSS properties to ensure they follow a concentric order
 * based on their priority and position within their group. It performs the following steps:
 * 1. Validates if there are enough properties to compare.
 * 2. Creates pairs of consecutive properties for comparison.
 * 3. Identifies the first pair that violates the concentric order.
 * 4. If a violation is detected, reports the issue and suggests fixes using ESLint.
 *
 * @param ruleContext - The ESLint rule context used for reporting and fixing.
 * @param cssPropertyInfoList - An array of CSS property information objects to be checked.
 */
export const enforceConcentricCSSOrder = (
  ruleContext: Rule.RuleContext,
  cssPropertyInfoList: CSSPropertyInfo[],
): void => {
  if (cssPropertyInfoList.length <= 1) {
    return;
  }

  // Create pairs of consecutive properties
  const propertyPairs = cssPropertyInfoList.slice(0, -1).map((currentProperty, index) => ({
    currentProperty,
    nextProperty: cssPropertyInfoList[index + 1] as CSSPropertyInfo,
  }));

  const violatingPair = propertyPairs.find(
    ({ currentProperty, nextProperty }) => compareProperties(currentProperty, nextProperty) > 0,
  );

  if (violatingPair) {
    reportOrderingIssue(ruleContext, violatingPair.currentProperty, violatingPair.nextProperty, cssPropertyInfoList);
  }
};
