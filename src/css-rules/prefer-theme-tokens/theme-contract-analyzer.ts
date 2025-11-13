import * as fs from 'fs';
import * as path from 'path';
import { ValueEvaluator } from './value-evaluator.js';

export interface TokenInfo {
  value: string;
  tokenPath: string;
  category: 'color' | 'spacing' | 'fontSize' | 'borderRadius' | 'borderWidth' | 'shadow' | 'zIndex' | 'opacity' | 'fontWeight' | 'transition' | 'other';
}

export interface ThemeContract {
  tokens: Map<string, TokenInfo[]>; // value -> token infos
  variableName: string; // e.g., 'theme', 'vars'
}

/**
 * Analyzes theme contract files to extract token values and their paths
 */
export class ThemeContractAnalyzer {
  private contracts: Map<string, ThemeContract> = new Map();
  private evaluator: ValueEvaluator = new ValueEvaluator();

  /**
   * Set rem base for evaluation (default: 16)
   */
  setRemBase(base: number): void {
    this.evaluator.setRemBase(base);
  }

  /**
   * Load and analyze a theme contract file
   */
  loadThemeContract(filePath: string, baseDir: string): void {
    const absolutePath = path.resolve(baseDir, filePath);
    
    if (!fs.existsSync(absolutePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const contract = this.parseThemeContract(content);
      if (contract) {
        this.contracts.set(filePath, contract);
      }
    } catch {
      // Silently fail - theme file might not be available during linting
    }
  }

  /**
   * Parse theme contract from source code
   */
  private parseThemeContract(content: string): ThemeContract | null {
    const tokens = new Map<string, TokenInfo[]>();
    let variableName = 'theme';

    // Try to extract theme variable name from exports
    // Prefer the second identifier in destructuring like: export const [themeClass, vars] = createTheme(...)
    const destructureMatch = content.match(/export\s+(?:const|let)\s*\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=/);
    if (destructureMatch?.[2]) {
      variableName = destructureMatch[2];
    } else {
      // Fallback: capture single identifier export
      const exportMatch = content.match(/export\s+(?:const|let)\s+(\w+)\s*=|export\s+(?:const|let)\s*\[\s*(\w+)\s*\]/);
      const candidate = exportMatch?.[1] || exportMatch?.[2];
      if (candidate) {
        variableName = candidate;
      }
    }

    // Parse createTheme (one-arg), createTheme(contract, values), createGlobalTheme, or contract definitions
    const createThemeTwoArg = content.match(/createTheme\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*({[\s\S]*?})\s*\)/);
    const themeObjectMatch = content.match(/createTheme\s*\(\s*({[\s\S]*?})\s*\)/);
    const globalThemeMatch = content.match(/createGlobalTheme\s*\([^,]+,\s*({[\s\S]*?})\s*\)/);
    const contractMatch = content.match(/createThemeContract\s*\(\s*({[\s\S]*?})\s*\)/);

    const themeContent = createThemeTwoArg?.[2] || themeObjectMatch?.[1] || globalThemeMatch?.[1] || contractMatch?.[1];
    
    if (!themeContent) {
      return null;
    }

    // If using createTheme(contractIdentifier, values), prefer the contract identifier for variable name (e.g., 'theme')
    if (createThemeTwoArg?.[1]) {
      variableName = createThemeTwoArg[1];
    } else {
      // Try to extract theme variable name from exports
      // Prefer the second identifier in destructuring like: export const [themeClass, vars] = createTheme(...)
      const destructureMatch = content.match(/export\s+(?:const|let)\s*\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=/);
      if (destructureMatch?.[2]) {
        variableName = destructureMatch[2];
      } else {
        // Fallback: capture single identifier export
        const exportMatch = content.match(/export\s+(?:const|let)\s+(\w+)\s*=|export\s+(?:const|let)\s*\[\s*(\w+)\s*\]/);
        const candidate = exportMatch?.[1] || exportMatch?.[2];
        if (candidate) {
          variableName = candidate;
        }
      }
    }

    // Parse the theme object structure
    this.parseThemeObject(themeContent, variableName, tokens);

    return { tokens, variableName };
  }

  /**
   * Parse theme object and extract token values
   */
  private parseThemeObject(
    content: string,
    variableName: string,
    tokens: Map<string, TokenInfo[]>,
    pathPrefix: string = '',
  ): void {
    // Remove comments
    const cleaned = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // First, extract and process nested objects to avoid matching their contents
    const objectRegex = /['"]?(\w+)['"]?\s*:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*?)}/g;
    const nestedObjects: Array<{ key: string; content: string }> = [];
    let objectMatch;
    
    while ((objectMatch = objectRegex.exec(cleaned)) !== null) {
      const key = objectMatch[1];
      const nestedContent = objectMatch[2];
      if (key && nestedContent) {
        nestedObjects.push({ key, content: nestedContent });
      }
    }

    // Remove nested objects from content to avoid double-matching
    let contentWithoutNested = cleaned;
    nestedObjects.forEach(({ content }) => {
      contentWithoutNested = contentWithoutNested.replace(content, '');
    });

    // Match key-value pairs - both string literals and expressions
    // String literals: key: 'value' or key: "value" or key: `value`
    const stringLiteralRegex = /['"]?(\w+)['"]?\s*:\s*(['"`])(.*?)\2/g;
    // Expressions: key: rem(16) or key: clsx(...)
    const expressionRegex = /['"]?(\w+)['"]?\s*:\s*([^,}\n]+?)(?=[,}\n])/g;
    
    let match;

    // First pass: extract string literals (only from content without nested objects)
    while ((match = stringLiteralRegex.exec(contentWithoutNested)) !== null) {
      const key = match[1];
      const value = match[3];
      if (!key || !value) continue;
      
      const tokenPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const fullPath = `${variableName}.${tokenPath}`;

      // Determine category based on key name and value
      const category = this.categorizeToken(tokenPath, value);

      // Normalize the value
      const normalizedValue = this.normalizeValue(value);

      if (normalizedValue) {
        const existing = tokens.get(normalizedValue) || [];
        existing.push({ value: normalizedValue, tokenPath: fullPath, category });
        tokens.set(normalizedValue, existing);
      }
    }

    // Second pass: extract and evaluate expressions (only from content without nested objects)
    let exprMatch;
    while ((exprMatch = expressionRegex.exec(contentWithoutNested)) !== null) {
      const key = exprMatch[1];
      let value = exprMatch[2];
      if (!key || !value) continue;
      
      value = value.trim();
      
      // Skip if it's a string literal (already processed)
      if (value.startsWith('"') || value.startsWith("'") || value.startsWith('`')) {
        continue;
      }
      
      // Skip nested objects
      if (value.startsWith('{')) {
        continue;
      }

      const tokenPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const fullPath = `${variableName}.${tokenPath}`;

      // Try to evaluate the expression
      const evaluatedValue = this.evaluator.evaluate(value);
      if (!evaluatedValue) continue;

      // Determine category based on key name and evaluated value
      const category = this.categorizeToken(tokenPath, evaluatedValue);

      // Normalize the evaluated value
      const normalizedValue = this.normalizeValue(evaluatedValue);

      if (normalizedValue) {
        const existing = tokens.get(normalizedValue) || [];
        existing.push({ value: normalizedValue, tokenPath: fullPath, category });
        tokens.set(normalizedValue, existing);
      }
    }

    // Process nested objects (already extracted earlier)
    nestedObjects.forEach(({ key, content }) => {
      const newPrefix = pathPrefix ? `${pathPrefix}.${key}` : key;
      this.parseThemeObject(content, variableName, tokens, newPrefix);
    });
  }

  /**
   * Categorize a token based on its path and value
   */
  private categorizeToken(tokenPath: string, value: string): TokenInfo['category'] {
    const lowerPath = tokenPath.toLowerCase();

    // Check by path
    if (lowerPath.includes('color') || lowerPath.includes('bg') || lowerPath.includes('background')) {
      return 'color';
    }
    if (lowerPath.includes('spacing') || lowerPath.includes('space') || lowerPath.includes('gap')) {
      return 'spacing';
    }
    if (lowerPath.includes('fontsize') || lowerPath.includes('font') && lowerPath.includes('size')) {
      return 'fontSize';
    }
    if (lowerPath.includes('radius') || lowerPath.includes('radii')) {
      return 'borderRadius';
    }
    if (lowerPath.includes('borderwidth') || lowerPath.includes('border') && lowerPath.includes('width')) {
      return 'borderWidth';
    }
    if (lowerPath.includes('shadow')) {
      return 'shadow';
    }
    if (lowerPath.includes('zindex') || lowerPath.includes('z-index') || lowerPath.includes('z')) {
      return 'zIndex';
    }
    if (lowerPath.includes('opacity')) {
      return 'opacity';
    }
    if (lowerPath.includes('fontweight') || lowerPath.includes('font') && lowerPath.includes('weight') || lowerPath.includes('weight')) {
      return 'fontWeight';
    }
    if (lowerPath.includes('transition') || lowerPath.includes('animation') || lowerPath.includes('duration') || lowerPath.includes('delay')) {
      return 'transition';
    }

    // Check by value pattern
    if (this.isColor(value)) {
      return 'color';
    }
    if (/^\d+(\.\d+)?(px|rem|em)$/.test(value)) {
      if (/font|size/.test(lowerPath)) {
        return 'fontSize';
      }
      if (/radius/.test(lowerPath)) {
        return 'borderRadius';
      }
      if (/border.*width|width/.test(lowerPath)) {
        return 'borderWidth';
      }
      return 'spacing';
    }
    if (/^-?\d+$/.test(value)) {
      return 'zIndex';
    }
    if (/^(0?\.\d+|1(\.0+)?)$/.test(value)) {
      return 'opacity';
    }
    if (/^[1-9]00$/.test(value) || /^(normal|bold|bolder|lighter)$/i.test(value)) {
      return 'fontWeight';
    }
    if (/^\d+(\.\d+)?(s|ms)$/.test(value) || /(ease|linear|cubic-bezier|steps)/i.test(value)) {
      return 'transition';
    }

    return 'other';
  }

  /**
   * Check if a value is a color
   */
  private isColor(value: string): boolean {
    return /^#[0-9a-f]{3,8}$/i.test(value) ||
           /^rgba?\(/.test(value) ||
           /^hsla?\(/.test(value);
  }

  /**
   * Normalize a value for comparison
   */
  private normalizeValue(value: string): string | null {
    const trimmed = value.trim();

    // Normalize hex colors
    if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
      // Expand 3-digit hex to 6-digit
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
      return trimmed.toLowerCase();
    }

    // Normalize RGB/RGBA
    const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgbMatch?.[1] && rgbMatch[2] && rgbMatch[3]) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      const a = rgbMatch[4];
      
      if (a && a !== '1') {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }

    // Normalize spacing values
    const spacingMatch = trimmed.match(/^(\d+(\.\d+)?)(px|rem|em|%)$/);
    if (spacingMatch) {
      return trimmed;
    }

    // Return as-is for other values
    return trimmed || null;
  }

  /**
   * Find matching tokens for a given value and category
   */
  findMatchingTokens(value: string, category?: TokenInfo['category']): TokenInfo[] {
    const normalized = this.normalizeValue(value);
    if (!normalized) {
      return [];
    }

    const allMatches: TokenInfo[] = [];

    for (const contract of this.contracts.values()) {
      const matches = contract.tokens.get(normalized) || [];
      allMatches.push(...matches);
    }

    // Filter by category if specified
    if (category) {
      return allMatches.filter((token) => token.category === category);
    }

    return allMatches;
  }

  /**
   * Get the primary variable name from loaded contracts
   */
  getVariableName(): string {
    const firstContract = Array.from(this.contracts.values())[0];
    return firstContract?.variableName || 'theme';
  }

  /**
   * Check if any contracts are loaded
   */
  hasContracts(): boolean {
    return this.contracts.size > 0;
  }

  /**
   * Clear all loaded contracts
   */
  clear(): void {
    this.contracts.clear();
  }
}
