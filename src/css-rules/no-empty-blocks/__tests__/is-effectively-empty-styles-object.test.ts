import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { describe, expect, it } from 'vitest';
import { isEffectivelyEmptyStylesObject } from '../empty-style-visitor-creator.js';

describe('isEffectivelyEmptyStylesObject', () => {
  const createObjectExpression = (properties: TSESTree.Property[]): TSESTree.ObjectExpression => ({
    type: AST_NODE_TYPES.ObjectExpression,
    properties,
    range: [0, 0],
    loc: {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    },
    parent: null as unknown as TSESTree.Node,
  });

  const createProperty = (key: string, value: TSESTree.Expression): TSESTree.Property => ({
    type: AST_NODE_TYPES.Property,
    key: {
      type: AST_NODE_TYPES.Identifier,
      name: key,
      range: [0, 0],
      loc: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 0 },
      },
      parent: null as unknown as TSESTree.Property,
      decorators: [],
      optional: false,
      typeAnnotation: undefined,
    },
    value,
    computed: false,
    method: false,
    shorthand: false,
    kind: 'init',
    range: [0, 0],
    loc: {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    },
    parent: null as unknown as TSESTree.ObjectExpression,
    optional: false,
  });

  const createLiteral = (value: string): TSESTree.Literal => ({
    type: AST_NODE_TYPES.Literal,
    value,
    raw: `'${value}'`,
    range: [0, 0],
    loc: {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    },
    parent: null as unknown as TSESTree.Node,
  });

  it('should return true for an object with empty selectors, media, or supports objects', () => {
    const object = createObjectExpression([
      createProperty('color', createLiteral('blue')),
      createProperty('selectors', createObjectExpression([])),
      createProperty('@media', createObjectExpression([])),
      createProperty('@supports', createObjectExpression([])),
    ]);
    expect(isEffectivelyEmptyStylesObject(object)).toBe(true);
  });

  it('should return true for an empty object', () => {
    const emptyObject = createObjectExpression([]);
    expect(isEffectivelyEmptyStylesObject(emptyObject)).toBe(true);
  });

  it('should return false for an object with non-empty properties', () => {
    const object = createObjectExpression([createProperty('color', createLiteral('blue'))]);
    expect(isEffectivelyEmptyStylesObject(object)).toBe(false);
  });

  it('should return true for an object with only empty nested selectors', () => {
    const object = createObjectExpression([
      createProperty(
        'selectors',
        createObjectExpression([
          createProperty('&:hover', createObjectExpression([])),
          createProperty('&:focus', createObjectExpression([])),
        ]),
      ),
    ]);
    expect(isEffectivelyEmptyStylesObject(object)).toBe(true);
  });

  it('should return true for an object with only empty nested media queries', () => {
    const object = createObjectExpression([
      createProperty(
        '@media',
        createObjectExpression([
          createProperty('(min-width: 768px)', createObjectExpression([])),
          createProperty('(max-width: 1024px)', createObjectExpression([])),
        ]),
      ),
    ]);
    expect(isEffectivelyEmptyStylesObject(object)).toBe(true);
  });
});
