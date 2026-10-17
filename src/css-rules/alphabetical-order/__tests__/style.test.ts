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
      
      const myStyle = style({
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
      
      const myStyle = style({
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
        const myStyle = style({
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
        const myStyle = style({
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
        const myStyle = style({
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
        const myStyle = style({
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

    // Comments move together with their property when reordering
    {
      code: `
        import { style } from '@vanilla-extract/css';

        export const box = style({
          // keeps the box above the header
          zIndex: 2,
          display: 'flex', // trailing comment stays with display
          /* sizing: fixed width on purpose */
          width: 100,
          position: 'absolute',
          // !important for whatever reason
          height: '10px !important',
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';

        export const box = style({
          display: 'flex', // trailing comment stays with display
          // !important for whatever reason
          height: '10px !important',
          position: 'absolute',
          /* sizing: fixed width on purpose */
          width: 100,
          // keeps the box above the header
          zIndex: 2,
        });
      `,
    },

    // blank line between a comment and a property means the comment documents the block and shouldn't be moved
    {
      code: `
        import { style } from '@vanilla-extract/css';

        export const box = style({
          // block-level comment about the group below

          zIndex: 2,
          display: 'flex',
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';

        export const box = style({
          // block-level comment about the group below

          display: 'flex',
          zIndex: 2,
        });
      `,
    },

    // Blank lines between properties stay where they are while the props themselves move around them
    {
      code: `
        import { style } from '@vanilla-extract/css';

        export const box = style({
          margin: '10px',

          display: 'flex',
          alignItems: 'center',
        });
      `,
      errors: [{ messageId: 'alphabeticalOrder' }],
      output: `
        import { style } from '@vanilla-extract/css';

        export const box = style({
          alignItems: 'center',

          display: 'flex',
          margin: '10px',
        });
      `,
    },
  ],
});
