import { createTheme } from '@vanilla-extract/css';

// Mock rem function for testing
const rem = (px: number) => `${px / 16}rem`;

export const lightTheme = createTheme({
  spacing: {
    small: rem(8),
    medium: rem(16),
    large: rem(32),
  },
  fontSize: {
    small: rem(12),
    medium: rem(16),
  },
  borderRadius: {
    small: rem(4),
    medium: rem(8),
  },
  color: {
    brand: '#5614b8',
    white: 'rgb(255, 255, 255)',
  },
});
