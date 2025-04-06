import { TSESTree } from '@typescript-eslint/utils';

/**
 * Extracts the name of a property from a TSESTree.Property node.
 * @param property The property node to extract the name from.
 * @returns The name of the property as a string, or an empty string if the name cannot be determined.
 *
 * This function handles two types of property keys:
 * - Identifier: Returns the name directly.
 * - Literal (string): Returns the string value.
 * For any other type of key, it returns an empty string.
 */
export const getPropertyNameForSorting = (property: TSESTree.Property): string => {
  if (property.key.type === 'Identifier') {
    return property.key.name;
  } else if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
    return property.key.value;
  }
  return '';
};

/**
 * Separates object properties into regular and special categories.
 * @param properties An array of object literal elements to be categorized.
 * @returns An object containing two arrays: regularProperties and specialProperties.
 *
 * This function categorizes properties as follows:
 * - Regular properties: Standard CSS properties.
 * - Special properties: Properties that start with ':' (pseudo-selectors),
 *   '@' (at-rules), or are named 'selectors'.
 *
 * Non-Property type elements in the input array are ignored.
 */
export const separateProperties = (
  properties: TSESTree.ObjectLiteralElement[],
): {
  regularProperties: TSESTree.Property[];
  specialProperties: TSESTree.Property[];
} => {
  const regularProperties: TSESTree.Property[] = [];
  const specialProperties: TSESTree.Property[] = [];

  // Separate regular CSS properties from special ones (pseudo selectors, etc.)
  properties.forEach((property) => {
    if (property.type === 'Property') {
      const propName = getPropertyNameForSorting(property);

      if (propName.startsWith(':') || propName.startsWith('@') || propName === 'selectors') {
        specialProperties.push(property);
      } else {
        regularProperties.push(property);
      }
    }
  });

  return { regularProperties, specialProperties };
};
