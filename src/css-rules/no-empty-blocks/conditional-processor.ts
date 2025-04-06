import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';
import { isEmptyObject } from '../shared-utils/empty-object-processor.js';
import { reportEmptyDeclaration } from './fix-utils.js';

/**
 * Handles conditional expressions with empty objects.
 */
export function processConditionalExpression(
  context: Rule.RuleContext,
  node: TSESTree.ConditionalExpression,
  reportedNodes: Set<TSESTree.Node>,
  callNode: TSESTree.CallExpression,
): void {
  const isConsequentEmpty = node.consequent.type === 'ObjectExpression' && isEmptyObject(node.consequent);
  const isAlternateEmpty = node.alternate.type === 'ObjectExpression' && isEmptyObject(node.alternate);

  // If both branches are empty, report the entire declaration for removal
  if (isConsequentEmpty && isAlternateEmpty) {
    reportedNodes.add(node);
    reportEmptyDeclaration(context, node, callNode);
    return;
  }

  // Otherwise, handle individual empty branches
  if (isConsequentEmpty || isAlternateEmpty) {
    const emptyNode = isConsequentEmpty ? node.consequent : node.alternate;
    reportedNodes.add(emptyNode);

    // No fix provided, just flagging the issue
    context.report({
      node: emptyNode as Rule.Node,
      messageId: 'emptyConditionalStyle',
    });
  }
}
