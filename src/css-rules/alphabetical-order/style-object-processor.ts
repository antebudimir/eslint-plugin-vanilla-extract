import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { isSelectorsObject, processNestedSelectors } from '../shared-utils/nested-selectors-processor.js';
import { separateProperties } from '../shared-utils/property-separator.js';
import { enforceAlphabeticalCSSOrder } from './property-order-enforcer.js';

/**
 * Processes a style object to enforce alphabetical ordering of CSS properties.
 *
 * This function handles different types of style objects:
 * 1. If the object is invalid or not an ObjectExpression, it returns immediately.
 * 2. For 'selectors' objects, it processes nested selectors recursively.
 * 3. For regular style objects, it separates and enforces alphabetical order on properties.
 * 4. It always processes nested objects recursively, regardless of type.
 *
 * @param ruleContext - The ESLint rule context for reporting and fixing issues.
 * @param styleObject - The object expression representing the style object to be processed.
 */
export const enforceAlphabeticalCSSOrderInStyleObject = (
  ruleContext: Rule.RuleContext,
  styleObject: TSESTree.ObjectExpression,
): void => {
  if (styleObject?.type === AST_NODE_TYPES.ObjectExpression) {
    if (isSelectorsObject(styleObject)) {
      processNestedSelectors(ruleContext, styleObject, enforceAlphabeticalCSSOrderInStyleObject);
      return;
    }

    const { regularProperties } = separateProperties(styleObject.properties);

    enforceAlphabeticalCSSOrder(ruleContext, regularProperties);

    processNestedSelectors(ruleContext, styleObject, enforceAlphabeticalCSSOrderInStyleObject);
  }
};
