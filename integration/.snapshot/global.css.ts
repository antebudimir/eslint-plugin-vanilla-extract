import { globalFontFace, globalKeyframes, globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

globalFontFace('DogFont', {
  src: 'url(/fonts/dog.woff2)',
  fontStyle: 'normal',
  fontWeight: '400',
});

globalStyle('body', {
  margin: '0.50px 0px',
  fontFamily: 'DogFont, sans-serif',
  backgroundColor: vars.color.surface,
});

globalKeyframes('fadeIn', {
  from: { opacity: 0 },
  to: { opacity: 1 },
});
