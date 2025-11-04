import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

const containsPx = (text: string): boolean => /(^|\W)-?\d*\.?\d*px(?![a-zA-Z])/i.test(text);

const replacePxWith = (text: string, replacement: 'rem' | ''): string => text.replace(/px(?![a-zA-Z])/g, replacement);

const toKebab = (name: string): string => name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const getValueText = (node: TSESTree.Node): string | null => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return node.value;
  }
  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    // Join all quasis (ignore expressions content)
    const raw = node.quasis.map((quasi) => quasi.value.raw ?? '').join('');
    return raw;
  }
  return null;
};

const canSuggestFix = (node: TSESTree.Node): 'literal' | 'simple-template' | null => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') return 'literal';
  if (node.type === AST_NODE_TYPES.TemplateLiteral && node.expressions.length === 0) return 'simple-template';
  return null;
};

/**
 * Recursively processes a vanilla-extract style object and reports occurrences of 'px' units.
 *
 * - Skips properties present in the allow list (supports camelCase and kebab-case).
 * - Traverses nested object values and delegates deeper traversal to callers for arrays/at-rules/selectors.
 * - Provides fix suggestions for string literals and simple template literals (no expressions).
 *
 * @param context ESLint rule context used to report diagnostics and apply suggestions.
 * @param node The ObjectExpression node representing the style object to inspect.
 * @param allowSet Set of property names (camelCase or kebab-case) that are allowed to contain 'px'.
 */
export const processNoPxUnitInStyleObject = (
  context: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
  allowSet: Set<string>,
): void => {
  for (const property of node.properties) {
    if (property.type !== AST_NODE_TYPES.Property) continue;

    // Determine property name when possible
    let propertyName: string | null = null;
    if (property.key.type === AST_NODE_TYPES.Identifier) {
      propertyName = property.key.name;
    } else if (property.key.type === AST_NODE_TYPES.Literal && typeof property.key.value === 'string') {
      propertyName = property.key.value;
    }

    // Recurse into known nested containers
    if (propertyName === '@media' || propertyName === 'selectors') {
      if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
        for (const nested of property.value.properties) {
          if (nested.type === AST_NODE_TYPES.Property && nested.value.type === AST_NODE_TYPES.ObjectExpression) {
            processNoPxUnitInStyleObject(context, nested.value, allowSet);
          }
        }
      }
      continue;
    }

    // Traverse any nested object
    if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
      processNoPxUnitInStyleObject(context, property.value, allowSet);
      continue;
    }

    // Skip if property is whitelisted (supports both camelCase and kebab-case)
    if (propertyName) {
      const kebab = toKebab(propertyName);
      if (allowSet.has(propertyName) || allowSet.has(kebab)) {
        continue;
      }
    }

    // Check string or template literal values
    const text = getValueText(property.value);
    if (text && containsPx(text)) {
      const fixability = canSuggestFix(property.value);
      context.report({
        node: property.value as unknown as Rule.Node,
        messageId: 'noPxUnit',
        suggest: fixability
          ? [
              {
                messageId: 'removePx',
                fix: (fixer) => {
                  const newText = replacePxWith(text, '');
                  if (fixability === 'literal') {
                    return fixer.replaceText(property.value, `'${newText}'`);
                  }
                  // simple template with no expressions
                  return fixer.replaceText(property.value, `\`${newText}\``);
                },
              },
              {
                messageId: 'replaceWithRem',
                fix: (fixer) => {
                  const newText = replacePxWith(text, 'rem');
                  if (fixability === 'literal') {
                    return fixer.replaceText(property.value, `'${newText}'`);
                  }
                  return fixer.replaceText(property.value, `\`${newText}\``);
                },
              },
            ]
          : undefined,
      });
    }
  }
};
