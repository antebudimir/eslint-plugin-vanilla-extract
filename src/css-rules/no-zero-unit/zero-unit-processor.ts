import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';

const ZERO_VALUE_WITH_UNIT_REGEX = /^-?0(px|em|rem|%|vh|vw|vmin|vmax|ex|ch|cm|mm|in|pt|pc|Q|fr)$/;

/**
 * Recursively processes a style object, reporting and fixing instances of zero values with units.
 *
 * @param ruleContext The ESLint rule context.
 * @param node The ObjectExpression node representing the style object to be processed.
 */
export const processZeroUnitInStyleObject = (ruleContext: Rule.RuleContext, node: TSESTree.ObjectExpression): void => {
  node.properties.forEach((property) => {
    if (property.type !== 'Property') {
      return;
    }

    // Process direct string literal values
    if (
      property.value.type === 'Literal' &&
      typeof property.value.value === 'string' &&
      ZERO_VALUE_WITH_UNIT_REGEX.test(property.value.value)
    ) {
      ruleContext.report({
        node: property.value,
        messageId: 'noZeroUnit',
        fix: (fixer) => fixer.replaceText(property.value, "'0'"),
      });
    }

    // Process nested objects (selectors, media queries, etc.)
    if (property.value.type === 'ObjectExpression') {
      processZeroUnitInStyleObject(ruleContext, property.value);
    }
  });
};
