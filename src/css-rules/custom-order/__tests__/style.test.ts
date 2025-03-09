import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customGroupOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/style',
  rule: customGroupOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Style with custom group ordering (dimensions, margin, font, border, boxShadow)
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          // dimensions group first
          width: '10rem',
          minWidth: '5rem',
          height: '10rem',
          maxHeight: '20rem',

          // margin group second
          margin: '1rem',
          marginTop: '0.5rem',

          // font group third
          fontFamily: 'sans-serif',
          fontSize: '1rem',
          fontWeight: 'bold',

          // border group fourth
          border: '1px solid black',
          borderRadius: '4px',
          
          // boxShadow group fifth
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

          // remaining properties in concentric order
          position: 'relative',
          display: 'flex',
          backgroundColor: 'red',
          padding: '2rem',
          color: 'blue'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },

    // Style with nested selectors following custom group ordering
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '10rem',
          margin: '1rem',
          fontFamily: 'sans-serif',
          border: '1px solid black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative',
          backgroundColor: 'red',
          selectors: {
            '&:hover': {
              width: '12rem',
              margin: '12px',
              fontSize: '1rem',
              borderColor: 'blue',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              position: 'relative',
              backgroundColor: 'blue',
              color: 'white'
            }
          }
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
    },
    {
      code: `
    import { style } from '@vanilla-extract/css';
    const myStyle = style({
      // dimensions group first
      width: '10rem',
      height: '10rem',
      
      // margin group second
      margin: '1rem',
      
      // font group third
      fontFamily: 'sans-serif',
      
      // border group fourth
      border: '1px solid black',
      
      // boxShadow group fifth
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      
      // remaining properties in alphabetical order
      backgroundColor: 'red',
      color: 'blue',
      display: 'flex',
      padding: '2rem',
      position: 'relative'
    });
  `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
    },
  ],
  invalid: [
    // Style with incorrect custom group ordering
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          position: 'relative',
          border: '1px solid black',
          width: '10rem',
          color: 'blue',
          margin: '1rem',
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          backgroundColor: 'red'
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '10rem',
          margin: '1rem',
          fontFamily: 'sans-serif',
          border: '1px solid black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative',
          backgroundColor: 'red',
          color: 'blue'
        });
      `,
    },

    // Style with nested selectors having incorrect ordering
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          border: '1px solid black',
          width: '10rem',
          position: 'relative',
          margin: '1rem',
          selectors: {
            '&:hover': {
              color: 'white',
              width: '12rem',
              border: '2px solid blue',
              margin: '1.2rem',
              backgroundColor: 'blue'
            }
          }
        });
      `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'concentric',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '10rem',
          margin: '1rem',
          border: '1px solid black',
          position: 'relative',
          selectors: {
            '&:hover': {
              width: '12rem',
              margin: '1.2rem',
              border: '2px solid blue',
              backgroundColor: 'blue',
              color: 'white'
            }
          }
        });
      `,
    },
    {
      code: `
    import { style } from '@vanilla-extract/css';
    const myStyle = style({
      position: 'relative',
      border: '1px solid black',
      width: '10rem',
      padding: '2rem',
      color: 'blue',
      margin: '1rem',
      display: 'flex',
      fontFamily: 'sans-serif',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'red'
    });
  `,
      options: [
        {
          groupOrder: ['dimensions', 'margin', 'font', 'border', 'boxShadow'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
      errors: [{ messageId: 'incorrectOrder' }],
      output: `
    import { style } from '@vanilla-extract/css';
    const myStyle = style({
      width: '10rem',
      margin: '1rem',
      fontFamily: 'sans-serif',
      border: '1px solid black',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'red',
      color: 'blue',
      display: 'flex',
      padding: '2rem',
      position: 'relative'
    });
  `,
    },
  ],
});
