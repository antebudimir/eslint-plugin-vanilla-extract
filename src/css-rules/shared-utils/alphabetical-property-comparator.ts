import { getPropertyName } from './property-separator.js';
import type { TSESTree } from '@typescript-eslint/utils';

/**
 * Compares two CSS properties alphabetically.
 * @param firstProperty The first property to compare.
 * @param secondProperty The second property to compare.
 * @returns A number indicating the relative order of the properties (-1, 0, or 1).
 */
export const comparePropertiesAlphabetically = (
  firstProperty: TSESTree.Property,
  secondProperty: TSESTree.Property,
): number => {
  const firstName = getPropertyName(firstProperty);
  const secondName = getPropertyName(secondProperty);

  // Special handling for 'src' property - it should always come first (relates to font face APIs only)
  if (firstName === 'src') {
    return -1;
  }
  if (secondName === 'src') {
    return 1;
  }

  return firstName.localeCompare(secondName);
};
