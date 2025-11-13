import { createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  colors: {
    brand: '#0055FF',
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
  },
  spacing: {
    1: '8px',
    2: '16px',
    4: '32px',
  },
  fontSizes: {
    small: '12px',
    medium: '16px',
    large: '20px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
});
