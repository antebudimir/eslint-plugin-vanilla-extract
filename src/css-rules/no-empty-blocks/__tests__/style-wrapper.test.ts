import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import { expect } from 'vitest';
import noEmptyStyleBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-blocks/style-custom',
  rule: noEmptyStyleBlocksRule,
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

    // Empty exported style object - reported but not auto-fixed because exported identifiers can be consumed in other files (e.g. as a className)
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
      output(output) {
        expect(output).toContain("export const emptyStyle = layerStyle('component', {});");
      },
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
      output(output) {
        expect(output).toContain("export const emptyStyle1 = layerStyle('component', {});");
        expect(output).toContain("export const emptyStyle2 = layerStyle('component', {});");
      },
    },

    // Export of variable with empty style - reported but not auto-fixed because the export statement still references the identifier
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
      output(output) {
        expect(output).toContain("const myEmptyStyle = layerStyle('component', {});");
        expect(output).toContain('export { myEmptyStyle };');
      },
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
  ],
});
