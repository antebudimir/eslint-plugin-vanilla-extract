import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  isPhysicalProperty,
  getLogicalProperty,
  toKebabCase,
  toCamelCase,
  TEXT_ALIGN_PHYSICAL_VALUES,
  FLOAT_PHYSICAL_VALUES,
  CLEAR_PHYSICAL_VALUES,
  VALUE_BASED_PHYSICAL_PROPERTIES,
} from './property-mappings.js';

export interface LogicalPropertiesOptions {
  allow?: string[];
}

/**
 * Get the text value from a node (string literal or simple template literal)
 */
const getValueText = (node: TSESTree.Node): string | null => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return node.value;
  }
  if (node.type === AST_NODE_TYPES.TemplateLiteral && node.expressions.length === 0) {
    return node.quasis.map((quasi) => quasi.value.raw ?? '').join('');
  }
  return null;
};

/**
 * Check if a node can be auto-fixed (literal or simple template literal)
 */
const canAutoFix = (node: TSESTree.Node): 'literal' | 'simple-template' | null => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return 'literal';
  }
  if (node.type === AST_NODE_TYPES.TemplateLiteral && node.expressions.length === 0) {
    return 'simple-template';
  }
  return null;
};

/**
 * Check if a property value contains physical directional values
 */
const hasPhysicalValue = (propertyName: string, value: string): { hasPhysical: boolean; fixedValue?: string } => {
  const trimmedValue = value.trim().toLowerCase();

  if (propertyName === 'text-align' || propertyName === 'textAlign') {
    if (trimmedValue in TEXT_ALIGN_PHYSICAL_VALUES) {
      return {
        hasPhysical: true,
        fixedValue: TEXT_ALIGN_PHYSICAL_VALUES[trimmedValue],
      };
    }
  }

  if (propertyName === 'float') {
    if (trimmedValue in FLOAT_PHYSICAL_VALUES) {
      return {
        hasPhysical: true,
        fixedValue: FLOAT_PHYSICAL_VALUES[trimmedValue],
      };
    }
  }

  if (propertyName === 'clear') {
    if (trimmedValue in CLEAR_PHYSICAL_VALUES) {
      return {
        hasPhysical: true,
        fixedValue: CLEAR_PHYSICAL_VALUES[trimmedValue],
      };
    }
  }

  if (propertyName === 'resize') {
    if (trimmedValue === 'horizontal' || trimmedValue === 'vertical') {
      const fixedValue = trimmedValue === 'horizontal' ? 'inline' : 'block';
      return { hasPhysical: true, fixedValue };
    }
  }

  return { hasPhysical: false };
};

/**
 * Normalize property name to both camelCase and kebab-case for checking
 */
const normalizePropertyName = (name: string): { camel: string; kebab: string } => {
  const kebab = toKebabCase(name);
  const camel = toCamelCase(name);
  return { camel, kebab };
};

/**
 * Check if a property is in the allow list
 */
const isAllowed = (propertyName: string, allowSet: Set<string>): boolean => {
  const { camel, kebab } = normalizePropertyName(propertyName);
  return allowSet.has(propertyName) || allowSet.has(camel) || allowSet.has(kebab);
};

/**
 * Get the appropriate logical property name based on the original format
 */
const getLogicalPropertyInFormat = (originalName: string, logicalName: string): string => {
  // If original is kebab-case (contains hyphen), return kebab-case
  if (originalName.includes('-')) {
    return toKebabCase(logicalName);
  }
  // Otherwise return camelCase
  return toCamelCase(logicalName);
};

/**
 * Create a fix for replacing a property key
 */
const createPropertyKeyFix = (
  fixer: Rule.RuleFixer,
  property: TSESTree.Property,
  newPropertyName: string,
  context: Rule.RuleContext,
): Rule.Fix | null => {
  const key = property.key;

  if (key.type === AST_NODE_TYPES.Identifier) {
    return fixer.replaceText(key as unknown as Rule.Node, newPropertyName);
  }

  if (key.type === AST_NODE_TYPES.Literal && typeof key.value === 'string') {
    // Preserve quote style
    const sourceCode = context.getSourceCode();
    const originalText = sourceCode.getText(key as unknown as Rule.Node);
    const quote = originalText[0];
    return fixer.replaceText(key as unknown as Rule.Node, `${quote}${newPropertyName}${quote}`);
  }

  return null;
};

/**
 * Create a fix for replacing a property value
 */
const createPropertyValueFix = (
  fixer: Rule.RuleFixer,
  valueNode: TSESTree.Node,
  newValue: string,
  fixType: 'literal' | 'simple-template',
): Rule.Fix => {
  if (fixType === 'literal') {
    return fixer.replaceText(valueNode as unknown as Rule.Node, `'${newValue}'`);
  }
  // simple-template
  return fixer.replaceText(valueNode as unknown as Rule.Node, `\`${newValue}\``);
};

/**
 * Recursively processes a vanilla-extract style object and reports physical CSS properties.
 *
 * - Detects physical property names and suggests logical equivalents
 * - Detects physical directional values (e.g., text-align: left)
 * - Skips properties in the allow list
 * - Provides auto-fixes where unambiguous
 * - Traverses nested objects, @media, and selectors
 *
 * @param context ESLint rule context
 * @param node The ObjectExpression node representing the style object
 * @param allowSet Set of property names to skip
 */
export const processLogicalPropertiesInStyleObject = (
  context: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
  allowSet: Set<string>,
): void => {
  for (const property of node.properties) {
    if (property.type !== AST_NODE_TYPES.Property) continue;

    // Determine property name
    let propertyName: string | null = null;
    if (property.key.type === AST_NODE_TYPES.Identifier) {
      propertyName = property.key.name;
    } else if (property.key.type === AST_NODE_TYPES.Literal && typeof property.key.value === 'string') {
      propertyName = property.key.value;
    }

    if (!propertyName) continue;

    // Handle nested containers (@media, selectors, etc.)
    if (propertyName === '@media' || propertyName === 'selectors') {
      if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
        for (const nested of property.value.properties) {
          if (nested.type === AST_NODE_TYPES.Property && nested.value.type === AST_NODE_TYPES.ObjectExpression) {
            processLogicalPropertiesInStyleObject(context, nested.value, allowSet);
          }
        }
      }
      continue;
    }

    // Recurse into nested objects
    if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
      processLogicalPropertiesInStyleObject(context, property.value, allowSet);
      continue;
    }

    // Skip if property is in allow list
    if (isAllowed(propertyName, allowSet)) {
      continue;
    }

    // Check for physical property names
    if (isPhysicalProperty(propertyName)) {
      const logicalProp = getLogicalProperty(propertyName);
      if (logicalProp) {
        const logicalInFormat = getLogicalPropertyInFormat(propertyName, logicalProp);

        context.report({
          node: property.key as unknown as Rule.Node,
          messageId: 'preferLogicalProperty',
          data: {
            physical: propertyName,
            logical: logicalInFormat,
          },
          fix: (fixer) => createPropertyKeyFix(fixer, property, logicalInFormat, context),
        });
      }
      continue;
    }

    // Check for value-based physical properties
    if (VALUE_BASED_PHYSICAL_PROPERTIES.has(propertyName)) {
      const valueText = getValueText(property.value);
      if (valueText) {
        const { hasPhysical, fixedValue } = hasPhysicalValue(propertyName, valueText);
        if (hasPhysical && fixedValue) {
          const fixType = canAutoFix(property.value);
          context.report({
            node: property.value as unknown as Rule.Node,
            messageId: 'preferLogicalValue',
            data: {
              property: propertyName,
              physical: valueText.trim(),
              logical: fixedValue,
            },
            fix: fixType ? (fixer) => createPropertyValueFix(fixer, property.value, fixedValue, fixType) : undefined,
          });
        }
      }
    }
  }
};
