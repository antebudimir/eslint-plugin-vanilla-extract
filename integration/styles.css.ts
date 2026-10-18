import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

// Intentionally unsorted + px units + trailing zeros + logical property: exercises alphabetical-order, no-px-unit, no-trailing-zero, no-zero-unit and prefer-logical-properties autofixes end-to-end.
export const card = style({
  backgroundColor: vars.color.brand,
  display: 'flex',
  margin: '0',
  padding: '12.5px',
  'padding-inline-start': '8px',
  zIndex: 1,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.muted,
      color: vars.color.surface,
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
