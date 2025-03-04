import type { Rule, SourceCode } from 'eslint';

/**
 * Generates ESLint fixes for CSS property ordering violations.
 * @param eslintFixer The ESLint fixer instance used to create fix objects.
 * @param ruleContext The ESLint rule context, providing access to the source code.
 * @param cssProperties The list of CSS properties to sort (can be TSESTree.Property[] or CSSPropertyInfo[]).
 * @param compareProperties A comparison function that defines the sorting logic for the properties.
 * @param extractNode A function that extracts the AST node from each property (used for text replacement).
 * @returns An array of ESLint Fix objects to correct the property order.
 *
 * This function performs the following steps:
 * 1. Sorts the input properties using the provided comparison function.
 * 2. Maps the original and sorted properties to their text ranges.
 * 3. Creates fix objects for properties whose positions have changed after sorting.
 * 4. Returns an array of fixes that, when applied, will reorder the properties correctly.
 */
export const generateFixesForCSSOrder = <T>(
  eslintFixer: Rule.RuleFixer,
  ruleContext: Rule.RuleContext,
  cssProperties: T[],
  compareProperties: (firstProperty: T, secondProperty: T) => number,
  extractNode: (property: T) => Rule.Node,
): Rule.Fix[] => {
  const sourceCode: SourceCode = ruleContext.sourceCode;

  // Sort properties using the provided comparison function
  const sortedProperties = [...cssProperties].sort(compareProperties);

  // Map each original property to its text range
  const originalPropertyRanges = cssProperties.map((property) => ({
    property,
    range: extractNode(property).range,
  }));

  // Map sorted properties back to their original range information
  const sortedPropertyRanges = sortedProperties.map((property) =>
    originalPropertyRanges.find((rangeInfo) => rangeInfo.property === property),
  );

  // Generate fixes for properties that have changed position
  return originalPropertyRanges
    .map((originalRangeInfo, index) => {
      const sortedRangeInfo = sortedPropertyRanges[index];

      // Create a fix only if the property's position has changed
      if (originalRangeInfo && sortedRangeInfo && originalRangeInfo !== sortedRangeInfo) {
        const sortedPropertyText = sourceCode.getText(extractNode(sortedRangeInfo.property));
        return eslintFixer.replaceText(extractNode(originalRangeInfo.property), sortedPropertyText);
      }

      return null;
    })
    .filter((fix): fix is Rule.Fix => fix !== null);
};
