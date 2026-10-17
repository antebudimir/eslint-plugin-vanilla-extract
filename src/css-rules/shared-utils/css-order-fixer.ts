import type { Rule, SourceCode } from 'eslint';

type OrderableNode = Rule.Node & { range: [number, number]; loc: Rule.Node['loc'] & {} };
type SourceComment = ReturnType<SourceCode['getCommentsBefore']>[number];

interface PropertyChunk {
  /** Start offset of the first leading comment attached to the property, if any. */
  leadingCommentsStart: number | null;
  /** Text of the leading comments attached to the property (without the indentation of the first line). */
  leadingCommentsText: string;
  /** Text of the property node itself. */
  nodeText: string;
  /** Text of the trailing same-line comment, if any. */
  trailingCommentText: string | null;
}

/**
 * Extracts the pieces of source text that belong to a property and should move
 * with it when properties are reordered:
 * 1. The leading comments directly above the property (contiguous block of
 *    comments with no blank line separating them from the property).
 * 2. The property node itself.
 * 3. A trailing comment on the same line as the property, if present.
 *
 * Delimiters that belong to the *slot* in the file rather than to the property
 * (the trailing comma, the newlines, the indentation of the first line) are
 * deliberately excluded so that swapping chunk texts between slots always
 * produces valid syntax.
 */
const createPropertyChunkExtractor = (sourceCode: SourceCode) => {
  // Comments already claimed as trailing comments of an earlier property must
  // not also be claimed as leading comments of the next property.
  const claimedTrailingComments = new Set<SourceComment>();

  const extractLeadingComments = (node: OrderableNode): { start: number; text: string } | null => {
    const allCommentsBefore = sourceCode.getCommentsBefore(node);
    if (allCommentsBefore.length === 0) {
      return null;
    }

    // Walk upwards from the property, collecting the contiguous run of
    // comments directly above it (no blank line in between).
    const attachedComments: SourceComment[] = [];
    let currentEndLine = node.loc!.start.line;
    for (let index = allCommentsBefore.length - 1; index >= 0; index--) {
      const comment = allCommentsBefore[index];
      if (!comment || claimedTrailingComments.has(comment)) {
        break;
      }
      // A blank line between the comment and what follows means the comment
      // documents the block, not this specific property.
      if (currentEndLine - comment.loc!.end.line > 1) {
        break;
      }
      attachedComments.unshift(comment);
      currentEndLine = comment.loc!.start.line;
    }

    if (attachedComments.length === 0) {
      return null;
    }

    // Slice from the first attached comment up to the property start. This
    // includes the newlines and indentation between the comments and before
    // the property, but not the indentation of the first comment's line (the
    // destination slot already provides that indentation).
    const firstComment = attachedComments[0]!;
    const firstCommentStart = firstComment.range![0];
    const commentsText = sourceCode.text.slice(firstCommentStart, node.range![0]);
    return { start: firstCommentStart, text: commentsText };
  };

  // ESLint attaches a same-line trailing comment to the *following* node's
  // leading comments rather than to this node, so trailing comments are found
  // by scanning all comments for one starting on the property's last line.
  const findTrailingComment = (node: OrderableNode): SourceComment | undefined =>
    sourceCode.getAllComments().find((comment) => comment.loc!.start.line === node.loc!.end.line);

  const extractTrailingCommentText = (node: OrderableNode): string | null => {
    const trailingComment = findTrailingComment(node);
    if (!trailingComment) {
      return null;
    }
    claimedTrailingComments.add(trailingComment);
    return sourceCode.text.slice(trailingComment.range![0], trailingComment.range![1]);
  };

  return {
    extractPropertyChunk: (node: OrderableNode): PropertyChunk => {
      const leadingComments = extractLeadingComments(node);
      return {
        leadingCommentsStart: leadingComments?.start ?? null,
        leadingCommentsText: leadingComments?.text ?? '',
        nodeText: sourceCode.getText(node),
        trailingCommentText: extractTrailingCommentText(node),
      };
    },
    findTrailingComment,
  };
};

/**
 * Generates ESLint fixes for CSS property ordering violations.
 * @param eslintFixer The ESLint fixer instance used to create fix objects.
 * @param ruleContext The ESLint rule context, providing access to the source code.
 * @param cssProperties The list of CSS properties to sort (can be TSESTree.Property[] or CSSPropertyInfo[]).
 * @param compareProperties A comparison function that defines the sorting logic for the properties.
 * @param extractNode A function that extracts the AST node from each property (used for text replacement).
 * @returns An array of ESLint Fix objects to correct the property order.
 *
 * This function performs the following steps:
 * 1. Sorts the input properties using the provided comparison function.
 * 2. Splits every property into its attachable "chunk" (leading comments,
 *    property text, same-line trailing comment).
 * 3. For every file slot whose property changed position, replaces the slot's
 *    whole chunk (from its first leading comment to its trailing comma /
 *    same-line comment) with the incoming property's chunk, re-adding the
 *    trailing comma when required so the result stays syntactically valid.
 * 4. Comments always move together with the property they describe.
 */
export const generateFixesForCSSOrder = <T>(
  eslintFixer: Rule.RuleFixer,
  ruleContext: Rule.RuleContext,
  cssProperties: T[],
  compareProperties: (firstProperty: T, secondProperty: T) => number,
  extractNode: (property: T) => Rule.Node,
): Rule.Fix[] => {
  const sourceCode: SourceCode = ruleContext.sourceCode;

  // Sort properties using the provided comparison function
  const sortedProperties = [...cssProperties].sort(compareProperties);

  const { extractPropertyChunk, findTrailingComment } = createPropertyChunkExtractor(sourceCode);
  const chunksByProperty = new Map<T, PropertyChunk>(
    cssProperties.map((property) => [
      property,
      extractPropertyChunk(extractNode(property) as unknown as OrderableNode),
    ]),
  );

  // Generate fixes for slots whose property has changed
  return cssProperties
    .map((slotProperty, slotIndex) => {
      const sortedProperty = sortedProperties[slotIndex];
      if (!sortedProperty || sortedProperty === slotProperty) {
        return null;
      }

      const slotChunk = chunksByProperty.get(slotProperty);
      const sortedChunk = chunksByProperty.get(sortedProperty);
      if (!slotChunk || !sortedChunk) {
        return null;
      }

      const slotNode = extractNode(slotProperty) as unknown as OrderableNode;

      // The replacement range spans the slot's whole attachable chunk: from
      // its first leading comment (if any) to the end of its trailing comma
      // and/or same-line trailing comment. This consumes the original
      // comments and punctuation so they are neither left behind nor doubled.
      const rangeStart = slotChunk.leadingCommentsStart ?? slotNode.range![0];
      let rangeEnd = slotNode.range![1];
      const tokenAfter = sourceCode.getTokenAfter(slotNode);
      if (tokenAfter && tokenAfter.value === ',' && tokenAfter.range![1] > rangeEnd) {
        rangeEnd = tokenAfter.range![1];
      }
      if (slotChunk.trailingCommentText !== null) {
        const trailingComment = findTrailingComment(slotNode);
        if (trailingComment && trailingComment.range![1] > rangeEnd) {
          rangeEnd = trailingComment.range![1];
        }
      }

      // Rebuild the incoming property's text, preserving the slot's comma
      // convention: if the original property in this slot had a trailing
      // comma, keep one; if not (typically the object's last property), don't.
      const slotHadTrailingComma = tokenAfter?.value === ',';
      const replacementText = [
        sortedChunk.leadingCommentsText,
        sortedChunk.nodeText,
        slotHadTrailingComma ? ',' : '',
        sortedChunk.trailingCommentText !== null
          ? `${slotHadTrailingComma ? ' ' : ''}${sortedChunk.trailingCommentText}`
          : '',
      ].join('');

      return eslintFixer.replaceTextRange([rangeStart, rangeEnd], replacementText);
    })
    .filter((fix): fix is Rule.Fix => fix !== null);
};
