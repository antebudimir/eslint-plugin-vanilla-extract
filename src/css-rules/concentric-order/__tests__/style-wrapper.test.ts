import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import concentricOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/concentric-order/style-custom',
  rule: concentricOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Basic style object with concentric ordering through wrapper function
    `
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
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        transform: 'none',
        opacity: 1,
        margin: '1rem',
        border: '1px solid black',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: 'red',
        padding: '2rem',
        width: '10rem',
        height: '10rem',
        color: 'blue',
        fontSize: '16rem'
      });
    `,

    // Style with nested selectors
    `
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
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'red',
        color: 'blue',
        
        selectors: {
          '&:hover': {
            position: 'relative',
            opacity: 0.8,
            backgroundColor: 'blue',
            color: 'white'
          }
        }
      });
    `,
  ],
  invalid: [
    // Basic style object with incorrect concentric ordering
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
          color: 'blue',
          width: '10rem',
          display: 'flex',
          backgroundColor: 'red',
          margin: '1rem',
          position: 'relative'
        });
      `,
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
          position: 'relative',
          display: 'flex',
          margin: '1rem',
          backgroundColor: 'red',
          width: '10rem',
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
          color: 'blue',
          display: 'flex',
          backgroundColor: 'red',
          position: 'relative',

          selectors: {
            '&:hover': {
              color: 'white',
              position: 'relative',
              backgroundColor: 'blue'
            }
          }
        });
      `,
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
          position: 'relative',
          display: 'flex',
          backgroundColor: 'red',
          color: 'blue',

          selectors: {
            '&:hover': {
              position: 'relative',
              backgroundColor: 'blue',
              color: 'white'
            }
          }
        });
      `,
    },

    // Imported local wrapper with global settings style
    {
      code: `
        import { componentStyle } from './style.css.js';

        export const myStyle = componentStyle({
          padding: '18px',
          backgroundColor: 'black',
        });
      `,
      settings: {
        'vanilla-extract': {
          style: ['componentStyle'],
        },
      },
      errors: [{ messageId: 'incorrectOrder' }],
      output: `
        import { componentStyle } from './style.css.js';

        export const myStyle = componentStyle({
          backgroundColor: 'black',
          padding: '18px',
        });
      `,
    },

    // Both vanilla style and configured wrapper should be linted (wrapper augments, not replaces)
    {
      code: `
        import { style } from '@vanilla-extract/css';
        import { componentStyle } from './layer-style.css.js';

        export const a = style({
          color: 'white',
          display: 'flex',
        });

        export const b = componentStyle({
          padding: '18px',
          backgroundColor: 'black',
        });
      `,
      settings: {
        'vanilla-extract': {
          style: ['componentStyle'],
        },
      },
      errors: [{ messageId: 'incorrectOrder' }, { messageId: 'incorrectOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';
        import { componentStyle } from './layer-style.css.js';

        export const a = style({
          display: 'flex',
          color: 'white',
        });

        export const b = componentStyle({
          backgroundColor: 'black',
          padding: '18px',
        });
      `,
    },
  ],
});
