import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

/**
 * List of valid CSS units according to CSS specifications.
 */
const VALID_CSS_UNITS = [
  // Absolute length units
  'px',
  'cm',
  'mm',
  'Q',
  'in',
  'pc',
  'pt',
  // Relative length units
  'em',
  'ex',
  'ch',
  'rem',
  'lh',
  'rlh',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'vb',
  'vi',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
  // Percentage
  '%',
  // Angle units
  'deg',
  'grad',
  'rad',
  'turn',
  // Time units
  'ms',
  's',
  // Frequency units
  'Hz',
  'kHz',
  // Resolution units
  'dpi',
  'dpcm',
  'dppx',
  'x',
  // Flexible length units
  'fr',
  // Other valid units
  'cap',
  'ic',
  'rex',
  'cqw',
  'cqh',
  'cqi',
  'cqb',
  'cqmin',
  'cqmax',
];

/**
 * Regular expression to extract units from CSS values.
 * Matches numeric values followed by a unit.
 */
const CSS_VALUE_WITH_UNIT_REGEX = /^(-?\d*\.?\d+)([a-zA-Z%]+)$/i;

/**
 * Splits a CSS value string into individual parts, handling spaces not inside functions.
 */
const splitCssValues = (value: string): string[] => {
  return value
    .split(/(?<!\([^)]*)\s+/) // Split on spaces not inside functions
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

/**
 * Check if a CSS value contains a valid CSS unit.
 */
const checkCssUnit = (
  value: string,
): { hasUnit: boolean; unit: string | null; isValid: boolean; invalidValue?: string } => {
  const values = splitCssValues(value);

  for (const value of values) {
    // Skip values containing CSS functions
    if (value.includes('(')) {
      continue;
    }

    const match = value.match(CSS_VALUE_WITH_UNIT_REGEX);
    if (!match) {
      continue;
    }

    const unit = match[2]!.toLowerCase(); // match[2] is guaranteed by regex pattern
    if (!VALID_CSS_UNITS.includes(unit)) {
      return {
        hasUnit: true,
        unit: match[2]!, // Preserve original casing
        isValid: false,
        invalidValue: value,
      };
    }
  }

  return { hasUnit: false, unit: null, isValid: true };
};

/**
 * Extracts string value from a node if it's a string literal or template literal.
 */
const getStringValue = (node: TSESTree.Node): string | null => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === AST_NODE_TYPES.TemplateLiteral && node.quasis.length === 1) {
    const firstQuasi = node.quasis[0];
    return firstQuasi?.value.raw ? firstQuasi.value.raw : null;
  }

  return null;
};

/**
 * Recursively processes a style object, reporting instances of
 * unknown CSS units.
 *
 * @param context The ESLint rule context.
 * @param node The ObjectExpression node representing the style object to be
 *   processed.
 */
export const processUnknownUnitInStyleObject = (context: Rule.RuleContext, node: TSESTree.ObjectExpression): void => {
  // Defensive: This function is only called with ObjectExpression nodes by the rule visitor.
  // This check's for type safety and future-proofing. It's not covered by rule tests
  // because the rule architecture prevents non-ObjectExpression nodes from reaching here.
  if (!node || node.type !== AST_NODE_TYPES.ObjectExpression) {
    return;
  }

  for (const property of node.properties) {
    if (property.type !== AST_NODE_TYPES.Property) {
      continue;
    }

    // Get property key name if possible
    let propertyName: string | null = null;
    if (property.key.type === AST_NODE_TYPES.Identifier) {
      propertyName = property.key.name;
    } else if (property.key.type === AST_NODE_TYPES.Literal && typeof property.key.value === 'string') {
      propertyName = property.key.value;
    }

    if (propertyName === '@media' || propertyName === 'selectors') {
      if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
        for (const nestedProperty of property.value.properties) {
          if (
            nestedProperty.type === AST_NODE_TYPES.Property &&
            nestedProperty.value.type === AST_NODE_TYPES.ObjectExpression
          ) {
            processUnknownUnitInStyleObject(context, nestedProperty.value);
          }
        }
      }
      continue;
    }

    // Process direct string values
    const value = getStringValue(property.value);
    if (value) {
      const result = checkCssUnit(value);
      if (result.hasUnit && !result.isValid && result.invalidValue) {
        context.report({
          node: property.value as Rule.Node,
          messageId: 'unknownUnit',
          data: {
            unit: result.unit || '',
            value: result.invalidValue,
          },
        });
      }
    }

    // Process nested objects (including those not handled by special cases)
    if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
      processUnknownUnitInStyleObject(context, property.value);
    }
  }
};
