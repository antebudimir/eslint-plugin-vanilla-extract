# @antebudimir/eslint-plugin-vanilla-extract

[![CI](https://github.com/antebudimir/eslint-plugin-vanilla-extract/actions/workflows/ci.yml/badge.svg)](https://github.com/antebudimir/eslint-plugin-vanilla-extract/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/antebudimir/eslint-plugin-vanilla-extract/badge.svg?branch=main)](https://coveralls.io/github/antebudimir/eslint-plugin-vanilla-extract?branch=main)
[![npm version](https://img.shields.io/npm/v/@antebudimir/eslint-plugin-vanilla-extract.svg)](https://www.npmjs.com/package/@antebudimir/eslint-plugin-vanilla-extract)
![NPM Downloads](https://img.shields.io/npm/d18m/%40antebudimir%2Feslint-plugin-vanilla-extract)

---

**Maintaining this plugin takes time and care! If you find it valuable, please consider supporting its development:**  
💖 GitHub Sponsors: <https://github.com/sponsors/antebudimir>  
☕ Ko-fi: <https://ko-fi.com/antebudimir>  
💸 Revolut: <https://revolut.me/antebudimir>  
🟡 Liberapay: <https://liberapay.com/antebudimir>  

---

An ESLint plugin for enforcing best practices in
[vanilla-extract](https://github.com/vanilla-extract-css/vanilla-extract) CSS styles, including CSS property ordering
and additional linting rules. Available presets are for alphabetical and
[concentric](https://rhodesmill.org/brandon/2011/concentric-css/) CSS ordering. The plugin also supports a custom group
ordering option based on groups available in [concentric CSS](src/css-rules/concentric-order/concentric-groups.ts).

## Demo

![Plugin Demo](https://github.com/user-attachments/assets/93ba118d-84df-4da0-ac68-fdb429e581d6)

## Features

- Enforces CSS property ordering in vanilla-extract style objects with two available presets:
  - Alphabetical ordering for clean, predictable style organization
  - Concentric ordering for logical, outside-in property arrangement
- Custom group ordering option for more fine-grained control
- Compatible with ESLint 8.57.0+ and fully optimized for ESLint 9's flat config system
- Provides auto-fix capability to automatically sort properties
- Handles multiple vanilla-extract APIs (style, styleVariants, recipe, globalStyle, etc.)
- Handles complex cases like nested objects, arrays of styles, and pseudo selectors
- Works with camelCase properties as used in vanilla-extract
- Additional linting rules for enhanced code quality (see roadmap for upcoming features)
- Automatic wrapper function detection - works with custom wrapper functions that call vanilla-extract APIs, using
  reference tracking to apply all rules regardless of how vanilla-extract functions are wrapped

## Requirements

- ESLint 8.57.0 or higher
- Node.js 18.18.0 or higher
- ESM (ECMAScript Modules) only
- Flat config system using either:
  - `eslint.config.mjs` (recommended, always works with ESM plugins)
  - `eslint.config.js` (only if your package.json has `"type": "module"`)

## Installation

```bash
# Using npm
npm install --save-dev @antebudimir/eslint-plugin-vanilla-extract

# Using yarn
yarn add --dev @antebudimir/eslint-plugin-vanilla-extract

# Using pnpm
pnpm add -D @antebudimir/eslint-plugin-vanilla-extract

# For ESLint 8.57.0 with flat config, you'll also need:
npm install --save-dev @eslint/eslintrc @eslint/js
yarn add --dev @eslint/eslintrc @eslint/js
pnpm add -D @eslint/eslintrc @eslint/js
```

## Usage

**Note: This plugin is ESM-only.** It must be used with ESM configurations and can't be used with CommonJS `require()`.

### Configuration Options

There are two main ways to configure this plugin in your ESLint flat config:

### Option 1: Using extends (recommended, available from v1.10.0)

The simplest and most concise way to apply the recommended ruleset:

```typescript
import { defineConfig } from 'eslint/config';
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

export default defineConfig([
  {
    files: ['**/*.css.ts'],
    ignores: ['src/**/theme-contract.css.ts'],
    extends: [vanillaExtract.configs.recommended],
    // You can still override rules when using extends
    // rules: {
    //   'vanilla-extract/concentric-order': 'off',
    //   'vanilla-extract/alphabetical-order': 'error',
    // },
  },
];
```

### Option 2: Using plugins with explicit rule spreading

This approach is more explicit - you manually register the plugin and spread the recommended rules:

```typescript
import { defineConfig } from 'eslint/config';
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

export default defineConfig([
  {
    files: ['**/*.css.ts'],
    ignores: ['src/**/theme-contract.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      // Apply all recommended rules
      ...vanillaExtract.configs.recommended.rules,

      // Optionally override specific rules
      // 'vanilla-extract/concentric-order': 'warn', // Change severity from error to warn
      // 'vanilla-extract/no-empty-style-blocks': 'off', // Disable a recommended rule
      // 'vanilla-extract/no-zero-unit': 'warn', // Change severity from error to warn

      // Switch to a different ordering rule (see "Important" section below)
      // 'vanilla-extract/concentric-order': 'off',
      // 'vanilla-extract/alphabetical-order': 'error',
    },
  },
];
```

#### Important: Only Enable One Ordering Rule at a Time

The plugin includes three CSS property ordering rules: `alphabetical-order`, `concentric-order`, and `custom-order`. **Only one ordering rule should be enabled at a time** to avoid conflicting auto-fixes.

If you want to use a different ordering rule than the one in the recommended config, you must explicitly disable the default rule.

##### Example: Switching from concentric to alphabetical ordering

```typescript
export default [
  {
    files: ['**/*.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      ...vanillaExtract.configs.recommended.rules,
      'vanilla-extract/concentric-order': 'off',      // Disable the default
      'vanilla-extract/alphabetical-order': 'error',  // Enable alphabetical
    },
  },
];
```

##### Example: Using custom-order instead of the recommended concentric-order

```typescript
export default [
  {
    files: ['**/*.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      ...vanillaExtract.configs.recommended.rules,
      'vanilla-extract/concentric-order': 'off',  // Disable the default
      'vanilla-extract/custom-order': [
        'error',
        {
          groupOrder: ['font', 'dimensions', 'margin', 'padding', 'position', 'border'],
          sortRemainingProperties: 'alphabetical',
        },
      ],
    },
  },
];
```

> **⚠️ Warning:** If multiple ordering rules are enabled simultaneously, they will produce conflicting auto-fixes that ESLint cannot apply, causing auto-fix on save to fail. Always ensure only one ordering rule is active.

### Using with FlatCompat (for ESLint 8.57.0 & 8.57.1)

If you're migrating from legacy ESLint configurations, you can use the `FlatCompat` utility to convert them while adding
vanilla-extract support:

```typescript
import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

// Mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a compatibility layer instance
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // Convert your existing ESLint configs
  ...compat.config({
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      // etc
    ],
  }),

  // Add vanilla-extract by using explicit rule config
  {
    files: ['**/*.css.ts'],
    ignores: ['src/**/theme-contract.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      // Apply all recommended rules
      ...vanillaExtract.configs.recommended.rules,
      // or specify rule by rule as described above
    },
  },
];
```

#### Common Issues with FlatCompat

1. **Error: "Unexpected top-level property 'files'"**

   - Solution: When using `compat.config()`, use `overrides` instead of `files` at the top level.

2. **Error: "Missing parameter 'recommendedConfig' in FlatCompat constructor"**

   - Solution: Import `js` from `@eslint/js` and add `recommendedConfig: js.configs.recommended` to the FlatCompat
     constructor.

3. **Error: "Unexpected undefined config at user-defined index 0"**
   - Solution: Make sure you're using a default export for your configuration array.

### VS Code Integration

For VS Code users, add these settings to your `.vscode/settings.json`:

```json
{
  "eslint.useFlatConfig": true,
  "eslint.experimental.useFlatConfig": true,
  "eslint.validate": ["javascript", "typescript", "typescriptreact"]
}
```

### Recommended Configuration

The recommended configuration enables the following rules with error severity:

- `vanilla-extract/concentric-order`: Enforces concentric CSS property ordering
- `vanilla-extract/no-empty-style-blocks`: Prevents empty style blocks
- `vanilla-extract/no-unknown-unit`: Prohibits usage of unrecognized CSS units
- `vanilla-extract/no-zero-unit`: Removes unnecessary units for zero values

**Additional rules available** (not enabled by default):

- `vanilla-extract/alphabetical-order`: Alternative ordering rule (alphabetical sorting)
- `vanilla-extract/custom-order`: Alternative ordering rule (custom group-based sorting)

You can use the recommended configuration as a starting point and override rules as needed for your project. See the configuration examples above for how to switch between ordering rules.

### Custom Configuration

If you prefer not to use the recommended configuration, you can still configure rules manually:

```typescript
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
      'vanilla-extract/no-unknown-unit': 'error',
      'vanilla-extract/no-zero-unit': 'warn',
    },
  },
];
```

> **Note:** Remember to enable only one ordering rule at a time. See the "Important" section above for details on switching between ordering rules.

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

The `vanilla-extract/custom-order` rule enables you to enforce a custom ordering of CSS properties in your
vanilla-extract styles. You can specify an array of property groups in your preferred order, and the rule will ensure
that properties within these groups are sorted according to their position in the concentric CSS model.

Key features of this rule include:

1. Custom group ordering: Define your preferred order of CSS property groups.
2. Handling of unspecified groups: All groups not included in the custom array will have their properties sorted after
   the last specified group.
3. Flexible sorting options: You can choose to sort remaining properties either alphabetically or following the
   concentric CSS order by setting the `sortRemainingProperties` option to 'alphabetical' or 'concentric' respectively.

Default behavior:

- If not set, `sortRemainingProperties` defaults to 'alphabetical'.
- If no `groupOrder` is specified or an empty array is provided, the rule will default to sorting all properties
  alphabetically, and `sortRemainingProperties` will be ignored even if set.

To configure the rule, add it to your ESLint configuration file with your desired options. You can customize the
`groups` array to include any number of available CSS property groups you want to enforce, with a minimum of one group
required.

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

### vanilla-extract/no-empty-style-blocks

This rule detects and prevents empty style blocks in vanilla-extract stylesheets. It helps maintain cleaner codebases by
eliminating empty style definitions that often result from incomplete refactoring or forgotten implementations.

```typescript
// ❌ Incorrect
import { style } from '@vanilla-extract/css';

export const emptyStyle = style({});

export const nestedEmpty = style({
  color: 'blue',

  ':hover': {},
  '@media': {
    '(min-width: 768px)': {},
  },
});

export const recipeWithEmptyVariants = recipe({
  base: { color: 'black' },
  variants: {},
});

// ✅ Correct
import { style } from '@vanilla-extract/css';

export const nestedEmpty = style({
  color: 'blue',
});

export const recipeWithEmptyVariants = recipe({
  base: { color: 'black' },
});
```

## vanilla-extract/no-unknown-unit

This rule enforces the use of valid CSS units in vanilla-extract style objects. It prevents typos and non-standard units
that could cause styling issues or browser compatibility problems.

```typescript
// ❌ Incorrect
import { style, globalStyle, recipe } from '@vanilla-extract/css';

export const invalidStyle = style({
  margin: '5abc', // Non-existent unit
  fontSize: '1.5rems', // Typo in unit
});

export const myRecipe = recipe({
  variants: {
    size: {
      large: { padding: '4xm' }, // Invalid unit
    },
  },
});

// ✅ Correct
import { style, globalStyle, recipe } from '@vanilla-extract/css';

export const validStyle = style({
  margin: '5rem',
  fontSize: '1.5rem',
});

export const myRecipe = recipe({
  variants: {
    size: {
      large: { padding: '4em' },
    },
  },
});
```

## vanilla-extract/no-zero-unit

This rule enforces the removal of unnecessary units for zero values in vanilla-extract style objects. It helps maintain
cleaner and more consistent CSS by eliminating redundant units when the value is zero.

```typescript
// ❌ Incorrect
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  margin: '0px',
  padding: '0rem',
  width: '0%',
  height: '0vh',
  top: '-0em',
});

// ✅ Correct
import { style } from '@vanilla-extract/css';

export const myStyle = style({
  margin: '0',
  padding: '0',
  width: '0',
  height: '0',
  top: '0',
});
```

## Font Face Declarations

For `fontFace` and `globalFontFace` API calls, all three ordering rules (alphabetical, concentric, and custom) enforce
the same special ordering:

1. The `src` property always appears first
2. All remaining properties are sorted alphabetically

This special handling is applied because:

- The `src` property is the most critical property in font face declarations
- Consistent ordering improves readability for these specific APIs
- Font-related properties are specialized and benefit from standardized ordering

```typescript
// ✅ Correct ordering for font faces
export const theFont = fontFace({
  src: ['url("/fonts/MyFont.woff2") format("woff2")', 'url("/fonts/MyFont.woff") format("woff")'],
  ascentOverride: '90%',
  descentOverride: '10%',
  fontDisplay: 'swap',
  fontFeatureSettings: '"liga" 1',
  fontStretch: 'normal',
  // ...other properties in alphabetical order
});
```

Opinionated, but it is what it is. If someone has a suggestion for a better ordering, let me know!

## Concentric CSS Model

Here's a list of all available groups from the provided
[concentricGroups](src/css-rules/concentric-order/concentric-groups.ts) array:

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

These groups represent different categories of CSS properties, organized in a concentric order from outside to inside.
Each group contains related CSS properties that affect specific aspects of an element's styling and layout.

## Roadmap

The roadmap outlines the project's current status and future plans:

### Completed Milestones

- Initial release with support for alphabetical, concentric, and custom group CSS ordering.
- Auto-fix capability integrated into ESLint.
- Support for multiple vanilla-extract APIs (e.g., `style`, `styleVariants`, `recipe`, `globalStyle`, `fontFace`, etc.).
- `no-empty-style-blocks` rule to disallow empty blocks.
- Recommended ESLint configuration for the plugin.
- `no-zero-unit` rule to disallow units when the value is zero.
- `no-unknown-unit` rule to disallow unknown units.
- Support for using the plugin’s recommended config via the extends field (as discussed in
  [issue #3](https://github.com/antebudimir/eslint-plugin-vanilla-extract/issues/3))
- Comprehensive rule testing.

### Current Work

- `no-number-trailing-zero` rule to disallow trailing zeros in numbers.

### Upcoming Features

- `no-px-unit` rule to disallow use of `px` units with configurable whitelist.
- `prefer-logical-properties` rule to enforce use of logical properties.
- `prefer-theme-tokens` rule to enforce use of theme tokens instead of hard-coded values when available.
- `no-global-style` rule to disallow use of `globalStyle` function.
- `property-unit-match` rule to enforce valid units per CSS property specs. **Note**: This feature will only be
  implemented if there's sufficient interest from the community.
- Option to sort properties within user-defined concentric groups alphabetically instead of following the concentric
  order. **Note**: This feature will only be implemented if there's sufficient interest from the community.

## Contributing

All well-intentioned contributions are welcome, of course! Please feel free to submit a Pull Request or get in touch via
GitHub issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
