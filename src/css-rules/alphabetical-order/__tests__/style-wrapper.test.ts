import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import alphabeticalOrderRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/alphabetical-order/style',
  rule: alphabeticalOrderRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Basic style object with alphabetical ordering
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
        alignItems: 'center',
        backgroundColor: 'red',
        color: 'blue',
        display: 'flex',
        margin: '10px',
        padding: '20px',
        zIndex: 1
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
        alignItems: 'center',
        backgroundColor: 'red',
        color: 'blue',
        selectors: {
          '&:hover': {
            backgroundColor: 'blue',
            color: 'white'
          }
        }
      });
    `,
  ],
  invalid: [
    // Basic style object with incorrect ordering
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
          backgroundColor: 'red',
          alignItems: 'center',
          padding: '20px',
          color: 'blue',
          margin: '10px',
          display: 'flex',
          zIndex: 1
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
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
          alignItems: 'center',
          backgroundColor: 'red',
          color: 'blue',
          display: 'flex',
          margin: '10px',
          padding: '20px',
          zIndex: 1
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
          backgroundColor: 'red',
          alignItems: 'center',
          color: 'blue',
          selectors: {
            '&:hover': {
              color: 'white',
              backgroundColor: 'blue'
            }
          }
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }, { messageId: 'alphabeticalOrder' }],
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
          alignItems: 'center',
          backgroundColor: 'red',
          color: 'blue',
          selectors: {
            '&:hover': {
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
      errors: [{ messageId: 'alphabeticalOrder' }],
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
        import { componentStyle } from './style.css.js';

        export const a = style({
          display: 'flex',
          color: 'white',
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
      errors: [{ messageId: 'alphabeticalOrder' }, { messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';
        import { componentStyle } from './style.css.js';

        export const a = style({
          color: 'white',
          display: 'flex',
        });

        export const b = componentStyle({
          backgroundColor: 'black',
          padding: '18px',
        });
      `,
    },
  ],
});
