/**
 * Mapping of physical CSS properties to their logical equivalents.
 * Includes margin, padding, border, inset, and positioning properties.
 */

export interface PropertyMapping {
  logical: string;
  description?: string;
}

/**
 * Direct physical → logical property mappings
 */
export const PHYSICAL_TO_LOGICAL: Record<string, PropertyMapping> = {
  // Margin properties
  'margin-left': { logical: 'margin-inline-start' },
  'margin-right': { logical: 'margin-inline-end' },
  'margin-top': { logical: 'margin-block-start' },
  'margin-bottom': { logical: 'margin-block-end' },
  marginLeft: { logical: 'marginInlineStart' },
  marginRight: { logical: 'marginInlineEnd' },
  marginTop: { logical: 'marginBlockStart' },
  marginBottom: { logical: 'marginBlockEnd' },

  // Padding properties
  'padding-left': { logical: 'padding-inline-start' },
  'padding-right': { logical: 'padding-inline-end' },
  'padding-top': { logical: 'padding-block-start' },
  'padding-bottom': { logical: 'padding-block-end' },
  paddingLeft: { logical: 'paddingInlineStart' },
  paddingRight: { logical: 'paddingInlineEnd' },
  paddingTop: { logical: 'paddingBlockStart' },
  paddingBottom: { logical: 'paddingBlockEnd' },

  // Border width properties
  'border-left-width': { logical: 'border-inline-start-width' },
  'border-right-width': { logical: 'border-inline-end-width' },
  'border-top-width': { logical: 'border-block-start-width' },
  'border-bottom-width': { logical: 'border-block-end-width' },
  borderLeftWidth: { logical: 'borderInlineStartWidth' },
  borderRightWidth: { logical: 'borderInlineEndWidth' },
  borderTopWidth: { logical: 'borderBlockStartWidth' },
  borderBottomWidth: { logical: 'borderBlockEndWidth' },

  // Border style properties
  'border-left-style': { logical: 'border-inline-start-style' },
  'border-right-style': { logical: 'border-inline-end-style' },
  'border-top-style': { logical: 'border-block-start-style' },
  'border-bottom-style': { logical: 'border-block-end-style' },
  borderLeftStyle: { logical: 'borderInlineStartStyle' },
  borderRightStyle: { logical: 'borderInlineEndStyle' },
  borderTopStyle: { logical: 'borderBlockStartStyle' },
  borderBottomStyle: { logical: 'borderBlockEndStyle' },

  // Border color properties
  'border-left-color': { logical: 'border-inline-start-color' },
  'border-right-color': { logical: 'border-inline-end-color' },
  'border-top-color': { logical: 'border-block-start-color' },
  'border-bottom-color': { logical: 'border-block-end-color' },
  borderLeftColor: { logical: 'borderInlineStartColor' },
  borderRightColor: { logical: 'borderInlineEndColor' },
  borderTopColor: { logical: 'borderBlockStartColor' },
  borderBottomColor: { logical: 'borderBlockEndColor' },

  // Border shorthand properties
  'border-left': { logical: 'border-inline-start' },
  'border-right': { logical: 'border-inline-end' },
  'border-top': { logical: 'border-block-start' },
  'border-bottom': { logical: 'border-block-end' },
  borderLeft: { logical: 'borderInlineStart' },
  borderRight: { logical: 'borderInlineEnd' },
  borderTop: { logical: 'borderBlockStart' },
  borderBottom: { logical: 'borderBlockEnd' },

  // Border radius properties
  'border-top-left-radius': { logical: 'border-start-start-radius' },
  'border-top-right-radius': { logical: 'border-start-end-radius' },
  'border-bottom-left-radius': { logical: 'border-end-start-radius' },
  'border-bottom-right-radius': { logical: 'border-end-end-radius' },
  borderTopLeftRadius: { logical: 'borderStartStartRadius' },
  borderTopRightRadius: { logical: 'borderStartEndRadius' },
  borderBottomLeftRadius: { logical: 'borderEndStartRadius' },
  borderBottomRightRadius: { logical: 'borderEndEndRadius' },

  // Inset properties
  left: { logical: 'inset-inline-start' },
  right: { logical: 'inset-inline-end' },
  top: { logical: 'inset-block-start' },
  bottom: { logical: 'inset-block-end' },
  'inset-left': { logical: 'inset-inline-start' },
  'inset-right': { logical: 'inset-inline-end' },
  'inset-top': { logical: 'inset-block-start' },
  'inset-bottom': { logical: 'inset-block-end' },
  insetLeft: { logical: 'insetInlineStart' },
  insetRight: { logical: 'insetInlineEnd' },
  insetTop: { logical: 'insetBlockStart' },
  insetBottom: { logical: 'insetBlockEnd' },

  // Overflow properties
  'overflow-x': { logical: 'overflow-inline' },
  'overflow-y': { logical: 'overflow-block' },
  overflowX: { logical: 'overflowInline' },
  overflowY: { logical: 'overflowBlock' },

  // Overscroll properties
  'overscroll-behavior-x': { logical: 'overscroll-behavior-inline' },
  'overscroll-behavior-y': { logical: 'overscroll-behavior-block' },
  overscrollBehaviorX: { logical: 'overscrollBehaviorInline' },
  overscrollBehaviorY: { logical: 'overscrollBehaviorBlock' },

  // Scroll margin properties
  'scroll-margin-left': { logical: 'scroll-margin-inline-start' },
  'scroll-margin-right': { logical: 'scroll-margin-inline-end' },
  'scroll-margin-top': { logical: 'scroll-margin-block-start' },
  'scroll-margin-bottom': { logical: 'scroll-margin-block-end' },
  scrollMarginLeft: { logical: 'scrollMarginInlineStart' },
  scrollMarginRight: { logical: 'scrollMarginInlineEnd' },
  scrollMarginTop: { logical: 'scrollMarginBlockStart' },
  scrollMarginBottom: { logical: 'scrollMarginBlockEnd' },

  // Scroll padding properties
  'scroll-padding-left': { logical: 'scroll-padding-inline-start' },
  'scroll-padding-right': { logical: 'scroll-padding-inline-end' },
  'scroll-padding-top': { logical: 'scroll-padding-block-start' },
  'scroll-padding-bottom': { logical: 'scroll-padding-block-end' },
  scrollPaddingLeft: { logical: 'scrollPaddingInlineStart' },
  scrollPaddingRight: { logical: 'scrollPaddingInlineEnd' },
  scrollPaddingTop: { logical: 'scrollPaddingBlockStart' },
  scrollPaddingBottom: { logical: 'scrollPaddingBlockEnd' },

  // Size properties
  width: { logical: 'inline-size' },
  height: { logical: 'block-size' },
  'min-width': { logical: 'min-inline-size' },
  'min-height': { logical: 'min-block-size' },
  'max-width': { logical: 'max-inline-size' },
  'max-height': { logical: 'max-block-size' },
  minWidth: { logical: 'minInlineSize' },
  minHeight: { logical: 'minBlockSize' },
  maxWidth: { logical: 'maxInlineSize' },
  maxHeight: { logical: 'maxBlockSize' },
};

/**
 * Text-align directional values that should be replaced
 */
export const TEXT_ALIGN_PHYSICAL_VALUES: Record<string, string> = {
  left: 'start',
  right: 'end',
};

/**
 * Float directional values that should be replaced
 */
export const FLOAT_PHYSICAL_VALUES: Record<string, string> = {
  left: 'inline-start',
  right: 'inline-end',
};

/**
 * Clear directional values that should be replaced
 */
export const CLEAR_PHYSICAL_VALUES: Record<string, string> = {
  left: 'inline-start',
  right: 'inline-end',
};

/**
 * Properties where the value (not the property name) needs to be checked for physical directions
 */
export const VALUE_BASED_PHYSICAL_PROPERTIES = new Set([
  'text-align',
  'textAlign',
  'float',
  'clear',
  'resize',
]);

/**
 * Check if a property name is a physical property that should be converted
 */
export function isPhysicalProperty(propertyName: string): boolean {
  return propertyName in PHYSICAL_TO_LOGICAL;
}

/**
 * Get the logical equivalent of a physical property
 */
export function getLogicalProperty(propertyName: string): string | null {
  return PHYSICAL_TO_LOGICAL[propertyName]?.logical ?? null;
}

/**
 * Convert camelCase to kebab-case
 */
export function toKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Convert kebab-case to camelCase
 */
export function toCamelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
