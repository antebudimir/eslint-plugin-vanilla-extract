 
import { parseExpression } from '@babel/parser';
import type {
  Expression,
  SpreadElement,
  PrivateName,
  TemplateLiteral,
  CallExpression,
  BinaryExpression,
} from '@babel/types';

/**
 * Safe evaluator for static theme values with support for:
 * - rem() from polished
 * - clsx() for combining values
 * - Template literals with expressions
 * - Basic arithmetic
 */
export class ValueEvaluator {
  private remBase: number;

  constructor(remBase: number = 16) {
    this.remBase = remBase;
  }

  /**
   * Evaluate a string expression to a concrete value
   */
  evaluate(expression: string): string | null {
    try {
      const ast = parseExpression(expression, {
        sourceType: 'module',
        plugins: ['typescript'],
      });
      return this.evaluateNode(ast);
    } catch {
      // If parsing fails, return the original expression if it's a simple string
      const trimmed = expression.trim();
      if (
        (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith('`') && trimmed.endsWith('`'))
      ) {
        return trimmed.slice(1, -1);
      }
      return null;
    }
  }

  /**
   * Evaluate an AST node
   */
  private evaluateNode(node: Expression | SpreadElement | PrivateName | null): string | null {
    if (!node) return null;

    switch (node.type) {
      case 'StringLiteral':
        return node.value;

      case 'NumericLiteral':
        return String(node.value);

      case 'TemplateLiteral':
        return this.evaluateTemplateLiteral(node);

      case 'CallExpression':
        return this.evaluateCallExpression(node);

      case 'BinaryExpression':
        return this.evaluateBinaryExpression(node);

      case 'Identifier':
        // Only allow known safe identifiers
        return null;

      case 'MemberExpression':
        // Don't evaluate member expressions for security
        return null;

      default:
        return null;
    }
  }

  /**
   * Evaluate a template literal
   */
  private evaluateTemplateLiteral(node: TemplateLiteral): string | null {
    const parts: string[] = [];

    for (let i = 0; i < node.quasis.length; i++) {
      // Add the string part
      const quasi = node.quasis[i];
      if (!quasi) continue;
      parts.push(quasi.value.cooked || quasi.value.raw);

      // Add the expression part if it exists
      if (i < node.expressions.length) {
        const exprValue = this.evaluateNode(node.expressions[i] as Expression);
        if (exprValue === null) {
          return null; // Can't evaluate this expression
        }
        parts.push(exprValue);
      }
    }

    return parts.join('');
  }

  /**
   * Evaluate a call expression (rem, clsx, etc.)
   */
  private evaluateCallExpression(node: CallExpression): string | null {
    // Get function name
    let functionName: string | null = null;
    if (node.callee.type === 'Identifier') {
      functionName = node.callee.name;
    } else if (node.callee.type === 'MemberExpression' && 
               node.callee.property.type === 'Identifier') {
      functionName = node.callee.property.name;
    }

    if (!functionName) return null;

    switch (functionName) {
      case 'rem':
        return this.evaluateRem(node);
      case 'clsx':
        return this.evaluateClsx(node);
      default:
        return null;
    }
  }

  /**
   * Evaluate rem() function from polished
   */
  private evaluateRem(node: CallExpression): string | null {
    if (node.arguments.length === 0) return null;

    const arg = node.arguments[0];
    if (!arg || arg.type === 'SpreadElement') return null;

    const value = this.evaluateNode(arg as Expression);
    if (value === null) return null;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    // Convert pixels to rem
    const remValue = numValue / this.remBase;
    return `${remValue}rem`;
  }

  /**
   * Evaluate clsx() function
   */
  private evaluateClsx(node: CallExpression): string | null {
    const parts: string[] = [];

    for (const arg of node.arguments) {
      if (arg.type === 'SpreadElement') return null;

      const value = this.evaluateNode(arg as Expression);
      if (value === null) return null;

      parts.push(value);
    }

    return parts.join(' ');
  }

  /**
   * Evaluate binary expression (mainly for string concatenation)
   */
  private evaluateBinaryExpression(node: BinaryExpression): string | null {
    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);

    if (left === null || right === null) return null;

    switch (node.operator) {
      case '+':
        // String concatenation or addition
        const leftNum = parseFloat(left);
        const rightNum = parseFloat(right);
        if (!isNaN(leftNum) && !isNaN(rightNum)) {
          return String(leftNum + rightNum);
        }
        return left + right;

      case '-':
        const leftNum2 = parseFloat(left);
        const rightNum2 = parseFloat(right);
        if (!isNaN(leftNum2) && !isNaN(rightNum2)) {
          return String(leftNum2 - rightNum2);
        }
        return null;

      case '*':
        const leftNum3 = parseFloat(left);
        const rightNum3 = parseFloat(right);
        if (!isNaN(leftNum3) && !isNaN(rightNum3)) {
          return String(leftNum3 * rightNum3);
        }
        return null;

      case '/':
        const leftNum4 = parseFloat(left);
        const rightNum4 = parseFloat(right);
        if (!isNaN(leftNum4) && !isNaN(rightNum4) && rightNum4 !== 0) {
          return String(leftNum4 / rightNum4);
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Set rem base for evaluation
   */
  setRemBase(base: number): void {
    this.remBase = base;
  }
}
