import * as path from 'path';
import type { Rule } from 'eslint';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { processRecipeProperties } from '../shared-utils/recipe-property-processor.js';
import { ReferenceTracker, createReferenceTrackingVisitor } from '../shared-utils/reference-tracker.js';
import { processStyleNode } from '../shared-utils/style-node-processor.js';
import { ThemeContractAnalyzer } from './theme-contract-analyzer.js';
import { processThemeTokensInStyleObject, type ThemeTokenOptions } from './theme-token-processor.js';

/**
 * Creates ESLint rule visitors for the prefer-theme-tokens rule
 */
export const createThemeTokenVisitors = (context: Rule.RuleContext, options: ThemeTokenOptions): Rule.RuleListener => {
  const tracker = new ReferenceTracker();
  const trackingVisitor = createReferenceTrackingVisitor(tracker);
  
  // Initialize the theme contract analyzer
  const analyzer = new ThemeContractAnalyzer();
  
  // Set rem base if provided
  if (options.remBase) {
    analyzer.setRemBase(options.remBase);
  }
  
  // Load theme contracts if provided
  const themeContracts = options.themeContracts || [];
  if (themeContracts.length > 0) {
    // Use getCwd() to get project root, or fallback to linted file's directory
    const baseDir = context.getCwd ? context.getCwd() : path.dirname(context.filename || context.getFilename());
    
    themeContracts.forEach((contractPath: string) => {
      analyzer.loadThemeContract(contractPath, baseDir);
    });
  }

  const process = (context: Rule.RuleContext, object: TSESTree.ObjectExpression) =>
    processThemeTokensInStyleObject(context, object, options, analyzer);

  return {
    ...trackingVisitor,

    // Call the tracking visitor's ImportDeclaration handler
    ImportDeclaration(node) {
      if (trackingVisitor.ImportDeclaration) {
        trackingVisitor.ImportDeclaration(node);
      }
    },

    CallExpression(node) {
      if (node.callee.type !== AST_NODE_TYPES.Identifier) return;

      const functionName = node.callee.name;
      if (!tracker.isTrackedFunction(functionName)) return;

      const originalName = tracker.getOriginalName(functionName);
      if (!originalName) return;

      switch (originalName) {
        case 'fontFace':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            process(context, node.arguments[0] as TSESTree.ObjectExpression);
          }
          break;
        case 'globalFontFace':
          if (node.arguments.length > 1 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            process(context, node.arguments[1] as TSESTree.ObjectExpression);
          }
          break;
        case 'style':
        case 'styleVariants':
        case 'keyframes':
          if (node.arguments.length > 0) {
            processStyleNode(context, node.arguments[0] as TSESTree.Node, (context, object) =>
              process(context, object),
            );
          }
          break;
        case 'globalStyle':
          if (node.arguments.length > 1 && node.arguments[1]?.type === AST_NODE_TYPES.ObjectExpression) {
            process(context, node.arguments[1] as TSESTree.ObjectExpression);
          }
          break;
        case 'recipe':
        case 'compoundVariant':
          if (node.arguments.length > 0 && node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression) {
            processRecipeProperties(context, node.arguments[0] as TSESTree.ObjectExpression, (context, object) =>
              process(context, object),
            );
          }
          break;
        default:
          break;
      }
    },
  };
};
