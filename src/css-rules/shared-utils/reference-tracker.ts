import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/utils';

export interface ImportReference {
  source: string;
  importedName: string;
  localName: string;
}

export interface WrapperFunctionInfo {
  originalFunction: string; // 'style', 'recipe', etc.
  parameterMapping: number; // which parameter index contains the style object
  objectPath?: string[]; // path to the style object within the parameter (e.g., ['@layer', 'componentLayer'])
}

export interface TrackedFunctions {
  styleFunctions: Set<string>;
  recipeFunctions: Set<string>;
  fontFaceFunctions: Set<string>;
  globalFunctions: Set<string>;
  keyframeFunctions: Set<string>;
}

/**
 * Tracks vanilla-extract function imports and their local bindings
 */
export class ReferenceTracker {
  private imports: Map<string, ImportReference> = new Map();
  private trackedFunctions: TrackedFunctions;
  private wrapperFunctions: Map<string, WrapperFunctionInfo> = new Map(); // wrapper function name -> detailed info

  constructor() {
    this.trackedFunctions = {
      styleFunctions: new Set(),
      recipeFunctions: new Set(),
      fontFaceFunctions: new Set(),
      globalFunctions: new Set(),
      keyframeFunctions: new Set(),
    };
  }

  /**
   * Processes import declarations to track vanilla-extract functions
   */
  processImportDeclaration(node: TSESTree.ImportDeclaration): void {
    const source = node.source.value;

    // Check if this is a vanilla-extract import
    if (typeof source !== 'string' || !this.isVanillaExtractSource(source)) {
      return;
    }

    node.specifiers.forEach((specifier) => {
      if (specifier.type === 'ImportSpecifier') {
        const importedName =
          specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value;
        const localName = specifier.local.name;

        const reference: ImportReference = {
          source,
          importedName,
          localName,
        };

        this.imports.set(localName, reference);
        this.categorizeFunction(localName, importedName);
      }
    });
  }

  /**
   * Processes variable declarations to track re-assignments and destructuring
   */
  processVariableDeclarator(node: TSESTree.VariableDeclarator): void {
    // Handle destructuring assignments like: const { style, recipe } = vanillaExtract;
    if (node.id.type === 'ObjectPattern' && node.init?.type === 'Identifier') {
      const sourceIdentifier = node.init.name;
      const sourceReference = this.imports.get(sourceIdentifier);

      if (sourceReference && this.isVanillaExtractSource(sourceReference.source)) {
        node.id.properties.forEach((property) => {
          if (
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.value.type === 'Identifier'
          ) {
            const importedName = property.key.name;
            const localName = property.value.name;

            const reference: ImportReference = {
              source: sourceReference.source,
              importedName,
              localName,
            };

            this.imports.set(localName, reference);
            this.categorizeFunction(localName, importedName);
          }
        });
      }
    }

    // Handle simple assignments like: const myStyle = style;
    if (node.id.type === 'Identifier' && node.init?.type === 'Identifier') {
      const sourceReference = this.imports.get(node.init.name);
      if (sourceReference) {
        this.imports.set(node.id.name, sourceReference);
        this.categorizeFunction(node.id.name, sourceReference.importedName);
      }
    }

    // Handle arrow function assignments that wrap vanilla-extract functions
    if (node.id.type === 'Identifier' && node.init?.type === 'ArrowFunctionExpression') {
      this.analyzeWrapperFunction(node.id.name, node.init);
    }
  }

  /**
   * Processes function declarations to detect wrapper functions
   */
  processFunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
    if (node.id?.name) {
      this.analyzeWrapperFunction(node.id.name, node);
    }
  }

  /**
   * Analyzes a function to see if it wraps a vanilla-extract function
   */
  private analyzeWrapperFunction(
    functionName: string,
    functionNode: TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration,
  ): void {
    const body = functionNode.body;

    // Handle arrow functions with expression body
    if (functionNode.type === 'ArrowFunctionExpression' && body.type !== 'BlockStatement') {
      this.analyzeWrapperExpression(functionName, body);
      return;
    }

    // Handle functions with block statement body
    if (body.type === 'BlockStatement') {
      this.traverseBlockForVanillaExtractCalls(functionName, body);
    }
  }

  /**
   * Analyzes a wrapper function expression to detect vanilla-extract calls and parameter mapping
   */
  private analyzeWrapperExpression(wrapperName: string, expression: TSESTree.Node): void {
    if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
      const calledFunction = expression.callee.name;
      if (this.isTrackedFunction(calledFunction)) {
        const originalName = this.getOriginalName(calledFunction);
        if (originalName) {
          // For now, create a simple wrapper info
          const wrapperInfo: WrapperFunctionInfo = {
            originalFunction: originalName,
            parameterMapping: 1, // layerStyle uses second parameter as the style object
          };
          this.wrapperFunctions.set(wrapperName, wrapperInfo);
          this.categorizeFunction(wrapperName, originalName);
        }
      }
    }
  }

  /**
   * Checks if a node is a vanilla-extract function call
   */
  private checkForVanillaExtractCall(wrapperName: string, node: TSESTree.Node): void {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      const calledFunction = node.callee.name;
      if (this.isTrackedFunction(calledFunction)) {
        const originalName = this.getOriginalName(calledFunction);
        if (originalName) {
          const wrapperInfo: WrapperFunctionInfo = {
            originalFunction: originalName,
            parameterMapping: 0, // Default to first parameter
          };
          this.wrapperFunctions.set(wrapperName, wrapperInfo);
          this.categorizeFunction(wrapperName, originalName);
        }
      }
    }
  }

  /**
   * Traverses a block statement to find vanilla-extract calls
   */
  private traverseBlockForVanillaExtractCalls(wrapperName: string, block: TSESTree.BlockStatement): void {
    for (const statement of block.body) {
      if (statement.type === 'ReturnStatement' && statement.argument) {
        this.checkForVanillaExtractCall(wrapperName, statement.argument);
      } else if (statement.type === 'ExpressionStatement') {
        this.checkForVanillaExtractCall(wrapperName, statement.expression);
      }
    }
  }

  /**
   * Checks if a function name corresponds to a tracked vanilla-extract function
   */
  isTrackedFunction(functionName: string): boolean {
    return this.imports.has(functionName) || this.wrapperFunctions.has(functionName);
  }

  /**
   * Gets the category of a tracked function
   */
  getFunctionCategory(functionName: string): keyof TrackedFunctions | null {
    if (this.trackedFunctions.styleFunctions.has(functionName)) {
      return 'styleFunctions';
    }
    if (this.trackedFunctions.recipeFunctions.has(functionName)) {
      return 'recipeFunctions';
    }
    if (this.trackedFunctions.fontFaceFunctions.has(functionName)) {
      return 'fontFaceFunctions';
    }
    if (this.trackedFunctions.globalFunctions.has(functionName)) {
      return 'globalFunctions';
    }
    if (this.trackedFunctions.keyframeFunctions.has(functionName)) {
      return 'keyframeFunctions';
    }
    return null;
  }

  /**
   * Gets the original imported name for a local function name
   */
  getOriginalName(localName: string): string | null {
    const reference = this.imports.get(localName);
    if (reference) {
      return reference.importedName;
    }

    // Check if it's a wrapper function
    const wrapperInfo = this.wrapperFunctions.get(localName);
    return wrapperInfo?.originalFunction ?? null;
  }

  /**
   * Gets wrapper function information
   */
  getWrapperInfo(functionName: string): WrapperFunctionInfo | null {
    return this.wrapperFunctions.get(functionName) ?? null;
  }

  /**
   * Gets all tracked functions by category
   */
  getTrackedFunctions(): TrackedFunctions {
    return this.trackedFunctions;
  }

  /**
   * Resets the tracker state (useful for processing multiple files)
   */
  reset(): void {
    this.imports.clear();
    this.wrapperFunctions.clear();
    this.trackedFunctions.styleFunctions.clear();
    this.trackedFunctions.recipeFunctions.clear();
    this.trackedFunctions.fontFaceFunctions.clear();
    this.trackedFunctions.globalFunctions.clear();
    this.trackedFunctions.keyframeFunctions.clear();
  }

  private isVanillaExtractSource(source: string): boolean {
    return (
      source === '@vanilla-extract/css' ||
      source === '@vanilla-extract/recipes' ||
      source.startsWith('@vanilla-extract/')
    );
  }

  private categorizeFunction(localName: string, importedName: string): void {
    switch (importedName) {
      case 'style':
      case 'styleVariants':
        this.trackedFunctions.styleFunctions.add(localName);
        break;
      case 'recipe':
        this.trackedFunctions.recipeFunctions.add(localName);
        break;
      case 'fontFace':
      case 'globalFontFace':
        this.trackedFunctions.fontFaceFunctions.add(localName);
        break;
      case 'globalStyle':
      case 'globalKeyframes':
        this.trackedFunctions.globalFunctions.add(localName);
        break;
      case 'keyframes':
        this.trackedFunctions.keyframeFunctions.add(localName);
        break;
    }
  }
}

/**
 * Creates a visitor that tracks vanilla-extract imports and bindings
 */
export function createReferenceTrackingVisitor(tracker: ReferenceTracker): Rule.RuleListener {
  return {
    ImportDeclaration(node: Rule.Node) {
      tracker.processImportDeclaration(node as TSESTree.ImportDeclaration);
    },

    VariableDeclarator(node: Rule.Node) {
      tracker.processVariableDeclarator(node as TSESTree.VariableDeclarator);
    },

    FunctionDeclaration(node: Rule.Node) {
      tracker.processFunctionDeclaration(node as TSESTree.FunctionDeclaration);
    },
  };
}
