import { describe, it, expect } from 'vitest';
import { areAllChildrenEmpty } from '../property-utils.js';
import type { TSESTree } from '@typescript-eslint/utils';

describe('areAllChildrenEmpty', () => {
  it('should return true for an empty object with no properties', () => {
    const emptyObject = {
      type: 'ObjectExpression',
      properties: [],
    };

    const result = areAllChildrenEmpty(emptyObject as unknown as TSESTree.ObjectExpression);
    expect(result).toBe(true);
  });

  it('should return false when a property is not of type Property', () => {
    const objectWithNonPropertyType = {
      type: 'ObjectExpression',
      properties: [
        {
          type: 'SpreadElement', // Not a Property type
          argument: {
            type: 'Identifier',
            name: 'spread',
          },
        },
      ],
    };

    const result = areAllChildrenEmpty(objectWithNonPropertyType as unknown as TSESTree.ObjectExpression);
    expect(result).toBe(false);
  });

  it('should return false when a property value is not an ObjectExpression', () => {
    const objectWithNonObjectValue = {
      type: 'ObjectExpression',
      properties: [
        {
          type: 'Property',
          key: {
            type: 'Identifier',
            name: 'prop',
          },
          value: {
            type: 'Literal', // Not an ObjectExpression
            value: 'string value',
          },
        },
      ],
    };

    const result = areAllChildrenEmpty(objectWithNonObjectValue as unknown as TSESTree.ObjectExpression);
    expect(result).toBe(false);
  });
});
