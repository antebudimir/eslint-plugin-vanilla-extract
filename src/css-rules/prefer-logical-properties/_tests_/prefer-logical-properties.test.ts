import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import preferLogicalPropertiesRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/prefer-logical-properties',
  rule: preferLogicalPropertiesRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginInlineStart: '1rem',
          marginInlineEnd: '1rem',
          marginBlockStart: '2rem',
          marginBlockEnd: '2rem',
        });
      `,
      name: 'allows logical properties in camelCase',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          'margin-inline-start': '1rem',
          'margin-inline-end': '1rem',
          'margin-block-start': '2rem',
          'margin-block-end': '2rem',
        });
      `,
      name: 'allows logical properties in kebab-case',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          insetInlineStart: 0,
          insetInlineEnd: 0,
          insetBlockStart: 0,
          insetBlockEnd: 0,
        });
      `,
      name: 'allows logical inset properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderInlineStartWidth: '1px',
          borderInlineEndColor: 'red',
          borderBlockStartStyle: 'solid',
        });
      `,
      name: 'allows logical border properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          inlineSize: '100%',
          blockSize: '50vh',
          minInlineSize: '200px',
          maxBlockSize: '800px',
        });
      `,
      name: 'allows logical size properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          textAlign: 'start',
          float: 'inline-start',
          clear: 'inline-end',
        });
      `,
      name: 'allows logical values for directional properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginLeft: '1rem',
          paddingTop: '2rem',
          top: 0,
          left: 0,
        });
      `,
      options: [{ allow: ['marginLeft', 'paddingTop', 'top', 'left'] }],
      name: 'respects allowlist for camelCase properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          'margin-left': '1rem',
          'padding-top': '2rem',
        });
      `,
      options: [{ allow: ['margin-left', 'padding-top'] }],
      name: 'respects allowlist for kebab-case properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginLeft: '1rem',
        });
      `,
      options: [{ allow: ['margin-left'] }],
      name: 'allowlist works with mixed case (kebab in config, camel in code)',
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            marginInlineStart: '1rem',
            paddingBlockEnd: '2rem',
          },
          variants: {
            size: {
              sm: { insetInlineStart: 0 },
              lg: { borderInlineEndWidth: '2px' },
            },
          },
        });
      `,
      name: 'allows logical properties in recipe base and variants',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '@media': {
            '(min-width: 768px)': {
              marginInlineStart: '2rem',
            },
          },
          selectors: {
            '&:hover': {
              paddingBlockStart: '1rem',
            },
          },
        });
      `,
      name: 'allows logical properties in nested @media and selectors',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          color: 'red',
          display: 'flex',
          fontSize: '16px',
        });
      `,
      name: 'ignores non-directional properties',
    },
  ],
  invalid: [
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginTop: '1rem',
          marginBottom: '2rem',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginBlockStart: '1rem',
          marginBlockEnd: '2rem',
        });
      `,
      errors: [
        {
          messageId: 'preferLogicalProperty',
          data: { physical: 'marginTop', logical: 'marginBlockStart' },
        },
        {
          messageId: 'preferLogicalProperty',
          data: { physical: 'marginBottom', logical: 'marginBlockEnd' },
        },
      ],
      name: 'reports and fixes margin properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          'padding-left': '1rem',
          'padding-right': '2rem',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          'padding-inline-start': '1rem',
          'padding-inline-end': '2rem',
        });
      `,
      errors: [
        {
          messageId: 'preferLogicalProperty',
          data: { physical: 'padding-left', logical: 'padding-inline-start' },
        },
        {
          messageId: 'preferLogicalProperty',
          data: { physical: 'padding-right', logical: 'padding-inline-end' },
        },
      ],
      name: 'reports and fixes kebab-case padding properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          insetBlockStart: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          insetBlockEnd: 0,
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes positioning properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderLeftWidth: '1px',
          borderRightColor: 'red',
          borderTopStyle: 'solid',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderInlineStartWidth: '1px',
          borderInlineEndColor: 'red',
          borderBlockStartStyle: 'solid',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes border sub-properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderLeft: '1px solid red',
          borderRight: '2px dashed blue',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderInlineStart: '1px solid red',
          borderInlineEnd: '2px dashed blue',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes border shorthand properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderTopLeftRadius: '4px',
          borderBottomRightRadius: '8px',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          borderStartStartRadius: '4px',
          borderEndEndRadius: '8px',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes border radius properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          width: '100px',
          height: '200px',
          minWidth: '50px',
          maxHeight: '400px',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          inlineSize: '100px',
          blockSize: '200px',
          minInlineSize: '50px',
          maxBlockSize: '400px',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes size properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          overflowX: 'auto',
          overflowY: 'hidden',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          overflowInline: 'auto',
          overflowBlock: 'hidden',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes overflow properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          textAlign: 'left',
          float: 'right',
          clear: 'left',
          resize: 'horizontal',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          textAlign: 'start',
          float: 'inline-end',
          clear: 'inline-start',
          resize: 'inline',
        });
      `,
      errors: [
        {
          messageId: 'preferLogicalValue',
          data: { property: 'textAlign', physical: 'left', logical: 'start' },
        },
        {
          messageId: 'preferLogicalValue',
          data: { property: 'float', physical: 'right', logical: 'inline-end' },
        },
        {
          messageId: 'preferLogicalValue',
          data: { property: 'clear', physical: 'left', logical: 'inline-start' },
        },
        {
          messageId: 'preferLogicalValue',
          data: { property: 'resize', physical: 'horizontal', logical: 'inline' },
        },
      ],
      name: 'reports and fixes directional values',
    },
    {
      code: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            marginLeft: '1rem',
            paddingTop: '2rem',
          },
          variants: {
            size: {
              sm: { left: 0 },
              lg: { borderRightWidth: '2px' },
            },
          },
        });
      `,
      output: `
        import { recipe } from '@vanilla-extract/css';
        const myRecipe = recipe({
          base: {
            marginInlineStart: '1rem',
            paddingBlockStart: '2rem',
          },
          variants: {
            size: {
              sm: { insetInlineStart: 0 },
              lg: { borderInlineEndWidth: '2px' },
            },
          },
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes physical properties in recipe base and variants',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '@media': {
            '(min-width: 768px)': {
              marginLeft: '2rem',
              paddingTop: '1rem',
            },
          },
          selectors: {
            '&:hover': {
              right: 0,
              bottom: 0,
            },
          },
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          '@media': {
            '(min-width: 768px)': {
              marginInlineStart: '2rem',
              paddingBlockStart: '1rem',
            },
          },
          selectors: {
            '&:hover': {
              insetInlineEnd: 0,
              insetBlockEnd: 0,
            },
          },
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes physical properties in nested @media and selectors',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          scrollMarginLeft: '10px',
          scrollPaddingTop: '20px',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          scrollMarginInlineStart: '10px',
          scrollPaddingBlockStart: '20px',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes scroll margin and padding properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          overscrollBehaviorX: 'contain',
          overscrollBehaviorY: 'auto',
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          overscrollBehaviorInline: 'contain',
          overscrollBehaviorBlock: 'auto',
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalProperty' },
      ],
      name: 'reports and fixes overscroll behavior properties',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginLeft: \`1rem\`,
          textAlign: \`left\`,
        });
      `,
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginInlineStart: \`1rem\`,
          textAlign: \`start\`,
        });
      `,
      errors: [
        { messageId: 'preferLogicalProperty' },
        { messageId: 'preferLogicalValue' },
      ],
      name: 'handles template literals',
    },
    {
      code: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginLeft: '1rem',
          paddingTop: '2rem',
        });
      `,
      options: [{ allow: ['paddingTop'] }],
      output: `
        import { style } from '@vanilla-extract/css';
        const myStyle = style({
          marginInlineStart: '1rem',
          paddingTop: '2rem',
        });
      `,
      errors: [
        {
          messageId: 'preferLogicalProperty',
          data: { physical: 'marginLeft', logical: 'marginInlineStart' },
        },
      ],
      name: 'only reports non-allowlisted properties',
    },
  ],
});
