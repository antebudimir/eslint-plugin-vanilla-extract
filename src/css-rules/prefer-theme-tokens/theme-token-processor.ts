import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { ValueEvaluator } from './value-evaluator.js';
import type { ThemeContractAnalyzer, TokenInfo } from './theme-contract-analyzer.js';

export interface ThemeTokenOptions {
  themeContracts?: string[];
  checkColors?: boolean;
  checkSpacing?: boolean;
  checkFontSizes?: boolean;
  checkBorderRadius?: boolean;
  checkBorderWidths?: boolean;
  checkShadows?: boolean;
  checkZIndex?: boolean;
  checkOpacity?: boolean;
  checkFontWeights?: boolean;
  checkTransitions?: boolean;
  allowedValues?: string[];
  allowedProperties?: string[];
  autoFix?: boolean;
  remBase?: number;
  checkHelperFunctions?: boolean;
}

// Color detection patterns
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR = /^rgba?\s*\(/i;
const HSL_COLOR = /^hsla?\s*\(/i;
const NAMED_COLORS = new Set([
  'black',
  'white',
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'purple',
  'pink',
  'gray',
  'grey',
  'brown',
  'cyan',
  'magenta',
  'lime',
  'navy',
  'teal',
  'olive',
  'maroon',
  'aqua',
  'fuchsia',
  'silver',
  'gold',
  'indigo',
  'violet',
  'tan',
]);

// CSS keywords that should be allowed
const ALLOWED_KEYWORDS = new Set(['transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'revert']);

// Spacing-related properties
const SPACING_PROPERTIES = new Set([
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingBlock',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInline',
  'paddingInlineStart',
  'paddingInlineEnd',
  'gap',
  'rowGap',
  'columnGap',
  'gridGap',
  'gridRowGap',
  'gridColumnGap',
  'inset',
  'insetBlock',
  'insetBlockStart',
  'insetBlockEnd',
  'insetInline',
  'insetInlineStart',
  'insetInlineEnd',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'blockSize',
  'inlineSize',
  'minBlockSize',
  'minInlineSize',
  'maxBlockSize',
  'maxInlineSize',
]);

// Font size properties
const FONT_SIZE_PROPERTIES = new Set(['fontSize', 'lineHeight']);

// Border radius properties
const BORDER_RADIUS_PROPERTIES = new Set([
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndRadius',
]);

// Border width properties
const BORDER_WIDTH_PROPERTIES = new Set([
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderBlockWidth',
  'borderBlockStartWidth',
  'borderBlockEndWidth',
  'borderInlineWidth',
  'borderInlineStartWidth',
  'borderInlineEndWidth',
  'outlineWidth',
  'columnRuleWidth',
  // Shorthands that include width
  'border',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'borderBlock',
  'borderBlockStart',
  'borderBlockEnd',
  'borderInline',
  'borderInlineStart',
  'borderInlineEnd',
  'outline',
]);

// Shadow properties
const SHADOW_PROPERTIES = new Set(['boxShadow', 'textShadow', 'filter', 'backdropFilter']);

// Z-index property
const Z_INDEX_PROPERTIES = new Set(['zIndex']);

// Opacity property
const OPACITY_PROPERTIES = new Set(['opacity']);

// Font weight properties
const FONT_WEIGHT_PROPERTIES = new Set(['fontWeight']);

// Transition and animation properties
const TRANSITION_PROPERTIES = new Set([
  'transition',
  'transitionDelay',
  'transitionDuration',
  'transitionTimingFunction',
  'animation',
  'animationDelay',
  'animationDuration',
  'animationTimingFunction',
]);

// Color properties
const COLOR_PROPERTIES = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderBlockStartColor',
  'borderBlockEndColor',
  'borderInlineStartColor',
  'borderInlineEndColor',
  'outlineColor',
  'textDecorationColor',
  'caretColor',
  'columnRuleColor',
  'fill',
  'stroke',
]);

const isHardCodedColor = (value: string): boolean => {
  if (ALLOWED_KEYWORDS.has(value.toLowerCase())) {
    return false;
  }
  return (
    HEX_COLOR.test(value) || RGB_COLOR.test(value) || HSL_COLOR.test(value) || NAMED_COLORS.has(value.toLowerCase())
  );
};

const hasNumericValue = (value: string): boolean => {
  // Match numeric values with units (e.g., 10px, 1rem, 2em, 50%, etc.)
  return /\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)/.test(value);
};

const hasShadowValue = (value: string): boolean => {
  // Match shadow values (e.g., "0 4px 6px rgba(...)", "inset 0 1px 2px #000")
  // Also matches filter functions like blur(), drop-shadow()
  return /(\d+px|\d+rem|rgba?\(|hsla?\(|#[0-9a-f]{3,8}|blur\(|drop-shadow\(|brightness\(|contrast\()/.test(
    value.toLowerCase(),
  );
};

const hasZIndexValue = (value: string): boolean => {
  // Match numeric z-index values
  return /^-?\d+$/.test(value.trim());
};

const hasOpacityValue = (value: string): boolean => {
  // Match opacity values (0-1 or percentages)
  return /^(0?\.\d+|1(\.0+)?|\d+%)$/.test(value.trim());
};

const hasFontWeightValue = (value: string): boolean => {
  // Match font weight values (numeric or named)
  const namedWeights = ['normal', 'bold', 'bolder', 'lighter'];
  const trimmed = value.trim().toLowerCase();
  return /^[1-9]00$/.test(trimmed) || namedWeights.includes(trimmed);
};

const hasTransitionValue = (value: string): boolean => {
  // Match transition/animation values (e.g., "0.3s", "200ms", "ease-in-out", "cubic-bezier(...)")
  return /(^\d+(\.\d+)?(s|ms)$|ease|linear|cubic-bezier\(|steps\()/.test(value.toLowerCase());
};

const isAllowedValue = (value: string, allowedValues: Set<string>): boolean => {
  const trimmed = value.trim();
  return (
    allowedValues.has(trimmed) ||
    allowedValues.has(trimmed.toLowerCase()) ||
    trimmed === '0' ||
    trimmed === 'auto' ||
    trimmed === 'none' ||
    trimmed === 'inherit' ||
    trimmed === 'initial' ||
    trimmed === 'unset' ||
    /^\d+(\.\d+)?%$/.test(trimmed)
  ); // Allow percentages
};

const normalizePropertyName = (name: string): string => {
  // Convert kebab-case to camelCase
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
};

/**
 * Recursively processes a vanilla-extract style object and reports hard-coded values
 * that should use theme tokens instead.
 */
export const processThemeTokensInStyleObject = (
  context: Rule.RuleContext,
  node: TSESTree.ObjectExpression,
  options: ThemeTokenOptions,
  analyzer: ThemeContractAnalyzer,
): void => {
  const {
    checkColors = true,
    checkSpacing = true,
    checkFontSizes = true,
    checkBorderRadius = true,
    checkBorderWidths = true,
    checkShadows = true,
    checkZIndex = true,
    checkOpacity = true,
    checkFontWeights = true,
    checkTransitions = true,
    allowedValues = [],
    allowedProperties = [],
    autoFix = false,
    checkHelperFunctions = false,
  } = options;

  const evaluator = new ValueEvaluator();

  const allowedValuesSet = new Set(allowedValues);
  const allowedPropertiesSet = new Set([...allowedProperties.map(normalizePropertyName), ...allowedProperties]);

  for (const property of node.properties) {
    if (property.type !== AST_NODE_TYPES.Property) continue;

    // Determine property name
    let propertyName: string | null = null;
    if (property.key.type === AST_NODE_TYPES.Identifier) {
      propertyName = property.key.name;
    } else if (property.key.type === AST_NODE_TYPES.Literal && typeof property.key.value === 'string') {
      propertyName = property.key.value;
    }

    // Recurse into nested containers (@media, selectors, etc.)
    if (propertyName && (propertyName === '@media' || propertyName === 'selectors' || propertyName.startsWith('@'))) {
      if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
        for (const nestedProp of property.value.properties) {
          if (
            nestedProp.type === AST_NODE_TYPES.Property &&
            nestedProp.value.type === AST_NODE_TYPES.ObjectExpression
          ) {
            processThemeTokensInStyleObject(context, nestedProp.value, options, analyzer);
          }
        }
      }
      continue;
    }

    if (!propertyName) continue;

    // Skip if property is in allowed list
    if (allowedPropertiesSet.has(propertyName) || allowedPropertiesSet.has(normalizePropertyName(propertyName))) {
      continue;
    }

    // Check if property value is a literal (string or number)
    if (
      property.value.type === AST_NODE_TYPES.Literal &&
      (typeof property.value.value === 'string' || typeof property.value.value === 'number')
    ) {
      const value = String(property.value.value);

      // Skip if value is in allowed list
      if (isAllowedValue(value, allowedValuesSet)) {
        continue;
      }

      // Check for hard-coded colors
      if (checkColors && COLOR_PROPERTIES.has(propertyName) && isHardCodedColor(value)) {
        reportHardCodedValue(context, property.value, value, 'color', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded spacing
      if (checkSpacing && SPACING_PROPERTIES.has(propertyName) && hasNumericValue(value)) {
        reportHardCodedValue(context, property.value, value, 'spacing', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded font sizes
      if (checkFontSizes && FONT_SIZE_PROPERTIES.has(propertyName) && hasNumericValue(value)) {
        reportHardCodedValue(context, property.value, value, 'fontSize', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded border radius
      if (checkBorderRadius && BORDER_RADIUS_PROPERTIES.has(propertyName) && hasNumericValue(value)) {
        reportHardCodedValue(context, property.value, value, 'borderRadius', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded border widths
      if (checkBorderWidths && BORDER_WIDTH_PROPERTIES.has(propertyName) && hasNumericValue(value)) {
        reportHardCodedValue(context, property.value, value, 'borderWidth', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded shadows
      if (checkShadows && SHADOW_PROPERTIES.has(propertyName) && hasShadowValue(value)) {
        reportHardCodedValue(context, property.value, value, 'shadow', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded z-index
      if (checkZIndex && Z_INDEX_PROPERTIES.has(propertyName) && hasZIndexValue(value)) {
        reportHardCodedValue(context, property.value, value, 'zIndex', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded opacity
      if (checkOpacity && OPACITY_PROPERTIES.has(propertyName) && hasOpacityValue(value)) {
        reportHardCodedValue(context, property.value, value, 'opacity', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded font weights
      if (checkFontWeights && FONT_WEIGHT_PROPERTIES.has(propertyName) && hasFontWeightValue(value)) {
        reportHardCodedValue(context, property.value, value, 'fontWeight', propertyName, analyzer, autoFix);
        continue;
      }

      // Check for hard-coded transitions
      if (checkTransitions && TRANSITION_PROPERTIES.has(propertyName) && hasTransitionValue(value)) {
        reportHardCodedValue(context, property.value, value, 'transition', propertyName, analyzer, autoFix);
      }
    }

    // Check if property value is a TemplateLiteral (e.g., `${rem(4)} ${rem(8)}`)
    if (checkHelperFunctions && property.value.type === AST_NODE_TYPES.TemplateLiteral) {
      // Get the source code of the template literal
      const sourceCode = context.sourceCode || context.getSourceCode();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const templateText = sourceCode.getText(property.value as any);

      // Try to evaluate it
      const evaluatedValue = evaluator.evaluate(templateText);

      if (evaluatedValue) {
        // Check for hard-coded colors
        if (checkColors && COLOR_PROPERTIES.has(propertyName) && isHardCodedColor(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'color', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded spacing
        if (checkSpacing && SPACING_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'spacing', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded font sizes
        if (checkFontSizes && FONT_SIZE_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'fontSize', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded border radius
        if (checkBorderRadius && BORDER_RADIUS_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(
            context,
            property.value,
            evaluatedValue,
            'borderRadius',
            propertyName,
            analyzer,
            autoFix,
          );
          continue;
        }

        // Check for hard-coded border widths
        if (checkBorderWidths && BORDER_WIDTH_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'borderWidth', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded shadows
        if (checkShadows && SHADOW_PROPERTIES.has(propertyName) && hasShadowValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'shadow', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded z-index
        if (checkZIndex && Z_INDEX_PROPERTIES.has(propertyName) && hasZIndexValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'zIndex', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded opacity
        if (checkOpacity && OPACITY_PROPERTIES.has(propertyName) && hasOpacityValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'opacity', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded font weights
        if (checkFontWeights && FONT_WEIGHT_PROPERTIES.has(propertyName) && hasFontWeightValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'fontWeight', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded transitions
        if (checkTransitions && TRANSITION_PROPERTIES.has(propertyName) && hasTransitionValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'transition', propertyName, analyzer, autoFix);
        }
      }
    }

    // Check if property value is a CallExpression (e.g., rem(48), clsx(...))
    if (checkHelperFunctions && property.value.type === AST_NODE_TYPES.CallExpression) {
      // Get the source code of the call expression
      const sourceCode = context.sourceCode || context.getSourceCode();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callExpressionText = sourceCode.getText(property.value as any);

      // Try to evaluate it
      const evaluatedValue = evaluator.evaluate(callExpressionText);

      if (evaluatedValue) {
        // Check for hard-coded colors
        if (checkColors && COLOR_PROPERTIES.has(propertyName) && isHardCodedColor(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'color', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded spacing
        if (checkSpacing && SPACING_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'spacing', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded font sizes
        if (checkFontSizes && FONT_SIZE_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'fontSize', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded border radius
        if (checkBorderRadius && BORDER_RADIUS_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(
            context,
            property.value,
            evaluatedValue,
            'borderRadius',
            propertyName,
            analyzer,
            autoFix,
          );
          continue;
        }

        // Check for hard-coded border widths
        if (checkBorderWidths && BORDER_WIDTH_PROPERTIES.has(propertyName) && hasNumericValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'borderWidth', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded shadows
        if (checkShadows && SHADOW_PROPERTIES.has(propertyName) && hasShadowValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'shadow', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded z-index
        if (checkZIndex && Z_INDEX_PROPERTIES.has(propertyName) && hasZIndexValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'zIndex', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded opacity
        if (checkOpacity && OPACITY_PROPERTIES.has(propertyName) && hasOpacityValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'opacity', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded font weights
        if (checkFontWeights && FONT_WEIGHT_PROPERTIES.has(propertyName) && hasFontWeightValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'fontWeight', propertyName, analyzer, autoFix);
          continue;
        }

        // Check for hard-coded transitions
        if (checkTransitions && TRANSITION_PROPERTIES.has(propertyName) && hasTransitionValue(evaluatedValue)) {
          reportHardCodedValue(context, property.value, evaluatedValue, 'transition', propertyName, analyzer, autoFix);
        }
      }
    }

    // Recurse into nested objects
    if (property.value.type === AST_NODE_TYPES.ObjectExpression) {
      processThemeTokensInStyleObject(context, property.value, options, analyzer);
    }
  }
};

/**
 * Report a hard-coded value and suggest theme tokens
 */

const reportHardCodedValue = (
  context: Rule.RuleContext,
  node: TSESTree.Literal | TSESTree.CallExpression | TSESTree.TemplateLiteral,
  value: string,
  category: TokenInfo['category'],
  propertyName: string,
  analyzer: ThemeContractAnalyzer,
  autoFix: boolean,
): void => {
  // Find matching tokens from the theme contract
  const matchingTokens = analyzer.findMatchingTokens(value, category);

  if (matchingTokens.length > 0) {
    // We have exact matches - suggest the specific token(s)
    const primaryToken = matchingTokens[0];
    if (!primaryToken) return;

    const tokenPath = primaryToken.tokenPath;

    const suggestions: Rule.SuggestionReportDescriptor[] = matchingTokens.map((token) => ({
      messageId: 'replaceWithToken',
      data: { tokenPath: token.tokenPath },
      fix: (fixer) => fixer.replaceText(node as unknown as Rule.Node, token.tokenPath),
    }));

    const reportDescriptor: Rule.ReportDescriptor = {
      node: node as unknown as Rule.Node,
      messageId: 'hardCodedValueWithToken',
      data: {
        value,
        property: propertyName,
        tokenPath,
      },
      suggest: suggestions,
    };

    // Add fix if autoFix is enabled
    // Only auto-fix when there's exactly one match (unambiguous)
    // For multiple matches, user must manually select from suggestions
    if (autoFix && matchingTokens.length === 1) {
      reportDescriptor.fix = (fixer) => fixer.replaceText(node as unknown as Rule.Node, tokenPath);
    }

    context.report(reportDescriptor);
  } else if (analyzer.hasContracts()) {
    // Theme contract exists but no exact match - give generic suggestion
    const categoryHint = getCategoryHint(category, analyzer.getVariableName());

    context.report({
      node: node as unknown as Rule.Node,
      messageId: 'hardCodedValueGeneric',
      data: {
        value,
        property: propertyName,
        categoryHint,
      },
    });
  } else {
    // No theme contract loaded - give very generic message
    context.report({
      node: node as unknown as Rule.Node,
      messageId: 'hardCodedValueNoContract',
      data: {
        value,
        property: propertyName,
        category: getCategoryName(category),
      },
    });
  }
};

/**
 * Get a helpful hint for the category
 */
const getCategoryHint = (category: TokenInfo['category'], variableName: string): string => {
  switch (category) {
    case 'color':
      return `${variableName}.colors.*`;
    case 'spacing':
      return `${variableName}.spacing.*`;
    case 'fontSize':
      return `${variableName}.fontSizes.*`;
    case 'borderRadius':
      return `${variableName}.radii.*`;
    case 'borderWidth':
      return `${variableName}.borderWidths.*`;
    case 'shadow':
      return `${variableName}.shadows.*`;
    case 'zIndex':
      return `${variableName}.zIndex.*`;
    case 'opacity':
      return `${variableName}.opacity.*`;
    case 'fontWeight':
      return `${variableName}.fontWeights.*`;
    case 'transition':
      return `${variableName}.transitions.*`;
    default:
      return `${variableName}.*`;
  }
};

/**
 * Get a readable category name
 */
const getCategoryName = (category: TokenInfo['category']): string => {
  switch (category) {
    case 'color':
      return 'color';
    case 'spacing':
      return 'spacing';
    case 'fontSize':
      return 'font size';
    case 'borderRadius':
      return 'border radius';
    case 'borderWidth':
      return 'border width';
    case 'shadow':
      return 'shadow';
    case 'zIndex':
      return 'z-index';
    case 'opacity':
      return 'opacity';
    case 'fontWeight':
      return 'font weight';
    case 'transition':
      return 'transition';
    default:
      return 'value';
  }
};
