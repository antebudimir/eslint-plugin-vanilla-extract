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
 * Determines whether the given declaration node can safely be removed by the autofix.
 *
 * The autofix must NOT remove a declaration when doing so would leave dangling
 * references to its identifier:
 *
 * 1. Exported declarations (`export const x = style({})`) are never auto-removed.
 *    Exported identifiers can be consumed in other files (e.g. as a `className`)
 *    that this rule has no visibility into.
 *
 * 2. Declarations whose identifier is still referenced elsewhere in the same file
 *    (e.g. interpolated into a `globalStyle()` selector template literal, or listed
 *    in a separate `export { x }` statement) are never auto-removed.
 *
 * In both cases the empty style block is still reported, just without a fix, so the
 * developer can resolve the usages manually.
 */
const isDeclarationSafeToAutoRemove = (ruleContext: Rule.RuleContext, declarationNode: TSESTree.Node): boolean => {
  // Exported bindings may be used in other files - never auto-remove them.
  if (declarationNode.type === 'ExportNamedDeclaration' || declarationNode.type === 'ExportDefaultDeclaration') {
    return false;
  }

  if (declarationNode.type !== 'VariableDeclaration') {
    return true;
  }

  const sourceCode = ruleContext.sourceCode;
  const declarationRange = declarationNode.range;
  if (!declarationRange) {
    return true;
  }

  return declarationNode.declarations.every((declarator) => {
    const declaredVariables = sourceCode.getDeclaredVariables(declarator as unknown as Rule.Node);

    return declaredVariables.every((variable) => {
      return !variable.references.some((reference) => {
        const identifier = reference.identifier as TSESTree.Identifier | null | undefined;
        if (!identifier || !identifier.range) {
          return false;
        }

        // The binding identifier itself lives inside the declaration - only
        // references outside of it are actual usages of the identifier.
        const isInsideDeclaration =
          identifier.range[0] >= declarationRange[0] && identifier.range[1] <= declarationRange[1];

        return !isInsideDeclaration;
      });
    });
  });
};

/**
 * Reports an issue for an empty style declaration, and provides a fix to remove the declaration.
 *
 * The removal autofix is only provided when the declaration is not exported and its
 * identifier is not referenced anywhere else in the file - otherwise the fix would break
 * those references (e.g. a `globalStyle()` selector or an import in another file).
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

  if (!targetDeclarationNode || !isDeclarationSafeToAutoRemove(ruleContext, targetDeclarationNode)) {
    // Report the issue without providing a fix
    ruleContext.report({
      node: node as Rule.Node,
      messageId: 'emptyStyleDeclaration',
    });
    return;
  }

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
};
