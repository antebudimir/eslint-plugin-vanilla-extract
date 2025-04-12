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
  descentOverride: '0',
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
  descentOverride: '0',
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
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },

  // Comment to test that the linter doesn't remove it
  to: {
    // Comment to test that the linter doesn't remove it
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },
});

export const starter = keyframes({
  // Comment to test that the linter doesn't remove it
  '0%': {
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },

  // Comment to test that the linter doesn't remove it
  '100%': {
    // Comment to test that the linter doesn't remove it
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },
});

globalStyle('*, ::before, ::after', {
  // Comment to test that the linter doesn't remove it
  boxSizing: 'inherit',
  position: 'relative',
  right: 'inherit',
  display: 'flex',
  gap: 'revert',
  transform: 'none',
  margin: '0',
  outline: 'none',
  border: 'Background',
  borderRight: 'ActiveBorder',
  borderLeft: 'ActiveBorder',
  borderRadius: 'initial',
  borderBottomLeftRadius: 'initial',
  borderBottomRightRadius: 'initial',
  backgroundColor: 'initial',
  cursor: 'pointer',
  width: '100%',
  color: 'red',
  fontSize: 'large',
});

// style with an array
const accordionContentBase = style([
  // Comment to test that the linter doesn't remove it
  {
    // Comment to test that the linter doesn't remove it
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',

    // special selector to test that the linter doesn't remove it
    '@supports': {
      '(hanging-punctuation: first) and (font: -apple-system-body) and (-webkit-appearance: none)': {
        // Comment to test that the linter doesn't remove it
        boxSizing: 'inherit',
        position: 'relative',
        right: 'inherit',
        display: 'flex',
        gap: 'revert',
        transform: 'none',
        margin: '0',
        outline: 'none',
        border: 'Background',
        borderRight: 'ActiveBorder',
        borderLeft: 'ActiveBorder',
        borderRadius: 'initial',
        borderBottomLeftRadius: 'initial',
        borderBottomRightRadius: 'initial',
        boxShadow: 'none',
        backgroundColor: 'initial',
        cursor: 'pointer',
        width: '100%',
        color: 'red',
        fontSize: 'large',
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
        boxSizing: 'inherit',
        position: 'relative',
        right: 'inherit',
        display: 'flex',
        gap: 'revert',
        transform: 'none',
        margin: '0',
        outline: 'none',
        border: 'Background',
        borderRight: 'ActiveBorder',
        borderLeft: 'ActiveBorder',
        borderRadius: 'initial',
        borderBottomLeftRadius: 'initial',
        borderBottomRightRadius: 'initial',
        boxShadow: 'none',
        backgroundColor: 'initial',
        cursor: 'pointer',
        width: '100%',
        color: 'red',
        fontSize: 'large',
      },

      true: {
        boxSizing: 'inherit',
        position: 'relative',
        right: 'inherit',
        display: 'flex',
        gap: 'revert',
        transform: 'none',
        margin: '0',
        outline: 'none',
        border: 'Background',
        borderRight: 'ActiveBorder',
        borderLeft: 'ActiveBorder',
        borderRadius: 'initial',
        borderBottomLeftRadius: 'initial',
        borderBottomRightRadius: 'initial',
        boxShadow: 'none',
        backgroundColor: 'initial',
        cursor: 'pointer',
        width: '100%',
        color: 'red',
        fontSize: 'large',

        // pseudo selector inside a variant
        ':hover': {
          // Comment to test that the linter doesn't remove it
          boxSizing: 'inherit',
          position: 'relative',
          right: 'inherit',
          display: 'flex',
          gap: 'revert',
          transform: 'none',
          margin: '0',
          outline: 'none',
          border: 'Background',
          borderRight: 'ActiveBorder',
          borderLeft: 'ActiveBorder',
          borderRadius: 'initial',
          borderBottomLeftRadius: 'initial',
          borderBottomRightRadius: 'initial',
          boxShadow: 'none',
          backgroundColor: 'initial',
          cursor: 'pointer',
          width: '100%',
          color: 'red',
          fontSize: 'large',
        },
      },
    },
  },
});

export const item = style({
  boxSizing: 'inherit',
  position: 'relative',
  right: 'inherit',
  display: 'flex',
  gap: 'revert',
  transform: 'none',
  margin: '0',
  outline: 'none',
  border: 'Background',
  borderRight: 'ActiveBorder',
  borderLeft: 'ActiveBorder',
  borderRadius: 'initial',
  borderBottomLeftRadius: 'initial',
  borderBottomRightRadius: 'initial',
  backgroundColor: 'initial',
  cursor: 'pointer',
  width: '100%',
  color: 'red',
  fontSize: 'large',

  // pseudo selector inside a style
  ':focus-visible': {
    // Comment to test that the linter doesn't remove it
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },

  selectors: {
    // Comment to test that the linter doesn't remove it
    '&[data-pressed]': {
      // Comment to test that the linter doesn't remove it
      boxSizing: 'inherit',
      position: 'relative',
      right: 'inherit',
      display: 'flex',
      gap: 'revert',
      transform: 'none',
      margin: '0',
      outline: 'none',
      border: 'Background',
      borderRight: 'ActiveBorder',
      borderLeft: 'ActiveBorder',
      borderRadius: 'initial',
      borderBottomLeftRadius: 'initial',
      borderBottomRightRadius: 'initial',
      boxShadow: 'none',
      backgroundColor: 'initial',
      cursor: 'pointer',
      width: '100%',
      color: 'red',
      fontSize: 'large',
    },
  },
});

export const selectButtonVariants = styleVariants({
  // Comment to test that the linter doesn't remove it
  bordered: {
    // Comment to test that the linter doesn't remove it
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },

  borderless: {
    boxSizing: 'inherit',
    position: 'relative',
    right: 'inherit',
    display: 'flex',
    gap: 'revert',
    transform: 'none',
    margin: '0',
    outline: 'none',
    border: 'Background',
    borderRight: 'ActiveBorder',
    borderLeft: 'ActiveBorder',
    borderRadius: 'initial',
    borderBottomLeftRadius: 'initial',
    borderBottomRightRadius: 'initial',
    boxShadow: 'none',
    backgroundColor: 'initial',
    cursor: 'pointer',
    width: '100%',
    color: 'red',
    fontSize: 'large',
  },
});

// Test cases for noEmptyStyleBlocksRule

// export const myRecipe = recipe({
//   base: {
//     color: 'blue',
//     selectors: {},
//     '@media': {},
//     '@supports': {},
//   },
//   variants: {
//     size: {
//       small: {
//         selectors: {
//           '&:hover': {},
//         },
//         '@media': {
//           '(min-width: 768px)': {},
//         },
//         '@supports': {
//           '(display: grid)': {},
//         },
//       },
//     },
//   },
// });

// const base = style({ padding: 12 });
// export const variant = styleVariants({
//   primary: [],
//   secondary: [],
//   bordered: {},
//   borderless: {},
// });

// const baseStyles = {
//   color: 'blue',
//   margin: '10px',
// };

// const isDarkMode = false;

// export const spreadStyle = style({
//   ...baseStyles,
//   ...{},
// });

// export const recipeWithNonObjectValue = recipe({
//   base: { color: 'black' },
//   variants: {
//     color: {
//       red: { color: 'red' },
//       // string instead of object
//       string: 'string',
//       // variable instead of object
//       variable: baseStyles,
//     },
//   },
// });

// export const conditionalStyle = style(isDarkMode ? {} : {});

// export const recipeWithEmptyVariantValues = recipe({
//   base: { color: 'black' },
//   variants: {
//     color: {
//       blue: {},
//       red: {},
//     },
//   },
// });

// export const nestedEmptyStyle = style({
//   selectors: {
//     '&:hover': {},
//     '&:focus': {},
//   },
// });

// const myEmptyStyle = style({});
// export { myEmptyStyle };

// export const emptyStyle1 = style({});
// export const emptyStyle2 = style({});
// export const emptyVariants = styleVariants({});
// export const emptyRecipe = recipe({});

// export const styleWithComments = style({
//   /* This is an empty style */
// });

// export const styleWithEmptyMedia = style({
//   color: 'blue',
//   '@media': {
//     '(min-width: 768px)': {},
//   },
// });

// export const styleWithEmptySelector = style({
//   color: 'blue',

//   selectors: {
//     '&:hover': {},
//   },
// });

// export const recipeWithBothEmpty = recipe({
//   base: {},
//   variants: {},
// });

// export const recipeWithEmptyVariants = recipe({
//   base: { color: 'black' },
//   variants: {},
// });

// export const recipeWithEmptyBase = recipe({
//   base: {},
//   variants: {
//     color: {
//       blue: { color: 'blue' },
//     },
//   },
// });

// export const recipe = recipe({
//   base: {},
//   variants: {
//     color: {
//       red: {},
//       blue: {},
//     },
//   },
// });

// export const recipeWithNonObjectVariants = recipe({
//   base: { color: 'blue' },
//   variants: {
//     color: {
//       size: 'string instead of object', // This is a string, not an object
//       red: {},
//     },
//   },
// });

// Using the same empty object reference in both branches
// export const myStyle = style(true ? {} : {});

// export const emptyFontFace = fontFace({});
// globalFontFace('GlobalFont', {});
// globalKeyframes('a', {});
// export const emptyKeyframes = keyframes({});
// globalStyle('ul', {});
// export const emptyStyleVariants = styleVariants({});
// export const emptyStyle = style({});
