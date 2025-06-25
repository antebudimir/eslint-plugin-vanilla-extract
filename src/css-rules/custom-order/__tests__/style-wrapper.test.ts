import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import customOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/custom-order/style-custom',
  rule: customOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Basic style object with custom group ordering through wrapper function
    {
      code: `
        import { style } from '@vanilla-extract/css';

        export const layerStyle = (
          layer: 'reset' | 'theme' | 'component' | 'utilities',
          rule: StyleRule,
          debugId?: string,
        ) =>
          style(
              {
                  '@layer': {
                      [layerMap[layer]]: rule,
                  },
              },
              debugId,
          );
        
        const myStyle = layerStyle('component', {
          // dimensions group first
          width: '10rem',
          height: '5rem',
          
          // margin group second  
          margin: '1rem',
          
          // font group third
          fontFamily: 'sans-serif',
          
          // border group fourth
          border: '1px solid black',
          
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

    // Style with nested selectors
    {
      code: `
        import { style } from '@vanilla-extract/css';

        export const layerStyle = (
          layer: 'reset' | 'theme' | 'component' | 'utilities',
          rule: StyleRule,
          debugId?: string,
        ) =>
          style(
              {
                  '@layer': {
                      [layerMap[layer]]: rule,
                  },
              },
              debugId,
          );

        const myStyle = layerStyle('component', {
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
              margin: '2rem',
              fontFamily: 'serif',
              border: '2px solid blue',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              position: 'absolute',
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

    export const layerStyle = (
          layer: 'reset' | 'theme' | 'component' | 'utilities',
          rule: StyleRule,
          debugId?: string,
    ) =>
      style(
          { '@layer': { [layerMap[layer]]: rule } },
          debugId,
      );

    const myStyle = layerStyle('component', {
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
    // Basic style object with incorrect custom group ordering
    {
      code: `
        import { style } from '@vanilla-extract/css';

        export const layerStyle = (
        layer: 'reset' | 'theme' | 'component' | 'utilities',
        rule: StyleRule,
        debugId?: string,
      ) =>
        style(
            {
                '@layer': {
                    [layerMap[layer]]: rule,
                },
            },
            debugId,
        );

        const myStyle = layerStyle('component', {
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

        export const layerStyle = (
        layer: 'reset' | 'theme' | 'component' | 'utilities',
        rule: StyleRule,
        debugId?: string,
      ) =>
        style(
            {
                '@layer': {
                    [layerMap[layer]]: rule,
                },
            },
            debugId,
        );

        const myStyle = layerStyle('component', {
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

        export const layerStyle = (
        layer: 'reset' | 'theme' | 'component' | 'utilities',
        rule: StyleRule,
        debugId?: string,
      ) =>
        style(
            {
                '@layer': {
                    [layerMap[layer]]: rule,
                },
            },
            debugId,
        );

        const myStyle = layerStyle('component', {
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

        export const layerStyle = (
        layer: 'reset' | 'theme' | 'component' | 'utilities',
        rule: StyleRule,
        debugId?: string,
      ) =>
        style(
            {
                '@layer': {
                    [layerMap[layer]]: rule,
                },
            },
            debugId,
        );

        const myStyle = layerStyle('component', {
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

    export const layerStyle = (
        layer: 'reset' | 'theme' | 'component' | 'utilities',
        rule: StyleRule,
        debugId?: string,
      ) =>
        style(
            {
                '@layer': {
                    [layerMap[layer]]: rule,
                },
            },
            debugId,
        );

    const myStyle = layerStyle('component', {
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

    export const layerStyle = (
        layer: 'reset' | 'theme' | 'component' | 'utilities',
        rule: StyleRule,
        debugId?: string,
      ) =>
        style(
            {
                '@layer': {
                    [layerMap[layer]]: rule,
                },
            },
            debugId,
        );

    const myStyle = layerStyle('component', {
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
