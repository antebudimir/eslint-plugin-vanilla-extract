import { createTheme, createThemeContract } from '@vanilla-extract/css';

export const [themeA, vars] = createTheme({
  color: {
    brand: '#1a1a1a',
    surface: '#ffffff',
  },
  space: {
    sm: '4px',
    md: '8px',
  },
});

export const contract = createThemeContract({
  color: {
    muted: null,
  },
});

export const themeB = createTheme(contract, {
  color: {
    muted: '#cccccc',
  },
});
