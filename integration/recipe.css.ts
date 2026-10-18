import { recipe } from '@vanilla-extract/recipes';
import { vars } from './theme.css.js';

// Recipe with variants + unsorted base properties
export const buttonRecipe = recipe({
  base: {
    backgroundColor: vars.color.brand,
    borderRadius: 4,
    fontSize: '14px',
    padding: '8px 16px',
  },
  variants: {
    tone: {
      neutral: { background: vars.color.surface },
      brand: { background: vars.color.brand },
    },
    size: {
      sm: { padding: '4px 8px' },
      lg: { padding: '16px 24px' },
    },
  },
  defaultVariants: {
    tone: 'neutral',
    size: 'sm',
  },
});
