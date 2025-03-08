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

// fontFaces
export const theFont = fontFace({
  // Comment to test that the linter doesn't remove it
  src: ['url("/fonts/MyFont.woff2") format("woff2")', 'url("/fonts/MyFont.woff") format("woff")'],
  ascentOverride: '90%',
  descentOverride: '10%',
  fontDisplay: 'swap',
  fontFeatureSettings: '"liga" 1',
  fontStretch: 'normal',
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontVariationSettings: '"wght" 400',
  fontWeight: '400 700',
  lineGapOverride: '10%',
  sizeAdjust: '90%',
  unicodeRange:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
});

globalFontFace('GlobalFont', {
  // Comment to test that the linter doesn't remove it
  src: ['url("/fonts/MyFont.woff2") format("woff2")', 'url("/fonts/MyFont.woff") format("woff")'],
  ascentOverride: '90%',
  descentOverride: '10%',
  fontDisplay: 'swap',
  fontFeatureSettings: '"liga" 1',
  fontStretch: 'normal',
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontVariationSettings: '"wght" 400',
  fontWeight: '400 700',
  lineGapOverride: '10%',
  sizeAdjust: '90%',
  unicodeRange:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
});

// keyframes
export const spinster = globalKeyframes('spin', {
  // Comment to test that the linter doesn't remove it
  from: {
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },

  // Comment to test that the linter doesn't remove it
  to: {
    // Comment to test that the linter doesn't remove it
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },
});

export const starter = keyframes({
  // Comment to test that the linter doesn't remove it
  '0%': {
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },

  // Comment to test that the linter doesn't remove it
  '100%': {
    // Comment to test that the linter doesn't remove it
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },
});

globalStyle('*, ::before, ::after', {
  // Comment to test that the linter doesn't remove it
  width: '100%',
  margin: '0',
  fontSize: 'large',
  border: 'Background',
  borderRight: 'ActiveBorder',
  borderLeft: 'ActiveBorder',
  borderRadius: 'initial',
  borderBottomLeftRadius: 'initial',
  borderBottomRightRadius: 'initial',
  boxSizing: 'inherit',
  position: 'relative',
  right: 'inherit',
  display: 'flex',
  gap: 'revert',
  transform: 'none',
  outline: 'none',
  backgroundColor: 'initial',
  cursor: 'pointer',
  color: 'red',
});

// style with an array
const accordionContentBase = style([
  // Comment to test that the linter doesn't remove it
  {
    // Comment to test that the linter doesn't remove it
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',

    // special selector to test that the linter doesn't remove it
    '@supports': {
      '(hanging-punctuation: first) and (font: -apple-system-body) and (-webkit-appearance: none)': {
        // Comment to test that the linter doesn't remove it
        width: '100%',
        margin: '0',
        fontSize: 'large',
        border: 'Background',
        borderRight: 'ActiveBorder',
        borderLeft: 'ActiveBorder',
        borderRadius: 'initial',
        borderBottomLeftRadius: 'initial',
        borderBottomRightRadius: 'initial',
        boxShadow: 'none',
        boxSizing: 'inherit',
        position: 'relative',
        right: 'inherit',
        display: 'flex',
        gap: 'revert',
        transform: 'none',
        outline: 'none',
        backgroundColor: 'initial',
        cursor: 'pointer',
        color: 'red',
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
      // Comment to test that the linter doesn't remove it
      false: {
        // Comment to test that the linter doesn't remove it
        width: '100%',
        margin: '0',
        fontSize: 'large',
        border: 'Background',
        borderRight: 'ActiveBorder',
        borderLeft: 'ActiveBorder',
        borderRadius: 'initial',
        borderBottomLeftRadius: 'initial',
        borderBottomRightRadius: 'initial',
        boxShadow: 'none',
        boxSizing: 'inherit',
        position: 'relative',
        right: 'inherit',
        display: 'flex',
        gap: 'revert',
        transform: 'none',
        outline: 'none',
        backgroundColor: 'initial',
        cursor: 'pointer',
        color: 'red',
      },

      true: {
        width: '100%',
        margin: '0',
        fontSize: 'large',
        border: 'Background',
        borderRight: 'ActiveBorder',
        borderLeft: 'ActiveBorder',
        borderRadius: 'initial',
        borderBottomLeftRadius: 'initial',
        borderBottomRightRadius: 'initial',
        boxShadow: 'none',
        boxSizing: 'inherit',
        position: 'relative',
        right: 'inherit',
        display: 'flex',
        gap: 'revert',
        transform: 'none',
        outline: 'none',
        backgroundColor: 'initial',
        cursor: 'pointer',
        color: 'red',

        // pseudo selector inside a variant
        ':hover': {
          // Comment to test that the linter doesn't remove it
          width: '100%',
          margin: '0',
          fontSize: 'large',
          border: 'Background',
          borderRight: 'ActiveBorder',
          borderLeft: 'ActiveBorder',
          borderRadius: 'initial',
          borderBottomLeftRadius: 'initial',
          borderBottomRightRadius: 'initial',
          boxShadow: 'none',
          boxSizing: 'inherit',
          position: 'relative',
          right: 'inherit',
          display: 'flex',
          gap: 'revert',
          transform: 'none',
          outline: 'none',
          backgroundColor: 'initial',
          cursor: 'pointer',
          color: 'red',
        },
      },
    },
  },
});

export const item = style({
  width: '100%',
  margin: '0',
  fontSize: 'large',
  border: 'Background',
  borderRight: 'ActiveBorder',
  borderLeft: 'ActiveBorder',
  borderRadius: 'initial',
  borderBottomLeftRadius: 'initial',
  borderBottomRightRadius: 'initial',
  boxSizing: 'inherit',
  position: 'relative',
  right: 'inherit',
  display: 'flex',
  gap: 'revert',
  transform: 'none',
  outline: 'none',
  backgroundColor: 'initial',
  cursor: 'pointer',
  color: 'red',

  // pseudo selector inside a style
  ':focus-visible': {
    // Comment to test that the linter doesn't remove it
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },

  selectors: {
    // Comment to test that the linter doesn't remove it
    '&[data-pressed]': {
      // Comment to test that the linter doesn't remove it
      width: '100%',
      margin: '0',
      fontSize: 'large',
      border: 'Background',
      borderRight: 'ActiveBorder',
      borderLeft: 'ActiveBorder',
      borderRadius: 'initial',
      borderBottomLeftRadius: 'initial',
      borderBottomRightRadius: 'initial',
      boxShadow: 'none',
      boxSizing: 'inherit',
      position: 'relative',
      right: 'inherit',
      display: 'flex',
      gap: 'revert',
      transform: 'none',
      outline: 'none',
      backgroundColor: 'initial',
      cursor: 'pointer',
      color: 'red',
    },
  },
});

export const selectButtonVariants = styleVariants({
  // Comment to test that the linter doesn't remove it
  bordered: {
    // Comment to test that the linter doesn't remove it
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },

  borderless: {
    width: '100%',
    margin: '0',
    fontSize: 'large',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    outline: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    color: 'red',
  },
});
