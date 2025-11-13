import type { Rule } from 'eslint';
import { createThemeTokenVisitors } from './theme-token-visitor-creator.js';
import type { ThemeTokenOptions } from './theme-token-processor.js';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require theme tokens instead of hard-coded values for colors, spacing, font sizes, and border radius',
      recommended: false,
    },
    fixable: 'code',
    // Suggestions are reported from helper modules, so static analysis in this file can’t detect them; disable the false positive.
    // eslint-disable-next-line eslint-plugin/require-meta-has-suggestions
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          themeContracts: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of theme contract file paths to analyze for intelligent token suggestions',
          },
          checkColors: {
            type: 'boolean',
            description: 'Check for hard-coded color values',
            default: true,
          },
          checkSpacing: {
            type: 'boolean',
            description: 'Check for hard-coded spacing values',
            default: true,
          },
          checkFontSizes: {
            type: 'boolean',
            description: 'Check for hard-coded font size values',
            default: true,
          },
          checkBorderRadius: {
            type: 'boolean',
            description: 'Check for hard-coded border radius values',
            default: true,
          },
          checkBorderWidths: {
            type: 'boolean',
            description: 'Check for hard-coded border width values',
            default: true,
          },
          checkShadows: {
            type: 'boolean',
            description: 'Check for hard-coded shadow values',
            default: true,
          },
          checkZIndex: {
            type: 'boolean',
            description: 'Check for hard-coded z-index values',
            default: true,
          },
          checkOpacity: {
            type: 'boolean',
            description: 'Check for hard-coded opacity values',
            default: true,
          },
          checkFontWeights: {
            type: 'boolean',
            description: 'Check for hard-coded font weight values',
            default: true,
          },
          checkTransitions: {
            type: 'boolean',
            description: 'Check for hard-coded transition and animation values',
            default: true,
          },
          allowedValues: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of values that are allowed (e.g., "0", "auto", "100%")',
          },
          allowedProperties: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of CSS properties to skip checking (supports both camelCase and kebab-case)',
          },
          autoFix: {
            type: 'boolean',
            description: 'Enable auto-fix for unambiguous token replacements',
            default: false,
          },
          remBase: {
            type: 'number',
            description: 'Base font size for rem() calculations (default: 16)',
            default: 16,
          },
          checkHelperFunctions: {
            type: 'boolean',
            description: 'Check helper function calls like rem(48) and suggest theme tokens (default: false)',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardCodedValueWithToken: "Hard-coded {{property}} value '{{value}}' detected. Use theme token: {{tokenPath}}",
      hardCodedValueGeneric:
        "Hard-coded {{property}} value '{{value}}' detected. Consider using a theme token from {{categoryHint}}",
      hardCodedValueNoContract:
        "Hard-coded {{property}} value '{{value}}' detected. Consider using theme tokens for {{category}} values",
      replaceWithToken: 'Replace with {{tokenPath}}',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    const options: ThemeTokenOptions = context.options[0] || {};
    return createThemeTokenVisitors(context, options);
  },
};

export default rule;
