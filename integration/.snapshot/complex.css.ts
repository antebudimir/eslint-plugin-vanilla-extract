import {
  fontFace,
  globalFontFace,
  globalKeyframes,
  globalStyle,
  keyframes,
  style,
  styleVariants,
} from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

// Kitchen-sink clean fixture, derived from the maintainer's manual-testing
// sample. Must lint with ZERO errors under the rules enabled in
// eslint.config.mjs — it is a false-positive regression file. Properties are
// kept in alphabetical order (with `src` first in font faces) and units are
// chosen to satisfy no-px-unit / no-trailing-zero / no-zero-unit /
// no-unitless-values.

// Comment to test that the linter doesn't remove it
export const theFont = fontFace({
  // Comment to test that the linter doesn't remove it
  src: ['url("/fonts/MyFont.woff2") format("woff2")', 'url("/fonts/MyFont.woff") format("woff")'],
  ascentOverride: '90%',
  descentOverride: '10%',
  fontDisplay: 'swap',
  fontFeatureSettings: '"liga" 1',
  fontStretch: 'normal',
  fontStyle: 'normal',
  fontVariationSettings: '"wght" 400',
  fontWeight: '400 700',
  lineGapOverride: '10%',
  sizeAdjust: '90%',
  unicodeRange: 'U+0000-00FF, U+0131, U+2000-206F, U+FEFF, U+FFFD',
});

globalFontFace('GlobalFont', {
  // Comment to test that the linter doesn't remove it
  src: ['url("/fonts/MyFont.woff2") format("woff2")'],
  ascentOverride: '90%',
  descentOverride: '10%',
  fontDisplay: 'swap',
  fontStretch: 'normal',
  fontStyle: 'normal',
  fontWeight: '400 700',
  lineGapOverride: '10%',
  sizeAdjust: '90%',
});

// Comment to test that the linter doesn't remove it
export const spinster = globalKeyframes('spin', {
  from: {
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
    transform: 'none',
  },
  // Comment to test that the linter doesn't remove it
  to: {
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
    transform: 'none',
  },
});

export const starter = keyframes({
  '0%': {
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
    transform: 'none',
  },
  // Comment to test that the linter doesn't remove it
  '100%': {
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
    transform: 'none',
  },
});

globalStyle('*, ::before, ::after', {
  // Comment to test that the linter doesn't remove it
  backgroundColor: 'initial',
  border: 'Background',
  borderEndEndRadius: 'initial',
  borderEndStartRadius: 'initial',
  borderInlineEnd: 'ActiveBorder',
  borderInlineStart: 'ActiveBorder',
  borderRadius: 'initial',
  boxSizing: 'inherit',
  color: 'red',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 'large',
  gap: 'revert',
  inlineSize: '100%',
  margin: '11rem',
  outline: 'none',
  position: 'relative',
});

// style with an array
const accordionContentBase = style([
  // Comment to test that the linter doesn't remove it
  {
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',

    // special selector to test that the linter doesn't remove it
    '@supports': {
      '(hanging-punctuation: first)': {
        // Comment to test that the linter doesn't remove it
        backgroundColor: 'initial',
        border: 'Background',
        borderEndEndRadius: 'initial',
        borderEndStartRadius: 'initial',
        borderInlineEnd: 'ActiveBorder',
        borderInlineStart: 'ActiveBorder',
        borderRadius: 'initial',
        boxShadow: 'none',
        boxSizing: 'inherit',
        color: 'red',
        cursor: 'pointer',
        display: 'flex',
        fontSize: 'large',
        gap: 'revert',
        inlineSize: '100%',
        margin: '11rem',
        outline: 'none',
        position: 'relative',
      },
    },
  },
]);

export const accordionContent = recipe({
  // Comment to test that the linter doesn't remove it
  base: accordionContentBase,
  // Comment to test that the linter doesn't remove it
  variants: {
    // Comment to test that the linter doesn't remove it
    isOpen: {
      false: {
        // Comment to test that the linter doesn't remove it
        backgroundColor: 'initial',
        border: 'Background',
        borderEndEndRadius: 'initial',
        borderEndStartRadius: 'initial',
        borderInlineEnd: 'ActiveBorder',
        borderInlineStart: 'ActiveBorder',
        borderRadius: 'initial',
        boxShadow: 'none',
        boxSizing: 'inherit',
        color: 'red',
        cursor: 'pointer',
        display: 'flex',
        fontSize: 'large',
        gap: 'revert',
        inlineSize: '100%',
        margin: '11rem',
        outline: 'none',
        position: 'relative',
      },
      true: {
        backgroundColor: 'initial',
        border: 'Background',
        borderEndEndRadius: 'initial',
        borderEndStartRadius: 'initial',
        borderInlineEnd: 'ActiveBorder',
        borderInlineStart: 'ActiveBorder',
        borderRadius: 'initial',
        boxShadow: 'none',
        boxSizing: 'inherit',
        color: 'red',
        cursor: 'pointer',
        display: 'flex',
        fontSize: 'large',
        gap: 'revert',
        inlineSize: '100%',
        margin: '11rem',
        outline: 'none',
        position: 'relative',

        // pseudo selector inside a variant
        ':hover': {
          // Comment to test that the linter doesn't remove it
          backgroundColor: 'initial',
          border: 'Background',
          borderEndEndRadius: 'initial',
          borderEndStartRadius: 'initial',
          borderInlineEnd: 'ActiveBorder',
          borderInlineStart: 'ActiveBorder',
          borderRadius: 'initial',
          boxShadow: 'none',
          boxSizing: 'inherit',
          color: 'red',
          cursor: 'pointer',
          display: 'flex',
          fontSize: 'large',
          gap: 'revert',
          inlineSize: '100%',
          margin: '11rem',
          outline: 'none',
          position: 'relative',
        },
      },
    },
  },
});

export const item = style({
  backgroundColor: 'initial',
  border: 'Background',
  borderEndEndRadius: 'initial',
  borderEndStartRadius: 'initial',
  borderInlineEnd: 'ActiveBorder',
  borderInlineStart: 'ActiveBorder',
  borderRadius: 'initial',
  boxShadow: 'none',
  boxSizing: 'inherit',
  color: 'red',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 'large',
  gap: 'revert',
  inlineSize: '100%',
  margin: '11rem',
  outline: 'none',
  position: 'relative',

  // pseudo selector inside a style
  ':focus-visible': {
    // Comment to test that the linter doesn't remove it
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
  },

  selectors: {
    // Comment to test that the linter doesn't remove it
    '&[data-pressed]': {
      // Comment to test that the linter doesn't remove it
      backgroundColor: 'initial',
      border: 'Background',
      borderEndEndRadius: 'initial',
      borderEndStartRadius: 'initial',
      borderInlineEnd: 'ActiveBorder',
      borderInlineStart: 'ActiveBorder',
      borderRadius: 'initial',
      boxShadow: 'none',
      boxSizing: 'inherit',
      color: 'red',
      cursor: 'pointer',
      display: 'flex',
      fontSize: 'large',
      gap: 'revert',
      inlineSize: '100%',
      margin: '11rem',
      outline: 'none',
      position: 'relative',
    },
  },
});

export const selectButtonVariants = styleVariants({
  // Comment to test that the linter doesn't remove it
  bordered: {
    // Comment to test that the linter doesn't remove it
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
  },
  borderless: {
    backgroundColor: 'initial',
    border: 'Background',
    borderEndEndRadius: 'initial',
    borderEndStartRadius: 'initial',
    borderInlineEnd: 'ActiveBorder',
    borderInlineStart: 'ActiveBorder',
    borderRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    color: 'red',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 'large',
    gap: 'revert',
    inlineSize: '100%',
    margin: '11rem',
    outline: 'none',
    position: 'relative',
  },
});
