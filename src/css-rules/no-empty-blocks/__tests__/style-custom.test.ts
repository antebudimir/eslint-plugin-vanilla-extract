import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-blocks/style-custom',
  rule: noEmptyBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Basic non-empty style through wrapper function
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
        color: 'blue',
        margin: '10px'
      });
    `,

    // Style with comments (not empty)
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
        /* This is a comment */
        color: 'blue'
      });
    `,
  ],
  invalid: [
    // Empty style object through wrapper function
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
        
        const emptyStyle = layerStyle('component', {});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
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
        
      `,
    },

    // Empty exported style object
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
        
        export const emptyStyle = layerStyle('component', {});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
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
        
      `,
    },

    // Style with empty nested selectors
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

        const styleWithComments = layerStyle('component', {
          /* This is an empty style */
        });
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
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

        export const emptyStyle1 = layerStyle('component', {});
        export const emptyStyle2 = layerStyle('component', {});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }, { messageId: 'emptyStyleDeclaration' }],
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

      `,
    },

    // Export of variable with empty style
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

        const myEmptyStyle = layerStyle('component', {});
        export { myEmptyStyle };
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
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

        export { myEmptyStyle };
      `,
    },

    // Style in a callback or nested function
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
    
    [1, 2, 3].forEach(() => {
      layerStyle('component', {});
    });
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
    },

    // Variable declaration with empty style
    // {
    //   code: `
    //     import { style } from '@vanilla-extract/css';

    //     export const layerStyle = (
    //       layer: 'reset' | 'theme' | 'component' | 'utilities',
    //       rule: StyleRule,
    //       debugId?: string,
    //     ) =>
    //       style(
    //           {
    //               '@layer': {
    //                   [layerMap[layer]]: rule,
    //               },
    //           },
    //           debugId,
    //       );

    //     const { className } = layerStyle('component', {});
    //   `,
    //   errors: [{ messageId: 'emptyStyleDeclaration' }],
    //   output: `
    //     import { style } from '@vanilla-extract/css';

    //   `,
    // },
  ],
});
