import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

// Intentionally unsorted + px units + trailing zeros + logical property: exercises alphabetical-order, no-px-unit, no-trailing-zero, no-zero-unit and prefer-logical-properties autofixes end-to-end.
export const card = style({
  zIndex: 1,
  padding: '12.50px',
  backgroundColor: vars.color.brand,
  margin: '0px',
  'padding-left': '8px',
  display: 'flex',
  selectors: {
    '&:hover': {
      color: vars.color.surface,
      backgroundColor: vars.color.muted,
    },
  },
  '@media': {
    'screen and (min-width: 768px)': {
      padding: '16px',
    },
  },
});

export const button = styleVariants(
  {
    primary: { background: vars.color.brand },
    secondary: { background: vars.color.muted },
  },
  (variantStyle) => [style({ fontWeight: 500 }), variantStyle]
);
