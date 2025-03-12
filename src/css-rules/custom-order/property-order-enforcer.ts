import type { Rule } from 'eslint';
import { generateFixesForCSSOrder } from '../shared-utils/css-order-fixer.js';
import { createCSSPropertyPriorityMap } from '../shared-utils/css-property-priority-map.js';
import type { CSSPropertyInfo } from '../concentric-order/types.js';

/**
 * Enforces a custom ordering of CSS properties based on user-defined groups.
 *
 * @param ruleContext The ESLint rule context used for reporting and fixing.
 * @param cssPropertyInfoList An array of CSS property information objects to be ordered.
 * @param userDefinedGroups Array of user-defined property groups for custom ordering.
 * @param sortRemainingProperties Strategy for sorting properties not in user-defined groups
 *                                  ('alphabetical' or 'concentric'). Defaults to 'concentric'.
 *
 * This function compares CSS properties based on their group priority and position within
 * those groups. Properties not part of user-defined groups are sorted according to the
 * specified strategy. If an ordering violation is detected, an ESLint report is generated
 * with a suggested fix.
 */
export const enforceCustomGroupOrder = (
  ruleContext: Rule.RuleContext,
  cssPropertyInfoList: CSSPropertyInfo[],
  userDefinedGroups: string[] = [],
  sortRemainingProperties?: 'alphabetical' | 'concentric',
): void => {
  if (cssPropertyInfoList.length > 1) {
    const cssPropertyPriorityMap = createCSSPropertyPriorityMap(userDefinedGroups);

    const compareProperties = (firstProperty: CSSPropertyInfo, secondProperty: CSSPropertyInfo) => {
      const firstPropertyInfo = cssPropertyPriorityMap.get(firstProperty.name) || {
        groupIndex: Infinity,
        positionInGroup: Infinity,
        inUserGroup: false,
      };
      const secondPropertyInfo = cssPropertyPriorityMap.get(secondProperty.name) || {
        groupIndex: Infinity,
        positionInGroup: Infinity,
        inUserGroup: false,
      };

      if (firstPropertyInfo.inUserGroup !== secondPropertyInfo.inUserGroup) {
        return firstPropertyInfo.inUserGroup ? -1 : 1;
      }

      if (firstPropertyInfo.inUserGroup) {
        if (firstPropertyInfo.groupIndex !== secondPropertyInfo.groupIndex) {
          return firstPropertyInfo.groupIndex - secondPropertyInfo.groupIndex;
        }
        return firstPropertyInfo.positionInGroup - secondPropertyInfo.positionInGroup;
      }

      // For properties not in user-defined groups
      if (sortRemainingProperties === 'alphabetical') {
        return firstProperty.name.localeCompare(secondProperty.name);
      } else {
        return (
          firstPropertyInfo.groupIndex - secondPropertyInfo.groupIndex ||
          firstPropertyInfo.positionInGroup - secondPropertyInfo.positionInGroup
        );
      }
    };

    const sortedPropertyList = [...cssPropertyInfoList].sort(compareProperties);

    // Find the first pair that violates the new ordering
    const violatingProperty = cssPropertyInfoList
      .slice(0, -1)
      .find((currentProperty, index) => currentProperty.name !== sortedPropertyList[index]?.name);

    if (violatingProperty) {
      const indexInSorted = cssPropertyInfoList.indexOf(violatingProperty);
      const sortedProperty = sortedPropertyList[indexInSorted];
      // Defensive programming - sortedProperty will always exist and have a name because sortedPropertyList is derived from cssPropertyInfoList and cssPropertyInfoList exists and is non-empty
      // Therefore, we can exclude the next line from coverage because it's unreachable in practice
      /* v8 ignore next */
      const nextPropertyName = sortedProperty?.name ?? '';

      ruleContext.report({
        node: violatingProperty.node as Rule.Node,
        messageId: 'incorrectOrder',
        data: {
          currentProperty: violatingProperty.name,
          nextProperty: nextPropertyName,
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
    }
  }
};
