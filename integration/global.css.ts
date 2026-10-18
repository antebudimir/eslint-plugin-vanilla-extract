import { globalFontFace, globalKeyframes, globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

globalFontFace('DogFont', {
  src: 'url(/fonts/dog.woff2)',
  fontStyle: 'normal',
  fontWeight: '400',
});

globalStyle('body', {
  backgroundColor: vars.color.surface,
  fontFamily: 'DogFont, sans-serif',
  margin: '0.5px 0px',
});

globalKeyframes('fadeIn', {
  from: { opacity: 0 },
  to: { opacity: 1 },
});
