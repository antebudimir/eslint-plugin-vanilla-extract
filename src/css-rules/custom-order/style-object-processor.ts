import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { concentricGroups } from '../concentric-order/concentric-groups.js';
import { createCSSPropertyPriorityMap } from '../shared-utils/css-property-priority-map.js';
import { isSelectorsObject, processNestedSelectors } from '../shared-utils/nested-selectors-processor.js';
import { getPropertyName, separateProperties } from '../shared-utils/property-separator.js';
import { enforceCustomGroupOrder } from './property-order-enforcer.js';
import type { CSSPropertyInfo } from '../concentric-order/types.js';

/**
 * Enforces a custom ordering of CSS properties based on user-defined groups in a given style object.
 *
 * @param context The ESLint rule context for reporting and fixing issues.
 * @param styleObject The ObjectExpression node representing the style object to be processed.
 * @param userDefinedGroups An array of property groups in the desired order.
 * @param sortRemainingPropertiesMethod Strategy for sorting properties not in user-defined groups ('alphabetical' or 'concentric'). Defaults to 'concentric'.
 *
 * This function:
 * 1. Validates the input styleObject.
 * 2. Handles 'selectors' objects separately, processing their nested style objects.
 * 3. Creates a priority map based on user-defined groups.
 * 4. Processes regular properties, creating a list of CSSPropertyInfo objects.
 * 5. Enforces custom group ordering on the properties.
 * 6. Recursively processes nested selectors and style objects.
 */
export const enforceUserDefinedGroupOrderInStyleObject = (
  ruleContext: Rule.RuleContext,
  styleObject: TSESTree.ObjectExpression,
  userDefinedGroups: string[],
  sortRemainingPropertiesMethod: 'alphabetical' | 'concentric' = 'concentric',
): void => {
  if (!styleObject || styleObject.type !== AST_NODE_TYPES.ObjectExpression) {
    return;
  }

  if (isSelectorsObject(styleObject)) {
    styleObject.properties.forEach((property) => {
      if (property.type === AST_NODE_TYPES.Property && property.value.type === AST_NODE_TYPES.ObjectExpression) {
        enforceUserDefinedGroupOrderInStyleObject(
          ruleContext,
          property.value,
          userDefinedGroups,
          sortRemainingPropertiesMethod,
        );
      }
    });
    return;
  }

  const cssPropertyPriorityMap = createCSSPropertyPriorityMap(userDefinedGroups);

  const { regularProperties } = separateProperties(styleObject.properties);
  const cssPropertyInfoList: CSSPropertyInfo[] = regularProperties.map((property) => {
    const propertyName = getPropertyName(property);
    const propertyInfo = cssPropertyPriorityMap.get(propertyName);
    const group =
      userDefinedGroups.find((groupName) => concentricGroups[groupName]?.includes(propertyName)) || 'remaining';

    return {
      name: propertyName,
      node: property,
      priority: propertyInfo?.groupIndex ?? Number.MAX_SAFE_INTEGER,
      positionInGroup: propertyInfo?.positionInGroup ?? Number.MAX_SAFE_INTEGER,
      group,
      inUserGroup: propertyInfo?.inUserGroup ?? false,
    };
  });

  enforceCustomGroupOrder(ruleContext, cssPropertyInfoList, userDefinedGroups, sortRemainingPropertiesMethod);

  processNestedSelectors(ruleContext, styleObject, (nestedContext, nestedNode) =>
    enforceUserDefinedGroupOrderInStyleObject(
      nestedContext,
      nestedNode,
      userDefinedGroups,
      sortRemainingPropertiesMethod,
    ),
  );
};
