import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { isEmptyObject } from '../shared-utils/empty-object-processor.js';
import { removeNodeWithComma } from './node-remover.js';
import { areAllChildrenEmpty, getStyleKeyName } from './property-utils.js';

/**
 * Processes nested style objects like selectors and media queries.
 */
export const processEmptyNestedStyles = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
  reportedNodes: Set<TSESTree.Node>,
): void => {
  node.properties.forEach((property) => {
    if (property.type !== 'Property') {
      return;
    }

    const propertyName = getStyleKeyName(property.key);
    if (!propertyName) {
      return;
    }

    // Handle selectors, media queries, and supports
    if ((propertyName === 'selectors' || propertyName.startsWith('@')) && property.value.type === 'ObjectExpression') {
      // If the container is empty or all its children are empty, remove the entire property
      if (isEmptyObject(property.value) || areAllChildrenEmpty(property.value)) {
        if (!reportedNodes.has(property)) {
          reportedNodes.add(property);
          const messageId =
            propertyName === 'selectors'
              ? 'emptySelectors'
              : propertyName === '@media'
                ? 'emptyMedia'
                : propertyName === '@supports'
                  ? 'emptySupports'
                  : 'emptyConditionalStyle';

          ruleContext.report({
            node: property as Rule.Node,
            messageId,
            fix(fixer) {
              return removeNodeWithComma(ruleContext, property, fixer);
            },
          });
        }
        return;
      }

      // Process individual selectors or media queries if we're not removing the entire container
      property.value.properties.forEach((nestedProperty) => {
        if (nestedProperty.type === 'Property') {
          if (nestedProperty.value.type === 'ObjectExpression') {
            if (isEmptyObject(nestedProperty.value)) {
              if (!reportedNodes.has(nestedProperty)) {
                reportedNodes.add(nestedProperty);
                ruleContext.report({
                  node: nestedProperty as Rule.Node,
                  messageId: 'emptyNestedStyle',
                  fix(fixer) {
                    return removeNodeWithComma(ruleContext, nestedProperty, fixer);
                  },
                });
              }
            } else {
              // Recursively process nested styles (for deeply nested selectors/media)
              processEmptyNestedStyles(ruleContext, nestedProperty.value, reportedNodes);
            }
          }
        }
      });
    }
  });
};
