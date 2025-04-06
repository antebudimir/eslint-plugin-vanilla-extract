import { TSESTree } from '@typescript-eslint/utils';
import { isEmptyObject } from '../shared-utils/empty-object-processor.js';

/**
 * Gets the property name regardless of whether it's an identifier or a literal.
 */
export function getStyleKeyName(key: TSESTree.Expression | TSESTree.PrivateIdentifier): string | null {
  if (key.type === 'Identifier') {
    return key.name;
  }
  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }
  return null;
}

/**
 * Checks if all properties in a style object are empty objects.
 */
export const areAllChildrenEmpty = (stylesObject: TSESTree.ObjectExpression): boolean => {
  if (stylesObject.properties.length === 0) {
    return true;
  }

  return stylesObject.properties.every((property) => {
    if (property.type !== 'Property' || property.value.type !== 'ObjectExpression') {
      return false;
    }
    return isEmptyObject(property.value);
  });
};
