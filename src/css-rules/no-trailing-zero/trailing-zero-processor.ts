import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';

/**
 * Regex to match numbers with trailing zeros.
 * Matches patterns like:
 * - 1.0, 2.50, 0.0, 0.50
 * - 1.0px, 2.50rem, 0.0em
 * - -1.0, -2.50px
 *
 * Groups:
 * 1: Optional minus sign
 * 2: Integer part
 * 3: Significant fractional digits (optional)
 * 4: Trailing zeros
 * 5: Optional unit
 */
const TRAILING_ZERO_REGEX = /^(-?)(\d+)\.(\d*[1-9])?(0+)([a-z%]+)?$/i;

/**
 * Checks if a value has trailing zeros and returns the fixed value if needed.
 *
 * @param value The string value to check
 * @returns Object with hasTrailingZero flag and fixed value, or null if no trailing zeros
 */
export const checkTrailingZero = (value: string): { hasTrailingZero: boolean; fixed: string } | null => {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(TRAILING_ZERO_REGEX);

  if (!match) {
    return null;
  }

  const [, minus = '', integerPart, significantFractional = '', , unit = ''] = match;

  // Handle special case: 0.0 or 0.00 etc. should become just "0"
  if (integerPart === '0' && !significantFractional) {
    return {
      hasTrailingZero: true,
      fixed: '0',
    };
  }

  // If there's no significant fractional part (e.g., "1.0" -> "1")
  if (!significantFractional) {
    return {
      hasTrailingZero: true,
      fixed: `${minus}${integerPart}${unit}`,
    };
  }

  // If there's a significant fractional part (e.g., "1.50" -> "1.5")
  return {
    hasTrailingZero: true,
    fixed: `${minus}${integerPart}.${significantFractional}${unit}`,
  };
};

/**
 * Processes a single string value and checks for trailing zeros in all numeric values.
 * Handles strings with multiple numeric values (e.g., "1.0px 2.50em").
 * Also handles values within function calls (e.g., "rotate(45.0deg)").
 *
 * @param value The string value to process
 * @returns Object with hasTrailingZero flag and fixed value, or null if no trailing zeros
 */
export const processStringValue = (value: string): { hasTrailingZero: boolean; fixed: string } | null => {
  // First, try to match the entire value
  const directMatch = checkTrailingZero(value);
  if (directMatch?.hasTrailingZero) {
    return directMatch;
  }

  // Split by whitespace to handle multiple values
  const parts = value.split(/(\s+)/);
  let hasAnyTrailingZero = false;

  const fixedParts = parts.map((part) => {
    // Preserve whitespace
    if (/^\s+$/.test(part)) {
      return part;
    }

    // Try to match the whole part first
    const result = checkTrailingZero(part);
    if (result?.hasTrailingZero) {
      hasAnyTrailingZero = true;
      return result.fixed;
    }

    // If no match, try to find and replace numbers within the part (e.g., inside function calls)
    const regex = /(-?\d+)\.(\d*[1-9])?(0+)(?![0-9])([a-z%]+)?/gi;
    const fixedPart = part.replace(
      regex,
      (_: string, integerWithSign: string, significantFractional: string, __: string, unit: string) => {
        // Reconstruct the number without trailing zeros
        const integerPart = integerWithSign;
        const sig = significantFractional || '';
        const u = unit || '';

        // Handle 0.0 case - if it's zero and no unit, return just '0', otherwise keep the unit
        if (integerPart === '0' && !sig) {
          hasAnyTrailingZero = true;
          return u ? `0${u}` : '0';
        }

        // Handle X.0 case
        if (!sig) {
          hasAnyTrailingZero = true;
          return `${integerPart}${u}`;
        }

        // Handle X.Y0 case
        hasAnyTrailingZero = true;
        return `${integerPart}.${sig}${u}`;
      },
    );

    return fixedPart;
  });

  if (!hasAnyTrailingZero) {
    return null;
  }

  return {
    hasTrailingZero: true,
    fixed: fixedParts.join(''),
  };
};

/**
 * Recursively processes a style object, reporting and fixing instances of trailing zeros in numeric values.
 *
 * @param ruleContext The ESLint rule context.
 * @param node The ObjectExpression node representing the style object to be processed.
 */
export const processTrailingZeroInStyleObject = (
  ruleContext: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
): void => {
  node.properties.forEach((property) => {
    if (property.type !== 'Property') {
      return;
    }

    // Process direct string literal values
    if (property.value.type === 'Literal' && typeof property.value.value === 'string') {
      const result = processStringValue(property.value.value);

      if (result?.hasTrailingZero) {
        ruleContext.report({
          node: property.value,
          messageId: 'trailingZero',
          data: {
            value: property.value.value,
            fixed: result.fixed,
          },
          fix: (fixer) => fixer.replaceText(property.value, `'${result.fixed}'`),
        });
      }
    }

    // Process numeric literal values (e.g., margin: 1.0)
    if (property.value.type === 'Literal' && typeof property.value.value === 'number') {
      // Use the raw property to get the original source text (which preserves trailing zeros)
      const rawValue = property.value.raw || property.value.value.toString();
      const result = checkTrailingZero(rawValue);

      if (result?.hasTrailingZero) {
        ruleContext.report({
          node: property.value,
          messageId: 'trailingZero',
          data: {
            value: rawValue,
            fixed: result.fixed,
          },
          fix: (fixer) => fixer.replaceText(property.value, result.fixed),
        });
      }
    }

    // Process nested objects (selectors, media queries, etc.)
    if (property.value.type === 'ObjectExpression') {
      processTrailingZeroInStyleObject(ruleContext, property.value);
    }

    // Process arrays (for styleVariants with array values)
    if (property.value.type === 'ArrayExpression') {
      property.value.elements.forEach((element) => {
        if (element && element.type === 'ObjectExpression') {
          processTrailingZeroInStyleObject(ruleContext, element);
        }
      });
    }
  });
};
