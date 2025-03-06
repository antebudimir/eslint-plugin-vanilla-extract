# @antebudimir/eslint-plugin-vanilla-extract

[![npm version](https://img.shields.io/npm/v/@antebudimir/eslint-plugin-vanilla-extract.svg)](https://www.npmjs.com/package/@antebudimir/eslint-plugin-vanilla-extract)

An ESLint plugin for enforcing CSS ordering in [vanilla-extract](https://github.com/vanilla-extract-css/vanilla-extract) css styles. Available presets are for alphabetical and
[concentric](https://rhodesmill.org/brandon/2011/concentric-css/) CSS ordering. The plugin also supports a custom group ordering option based on groups available in concentric CSS.

## Features

- Enforces CSS property ordering in vanilla-extract style objects with two available presets:
  - Alphabetical ordering for clean, predictable style organization
  - Concentric ordering for logical, outside-in property arrangement
- Custom group ordering option for more fine-grained control
- Built for ESLint 9 flat config system
- Provides auto-fix capability to automatically sort properties
- Handles multiple vanilla-extract APIs (style, styleVariants, recipe, globalStyle, etc.)
- Handles complex cases like nested objects, arrays of styles, and pseudo selectors
- Works with camelCase properties as used in vanilla-extract

## Requirements

- ESLint 9.0.0 or higher
- Node.js 18.18.0 or higher
- ESM (ECMAScript Modules) only

## Installation

```bash
# Using npm
npm install --save-dev @antebudimir/eslint-plugin-vanilla-extract

# Using yarn
yarn add --dev @antebudimir/eslint-plugin-vanilla-extract

# Using pnpm
pnpm add -D @antebudimir/eslint-plugin-vanilla-extract
```

## Usage

**Note: This plugin is ESM-only.** It must be used with ESM configurations and can't be used with CommonJS `require()`.

### ESLint Flat Config (ESLint 9+)

Create or update your `eslint.config.js` or `eslint.config.mjs` file:

```typescript
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

export default [
  {
    files: ['**/*.css.ts'],
    ignores: ['src/**/theme-contract.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      // 'vanilla-extract/alphabetical-order': 'warn',
      // OR
      // 'vanilla-extract/concentric-order': 'warn',
      // OR
      'vanilla-extract/custom-order': [
        'warn',
        {
          groupOrder: ['font', 'dimensions', 'margin', 'padding', 'position', 'border'], // example group order
          // optional
          sortRemainingProperties: 'concentric', // 'alphabetical' is default
        },
      ],
    },
  },
];
```

## Rules

### vanilla-extract/alphabetical-order

This rule enforces that CSS properties in vanilla-extract style objects follow alphabetical ordering.

```typescript
// ❌ Incorrect
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 19,
  marginBottom: 1,
  marginLeft: 2,
});

// ✅ Correct
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  alignItems: 'center',
  display: 'flex',
  height: 19,
  justifyContent: 'center',
  marginBottom: 1,
  marginLeft: 2,
});
```

### vanilla-extract/concentric-order

This rule enforces that CSS properties in vanilla-extract style objects follow the concentric CSS ordering pattern,
which organizes properties from outside to inside.

```typescript
// ❌ Incorrect
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  color: 'red',
  display: 'flex',
  position: 'relative',
  padding: '10px',
  margin: '20px',
});

// ✅ Correct
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  position: 'relative',
  display: 'flex',
  margin: '20px',
  padding: '10px',
  color: 'red',
});
```

### vanilla-extract/custom-order

The `vanilla-extract/custom-order` rule allows you to enforce a custom ordering of CSS properties in your vanilla-extract styles. You can specify an array of property groups in the order you prefer, and the rule will ensure that properties within these groups are sorted according to their position in the concentric CSS model. All other groups that aren't included in the groups array will have their respective properties sorted after the last group in the array. You can choose to sort them either alphabetically or following the concentric CSS order (see list of concentric groups) by setting the `sortRemainingProperties` option to 'alphabetical' or 'concentric' respectively. If not set, `sortRemainingProperties` defaults to 'alphabetical'.

To configure the rule, add it to your ESLint configuration file with your desired options. You can customize the `groups` array to include any number of available CSS property groups you want to enforce, but minimum of 1 is required.

Example usage:

```typescript
// ❌ Incorrect (Unordered)
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  color: 'blue',
  padding: '10px',
  fontFamily: 'Arial, sans-serif',
  margin: '20px',
  width: '200px',
  border: '1px solid black',
  display: 'flex',
});

// ✅ Correct
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  // font group
  fontFamily: 'Arial, sans-serif',
  color: 'blue',

  // dimensions group
  width: '200px',

  // margin group
  margin: '20px',

  // padding group
  padding: '10px',

  // display group
  display: 'flex',

  // border group
  border: '1px solid black',
});
```

## Concentric CSS Model

Here's a list of all available groups from the provided concentricGroups array:

1. boxSizing
2. position
3. display
4. flex
5. grid
6. alignment
7. columns
8. transform
9. transitions
10. visibility
11. shape
12. margin
13. outline
14. border
15. boxShadow
16. background
17. cursor
18. padding
19. dimensions
20. overflow
21. listStyle
22. tables
23. animation
24. text
25. textSpacing
26. font
27. content
28. counters
29. breaks

These groups represent different categories of CSS properties, organized in a concentric order from outside to inside. Each group contains related CSS properties that affect specific aspects of an element's styling and layout.

## Roadmap

The roadmap outlines the project's current status and future plans:

### Completed Milestones

- Initial release with support for alphabetical, concentric, and custom group CSS ordering.
- Auto-fix capability integrated into ESLint.
- Support for multiple vanilla-extract APIs (e.g., `style`, `styleVariants`, `recipe`, `globalStyle` etc.).

### Current Work

- Compatibility testing to determine if the plugin works with ESLint v8. **Note**: There are no plans to ensure compatibility if issues arise. Upcoming features will be prioritized.

### Upcoming Features

- Begin work on test coverage.
- Support for additional vanilla-extract APIs, including `fontFace`, `globalFontFace`.
- Option to sort properties within user-defined concentric groups alphabetically instead of following the concentric order. **Note**: This feature will only be implemented if there's sufficient interest from the community.

## Contributing

All well-intentioned contributions are welcome, of course! Please feel free to submit a Pull Request or get in touch via
GitHub issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
