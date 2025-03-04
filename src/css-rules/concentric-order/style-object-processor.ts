import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createCSSPropertyPriorityMap } from '../shared-utils/css-property-priority-map.js';
import { isSelectorsObject, processNestedSelectors } from '../shared-utils/nested-selectors-processor.js';
import { getPropertyName, separateProperties } from '../shared-utils/property-separator.js';
import { enforceConcentricCSSOrder } from './property-order-enforcer.js';
import type { CSSPropertyInfo } from './types.js';

const cssPropertyPriorityMap = createCSSPropertyPriorityMap();

/**
 * Builds a list of CSS properties with their priority information in the concentric order of their groups.
 *
 * @param regularStyleProperties An array of regular style properties.
 * @returns An array of CSSPropertyInfo objects containing name, node, priority, and position information.
 */
const buildCSSPropertyInfoList = (regularStyleProperties: TSESTree.Property[]): CSSPropertyInfo[] => {
  return regularStyleProperties.map((styleProperty) => {
    const propertyName = getPropertyName(styleProperty);
    const propertyInfo = cssPropertyPriorityMap.get(propertyName);

    return {
      name: propertyName,
      node: styleProperty,
      priority: propertyInfo?.groupIndex ?? Number.MAX_SAFE_INTEGER,
      positionInGroup: propertyInfo?.positionInGroup ?? Number.MAX_SAFE_INTEGER,
    };
  });
};

/**
 * Enforces concentric ordering of CSS properties within a style object.
 *
 * This function processes the given style object to ensure that CSS properties
 * follow a concentric order based on predefined priority groups. It handles
 * different types of style objects by:
 * 1. Validating that the input is an ObjectExpression.
 * 2. Processing 'selectors' objects separately and recursively applying the
 *    concentric order enforcement.
 * 3. Separating regular properties and building a list of CSSPropertyInfo
 *    objects with priority details.
 * 4. Enforcing concentric order on the properties using their priority
 *    information.
 * 5. Recursively processing nested selectors and style objects.
 *
 * @param ruleContext - The ESLint rule context for reporting and fixing issues.
 * @param styleObject - The object expression representing the style object to be processed.
 */
export const enforceConcentricCSSOrderInStyleObject = (
  ruleContext: Rule.RuleContext,
  styleObject: TSESTree.ObjectExpression,
): void => {
  if (!styleObject || styleObject.type !== AST_NODE_TYPES.ObjectExpression) {
    return;
  }

  if (isSelectorsObject(styleObject)) {
    styleObject.properties.forEach((property) => {
      if (property.type === AST_NODE_TYPES.Property && property.value.type === AST_NODE_TYPES.ObjectExpression) {
        enforceConcentricCSSOrderInStyleObject(ruleContext, property.value);
      }
    });
    return;
  }

  const { regularProperties } = separateProperties(styleObject.properties);
  const cssPropertyInfoList = buildCSSPropertyInfoList(regularProperties);

  enforceConcentricCSSOrder(ruleContext, cssPropertyInfoList);

  processNestedSelectors(ruleContext, styleObject, enforceConcentricCSSOrderInStyleObject);
};
