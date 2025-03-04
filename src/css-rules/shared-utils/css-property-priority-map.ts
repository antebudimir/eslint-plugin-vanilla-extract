import { concentricGroups } from '../concentric-order/concentric-groups.js';

/**
 * Creates a map of CSS properties to their priority information.
 *
 * This function generates a Map where each key is a CSS property (in camelCase),
 * and each value is an object containing:
 * - groupIndex: The index of the property's group
 * - positionInGroup: The position of the property within its group
 * - inUserGroup: Whether the property is in a user-specified group
 *
 * The function prioritizes user-specified groups over default concentric groups.
 * If user groups are provided, they are processed first. Any remaining concentric
 * groups are then processed to ensure complete coverage of CSS properties.
 *
 * @param userGroups - An optional array of user-specified group names to prioritize
 * @returns A Map of CSS properties to their priority information
 *
 * @example
 * const priorityMap = createCSSPropertyPriorityMap(['layout', 'typography']);
 * console.log(priorityMap.get('display')); // { groupIndex: 0, positionInGroup: 0, inUserGroup: true }
 */
export const createCSSPropertyPriorityMap = (userGroups: string[] = []) => {
  const cssPropertyPriorityMap = new Map<
    string,
    {
      groupIndex: number;
      positionInGroup: number;
      inUserGroup: boolean;
    }
  >();

  const processGroup = (groupName: string, groupIndex: number, inUserGroup: boolean) => {
    const properties = concentricGroups[groupName] || [];
    properties.forEach((property, positionInGroup) => {
      const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      if (!cssPropertyPriorityMap.has(camelCaseProperty)) {
        cssPropertyPriorityMap.set(camelCaseProperty, {
          groupIndex,
          positionInGroup,
          inUserGroup,
        });
      }
    });
  };

  // Process user-specified groups first
  userGroups.forEach((groupName, index) => processGroup(groupName, index, true));

  // Process remaining groups if needed (for concentric order or as fallback)
  if (userGroups.length === 0 || userGroups.length < Object.keys(concentricGroups).length) {
    Object.keys(concentricGroups).forEach((groupName, index) => {
      if (!userGroups.includes(groupName)) {
        processGroup(groupName, userGroups.length + index, false);
      }
    });
  }

  return cssPropertyPriorityMap;
};
