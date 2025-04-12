import type { Rule } from 'eslint';
import type { TSESTree } from '@typescript-eslint/utils';

/**
 * Removes the given node and also removes a trailing comma if it exists.
 * @param ruleContext The ESLint rule context.
 * @param node The node to remove.
 * @param fixer The ESLint fixer.
 * @returns The fix object.
 */
export const removeNodeWithComma = (ruleContext: Rule.RuleContext, node: TSESTree.Node, fixer: Rule.RuleFixer) => {
  const sourceCode = ruleContext.sourceCode;
  const tokenAfter = sourceCode.getTokenAfter(node as Rule.Node);
  if (tokenAfter && tokenAfter.value === ',' && node.range && tokenAfter.range) {
    return fixer.removeRange([node.range[0], tokenAfter.range[1]]);
  }
  return fixer.remove(node as Rule.Node);
};
