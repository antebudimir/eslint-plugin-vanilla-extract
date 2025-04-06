import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';

/**
 * Finds the target declaration node for a given call expression.
 *
 * Traverses the AST upwards from the `callNode` to find the appropriate
 * declaration node. For global APIs, it targets the expression statement.
 * For non-global APIs, it looks for variable declarations or export
 * named declarations.
 *
 * @param callNode - The call expression node to start from.
 * @param isGlobalApi - A flag indicating whether the API is global.
 * @returns The target declaration node or null if not found.
 */

export const findTargetDeclarationNode = (
  callNode: TSESTree.CallExpression,
  isGlobalApi: boolean,
): TSESTree.Node | null => {
  let current: TSESTree.Node = callNode;

  while (current.parent) {
    current = current.parent;

    // For global APIs, we only need to check for ExpressionStatement
    if (isGlobalApi && current.type === 'ExpressionStatement') {
      return current;
    }

    // For non-global APIs, check for variable declarations and exports
    if (!isGlobalApi) {
      if (current.type === 'VariableDeclarator' && current.parent && current.parent.type === 'VariableDeclaration') {
        // If this is part of an export, get the export declaration
        if (current.parent.parent && current.parent.parent.type === 'ExportNamedDeclaration') {
          return current.parent.parent;
        }
        return current.parent;
      }
    }
  }

  return null;
};

/**
 * Reports an issue for an empty style declaration, and provides a fix to remove the declaration.
 * @param ruleContext The ESLint rule context.
 * @param node The node to report the issue on.
 * @param callNode The CallExpression node of the style() function.
 */
export const reportEmptyDeclaration = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.Node,
  callNode: TSESTree.CallExpression,
): void => {
  // Check if this is a global API function
  const isGlobalApi =
    callNode.callee.type === 'Identifier' &&
    ['globalStyle', 'globalFontFace', 'globalKeyframes'].includes(callNode.callee.name);

  // Find the parent declaration node
  const targetDeclarationNode = findTargetDeclarationNode(callNode, isGlobalApi);

  if (targetDeclarationNode) {
    ruleContext.report({
      node: node as Rule.Node,
      messageId: 'emptyStyleDeclaration',
      fix(fixer) {
        const sourceCode = ruleContext.sourceCode;
        const startLine = sourceCode.getLocFromIndex(targetDeclarationNode.range[0]).line;
        const lineStart = sourceCode.getIndexFromLoc({
          line: startLine,
          column: 0,
        });

        // Find next line after the declaration
        const endLine = sourceCode.getLocFromIndex(targetDeclarationNode.range[1]).line;
        const nextLineStart = sourceCode.getIndexFromLoc({
          line: endLine + 1,
          column: 0,
        });

        return fixer.removeRange([lineStart, nextLineStart]);
      },
    });
  } else {
    // Report the issue without providing a fix
    ruleContext.report({
      node: node as Rule.Node,
      messageId: 'emptyStyleDeclaration',
    });
  }
};
