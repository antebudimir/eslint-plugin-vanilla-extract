import { recipe } from '@vanilla-extract/recipes';
import { vars } from './theme.css.js';

// Recipe with variants + unsorted base properties
export const buttonRecipe = recipe({
  base: {
    borderRadius: 4,
    padding: '8px 16px',
    fontSize: '14.0px',
    backgroundColor: vars.color.brand,
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
