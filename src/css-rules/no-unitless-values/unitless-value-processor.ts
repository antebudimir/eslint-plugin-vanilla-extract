import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

/**
 * CSS properties that require units for length/dimension values.
 * These properties should not have unitless numeric values (except 0).
 */
const PROPERTIES_REQUIRING_UNITS = new Set([
  // Box model
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'min-width',
  'max-width',
  'min-height',
  'max-height',

  // Spacing
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'margin-inline',
  'margin-inline-start',
  'margin-inline-end',

  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingBlock',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInline',
  'paddingInlineStart',
  'paddingInlineEnd',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'padding-inline',
  'padding-inline-start',
  'padding-inline-end',

  // Positioning
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'insetBlock',
  'insetBlockStart',
  'insetBlockEnd',
  'insetInline',
  'insetInlineStart',
  'insetInlineEnd',
  'inset-block',
  'inset-block-start',
  'inset-block-end',
  'inset-inline',
  'inset-inline-start',
  'inset-inline-end',

  // Border
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderBlockWidth',
  'borderBlockStartWidth',
  'borderBlockEndWidth',
  'borderInlineWidth',
  'borderInlineStartWidth',
  'borderInlineEndWidth',
  'border-width',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-block-width',
  'border-block-start-width',
  'border-block-end-width',
  'border-inline-width',
  'border-inline-start-width',
  'border-inline-end-width',

  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndEndRadius',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-start-start-radius',
  'border-start-end-radius',
  'border-end-start-radius',
  'border-end-end-radius',

  // Typography
  'fontSize',
  'font-size',
  'letterSpacing',
  'letter-spacing',
  'wordSpacing',
  'word-spacing',
  'textIndent',
  'text-indent',

  // Flexbox/Grid
  'gap',
  'rowGap',
  'columnGap',
  'row-gap',
  'column-gap',
  'flexBasis',
  'flex-basis',

  // Outline
  'outlineWidth',
  'outline-width',
  'outlineOffset',
  'outline-offset',

  // Other
  'blockSize',
  'inlineSize',
  'minBlockSize',
  'maxBlockSize',
  'minInlineSize',
  'maxInlineSize',
  'block-size',
  'inline-size',
  'min-block-size',
  'max-block-size',
  'min-inline-size',
  'max-inline-size',
]);

/**
 * CSS properties that accept unitless numeric values.
 * These properties should NOT be flagged when they have numeric values.
 */
const UNITLESS_VALID_PROPERTIES = new Set([
  'opacity',
  'zIndex',
  'z-index',
  'lineHeight',
  'line-height',
  'flexGrow',
  'flex-grow',
  'flexShrink',
  'flex-shrink',
  'order',
  'fontWeight',
  'font-weight',
  'zoom',
  'animationIterationCount',
  'animation-iteration-count',
  'columnCount',
  'column-count',
  'gridColumn',
  'grid-column',
  'gridColumnEnd',
  'grid-column-end',
  'gridColumnStart',
  'grid-column-start',
  'gridRow',
  'grid-row',
  'gridRowEnd',
  'grid-row-end',
  'gridRowStart',
  'grid-row-start',
  'orphans',
  'widows',
  'fillOpacity',
  'fill-opacity',
  'strokeOpacity',
  'stroke-opacity',
  'strokeMiterlimit',
  'stroke-miterlimit',
]);

export interface NoUnitlessValuesOptions {
  allow?: string[];
}

/**
 * Checks if a property name requires units for numeric values.
 */
const requiresUnits = (propertyName: string, allow: string[] = []): boolean => {
  if (allow.includes(propertyName)) {
    return false;
  }

  if (UNITLESS_VALID_PROPERTIES.has(propertyName)) {
    return false;
  }

  return PROPERTIES_REQUIRING_UNITS.has(propertyName);
};

/**
 * Gets the property name from a Property node.
 */
const getPropertyName = (property: TSESTree.Property): string | null => {
  if (property.key.type === AST_NODE_TYPES.Identifier) {
    return property.key.name;
  }
  if (property.key.type === AST_NODE_TYPES.Literal && typeof property.key.value === 'string') {
    return property.key.value;
  }
  return null;
};

/**
 * Recursively processes a style object, reporting instances of unitless numeric values for properties that require units.
 *
 * @param ruleContext The ESLint rule context.
 * @param node The ObjectExpression node representing the style object to be processed.
 * @param options Rule options including allow list.
 */
export const processUnitlessValueInStyleObject = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
  options: NoUnitlessValuesOptions = {},
): void => {
  const allow = options.allow || [];

  node.properties.forEach((property) => {
    if (property.type !== AST_NODE_TYPES.Property) {
      return;
    }

    const propertyName = getPropertyName(property);
    if (!propertyName) {
      return;
    }

    // Skip special nested structures like @media, selectors, etc.
    // These will be processed recursively
    if (propertyName.startsWith('@') || propertyName.startsWith(':') || propertyName === 'selectors') {
      if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
        if (propertyName === '@media' || propertyName === 'selectors') {
          property.value.properties.forEach((nestedProperty) => {
            if (
              nestedProperty.type === AST_NODE_TYPES.Property &&
              nestedProperty.value.type === AST_NODE_TYPES.ObjectExpression
            ) {
              processUnitlessValueInStyleObject(ruleContext, nestedProperty.value, options);
            }
          });
        } else {
          // For pseudo-selectors and other nested objects, process directly
          processUnitlessValueInStyleObject(ruleContext, property.value, options);
        }
      }
      return;
    }

    // Check if this property requires units
    if (!requiresUnits(propertyName, allow)) {
      // Still need to process nested objects for non-CSS properties
      if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
        processUnitlessValueInStyleObject(ruleContext, property.value, options);
      }
      return;
    }

    // Check for unitless numeric literal values (e.g., width: 100)
    if (property.value.type === AST_NODE_TYPES.Literal && typeof property.value.value === 'number') {
      // Allow 0 without units (valid CSS), including -0
      if (property.value.value === 0 || property.value.value === -0) {
        return;
      }

      // Report unitless numeric value
      ruleContext.report({
        node: property.value,
        messageId: 'noUnitlessValue',
        data: {
          property: propertyName,
          value: String(property.value.value),
        },
      });
    }

    // Check for string literals that are unitless numbers (e.g., width: '100')
    if (property.value.type === AST_NODE_TYPES.Literal && typeof property.value.value === 'string') {
      const stringValue = property.value.value.trim();

      // Check if the string is a pure number (with optional negative sign and decimals)
      // This regex matches: -10, 10, 10.5, -10.5, but not 10px, 10rem, etc.
      const unitlessNumberRegex = /^-?\d+(\.\d+)?$/;

      if (unitlessNumberRegex.test(stringValue)) {
        // Allow '0' and '-0' without units
        const numValue = parseFloat(stringValue);
        if (numValue === 0 || numValue === -0) {
          return;
        }

        // Report unitless string numeric value
        ruleContext.report({
          node: property.value,
          messageId: 'noUnitlessValue',
          data: {
            property: propertyName,
            value: stringValue,
          },
        });
      }
    }

    // Check for unary expressions (e.g., -10)
    if (property.value.type === AST_NODE_TYPES.UnaryExpression && property.value.operator === '-') {
      if (
        property.value.argument.type === AST_NODE_TYPES.Literal &&
        typeof property.value.argument.value === 'number'
      ) {
        // Allow -0 without units
        if (property.value.argument.value === 0) {
          return;
        }

        // Report unitless numeric value
        ruleContext.report({
          node: property.value as unknown as Rule.Node,
          messageId: 'noUnitlessValue',
          data: {
            property: propertyName,
            value: `-${property.value.argument.value}`,
          },
        });
      }
    }

    // Process nested objects (for complex selectors, etc.)
    if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
      processUnitlessValueInStyleObject(ruleContext, property.value, options);
    }
  });
};
