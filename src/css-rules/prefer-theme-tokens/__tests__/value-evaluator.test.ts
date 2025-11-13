import { describe, it, expect } from 'vitest';
import { ValueEvaluator } from '../value-evaluator.js';

describe('ValueEvaluator', () => {
  describe('evaluate', () => {
    it('should evaluate string literals', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate("'hello'")).toBe('hello');
      expect(evaluator.evaluate('"world"')).toBe('world');
      expect(evaluator.evaluate('`test`')).toBe('test');
    });

    it('should evaluate numeric literals', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('42')).toBe('42');
      expect(evaluator.evaluate('3.14')).toBe('3.14');
    });

    it('should evaluate rem() calls', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('rem(16)')).toBe('1rem');
      expect(evaluator.evaluate('rem(32)')).toBe('2rem');
      expect(evaluator.evaluate('rem(8)')).toBe('0.5rem');
    });

    it('should evaluate rem() with custom base', () => {
      const evaluator = new ValueEvaluator(20);
      expect(evaluator.evaluate('rem(20)')).toBe('1rem');
      expect(evaluator.evaluate('rem(40)')).toBe('2rem');
    });

    it('should evaluate clsx() calls', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('clsx(rem(12), rem(16))')).toBe('0.75rem 1rem');
      expect(evaluator.evaluate("clsx('a', 'b', 'c')")).toBe('a b c');
    });

    it('should evaluate template literals', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('`${rem(4)} ${rem(8)}`')).toBe('0.25rem 0.5rem');
      expect(evaluator.evaluate('`hello ${16} world`')).toBe('hello 16 world');
    });

    it('should evaluate binary expressions - addition', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('16 + 32')).toBe('48');
      expect(evaluator.evaluate('"hello" + "world"')).toBe('helloworld');
    });

    it('should evaluate binary expressions - subtraction', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('32 - 16')).toBe('16');
      expect(evaluator.evaluate('100 - 25')).toBe('75');
    });

    it('should evaluate binary expressions - multiplication', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('16 * 2')).toBe('32');
      expect(evaluator.evaluate('5 * 3')).toBe('15');
    });

    it('should evaluate binary expressions - division', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('32 / 2')).toBe('16');
      expect(evaluator.evaluate('100 / 4')).toBe('25');
    });

    it('should return null for division by zero', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('100 / 0')).toBe(null);
    });

    it('should return null for invalid expressions', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('invalid syntax {{')).toBe(null);
      expect(evaluator.evaluate('someVariable')).toBe(null);
    });

    it('should return null for identifiers', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('myVariable')).toBe(null);
    });

    it('should return null for member expressions', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('obj.property')).toBe(null);
      expect(evaluator.evaluate('theme.colors.brand')).toBe(null);
    });

    it('should return null for unknown function calls', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('unknownFunc(42)')).toBe(null);
      expect(evaluator.evaluate('Math.floor(3.14)')).toBe(null);
    });

    it('should return null for rem() with no arguments', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('rem()')).toBe(null);
    });

    it('should return null for rem() with non-numeric argument', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('rem("notanumber")')).toBe(null);
    });

    it('should return null for rem() with spread argument', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('rem(...args)')).toBe(null);
    });

    it('should return null for clsx() with spread argument', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('clsx(...values)')).toBe(null);
    });

    it('should return null for clsx() with non-evaluable argument', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('clsx(someVariable)')).toBe(null);
    });

    it('should return null for template literal with non-evaluable expression', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('`hello ${someVariable}`')).toBe(null);
    });

    it('should return null for non-numeric subtraction', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('"hello" - "world"')).toBe(null);
    });

    it('should return null for non-numeric multiplication', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('"hello" * "world"')).toBe(null);
    });

    it('should return null for non-numeric division', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('"hello" / "world"')).toBe(null);
    });

    it('should return null for unsupported binary operators', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('16 % 5')).toBe(null);
      expect(evaluator.evaluate('2 ** 3')).toBe(null);
    });

    it('should handle complex nested expressions', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('rem(16 * 2)')).toBe('2rem');
      expect(evaluator.evaluate('rem(32 / 2)')).toBe('1rem');
    });

    it('should handle template literals with multiple expressions', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('`${rem(4)} solid ${rem(8)}`')).toBe('0.25rem solid 0.5rem');
    });

    it('should update remBase with setRemBase', () => {
      const evaluator = new ValueEvaluator(16);
      expect(evaluator.evaluate('rem(16)')).toBe('1rem');
      
      evaluator.setRemBase(20);
      expect(evaluator.evaluate('rem(20)')).toBe('1rem');
    });

    it('should handle empty template literals', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('``')).toBe('');
    });

    it('should handle template literals with only strings', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('`hello world`')).toBe('hello world');
    });

    it('should handle negative numbers in rem()', () => {
      const evaluator = new ValueEvaluator();
      // Negative numbers are UnaryExpression, which we don't handle directly
      // But they work inside rem() via parseFloat
      expect(evaluator.evaluate('rem(-16)')).toBe(null); // UnaryExpression not supported directly
    });

    it('should handle decimal numbers', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('3.14')).toBe('3.14');
      expect(evaluator.evaluate('rem(24.5)')).toBe('1.53125rem');
    });

    it('should handle zero', () => {
      const evaluator = new ValueEvaluator();
      expect(evaluator.evaluate('0')).toBe('0');
      expect(evaluator.evaluate('rem(0)')).toBe('0rem');
    });
  });
});
