import tsParser from '@typescript-eslint/parser';
import { run } from 'eslint-vitest-rule-tester';
import noEmptyStyleBlocksRule from '../rule-definition.js';

run({
  name: 'vanilla-extract/no-empty-style-blocks/recipe',
  rule: noEmptyStyleBlocksRule,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  valid: [
    // Recipe with non-empty variants
    `
    import { recipe } from '@vanilla-extract/recipes';
    
    const myRecipe = recipe({
      base: {
        color: 'black'
      },
      variants: {
        color: {
          blue: { color: 'blue' },
          red: { color: 'red' }
        }
      }
    });
  `,

    // Tests the early return when property.type !== 'Property'
    // Valid because the spread operator is skipped by the rule (early return)
    // This covers the code path: if (property.type !== 'Property') { return; }
    `
    import { recipe } from '@vanilla-extract/recipes';
    
    const recipeWithSpreadProperty = recipe({
      ...{ someProperty: true },
      base: { color: 'black' }
    });
  `,

    // Tests the early return when property name cannot be determined
    // Valid because computed properties are skipped by the rule (early return)
    // This covers the code path: if (!propertyName) { return; }
    `
    import { recipe } from '@vanilla-extract/recipes';
    
    function computedKey() { return 'dynamicKey'; }
    
    const recipeWithComputedProperty = recipe({
      [computedKey()]: { color: 'black' },
      base: { color: 'black' }
    });
  `,

    // Tests the early return when variantCategoryProperty is not a Property or its value is not an ObjectExpression
    // Valid because non-Property variant categories or non-ObjectExpression values are skipped by the rule
    // This covers the code path: if (variantCategoryProperty.type !== 'Property' || variantCategoryProperty.value.type !== 'ObjectExpression') { return; }
    `
  import { recipe } from '@vanilla-extract/recipes';
  
  const recipeWithNonPropertyVariantCategory = recipe({
    base: { color: 'black' },
    variants: {
      ...{ size: { small: { fontSize: '12px' } } },
      color: {
        blue: { color: 'blue' }
      }
    }
  });
`,

    // Tests the early return when variantValueProperty is not a Property
    // Valid because non-Property variant values are skipped by the rule
    // This covers the code path: if (variantValueProperty.type !== 'Property') { return; }
    `
  import { recipe } from '@vanilla-extract/recipes';
  
  const recipeWithNonPropertyVariantValue = recipe({
    base: { color: 'black' },
    variants: {
      color: {
        ...{ blue: { color: 'blue' } },
        red: { color: 'red' }
      }
    }
  });
`,

    // Recipe with sprinkles() in base - should be valid
    `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'], flexDirection: ['row'], flexWrap: ['wrap-reverse'] }
    }));
    
    export const columnsStyle = recipe({
      base: sprinkles({ display: 'flex', flexDirection: 'row' }),
      variants: {
        wrappingDirection: {
          reverse: sprinkles({ flexWrap: 'wrap-reverse' }),
        },
      },
    });
  `,

    // Recipe with sprinkles() in variant values - should be valid
    `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px', '16px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          large: sprinkles({ padding: '16px' }),
        },
      },
    });
  `,

    // Recipe with style() calls in variant values - should be valid
    `
    import { recipe } from '@vanilla-extract/recipes';
    import { style } from '@vanilla-extract/css';
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        size: {
          small: style({ fontSize: '12px' }),
          large: style({ fontSize: '16px' }),
        },
      },
    });
  `,

    // Recipe with mixed CallExpression and ObjectExpression in variants - should be valid
    `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        variant: {
          sprinkled: sprinkles({ padding: '8px' }),
          regular: { padding: '8px' },
        },
      },
    });
  `,

    // Recipe with only CallExpression variants (no default) - should be valid
    `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { flexWrap: ['wrap-reverse'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        wrappingDirection: {
          reverse: sprinkles({ flexWrap: 'wrap-reverse' }),
        },
      },
    });
  `,

    // Recipe with nested CallExpression in multiple variant categories - should be valid
    `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'], padding: ['8px', '16px'], color: ['blue', 'gray'] }
    }));
    
    const myRecipe = recipe({
      base: sprinkles({ display: 'flex' }),
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          large: sprinkles({ padding: '16px' }),
        },
        color: {
          primary: sprinkles({ color: 'blue' }),
          secondary: sprinkles({ color: 'gray' }),
        },
      },
    });
  `,
  ],
  invalid: [
    // Empty recipe
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        export const emptyRecipe = recipe({});
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        
      `,
    },

    // Recipe with empty base
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const recipeWithEmptyBase = recipe({
          base: {},
          variants: {
            color: {
              blue: { color: 'blue' }
            }
          }
        });
      `,
      errors: [{ messageId: 'emptyRecipeProperty' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const recipeWithEmptyBase = recipe({
          
          variants: {
            color: {
              blue: { color: 'blue' }
            }
          }
        });
      `,
    },

    // Recipe with empty variant values
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const recipeWithEmptyVariantValues = recipe({
          base: { color: 'black' },
          variants: {
            color: {
              blue: {},
              red: {}
            }
          }
        });
      `,
      errors: [{ messageId: 'emptyVariantCategory' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        
        const recipeWithEmptyVariantValues = recipe({
          base: { color: 'black' },
          
        });
      `,
    },

    // Recipe with both empty base and variants
    {
      code: `
        import { recipe } from '@vanilla-extract/recipes';
        
        export const recipeWithBothEmpty = recipe({
          base: {},
          variants: {}
        });
      `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
      output: `
        import { recipe } from '@vanilla-extract/recipes';
        
      `,
    },

    // Test for non-object property values in recipe
    //
    {
      code: `
      import { recipe } from '@vanilla-extract/recipes';

      const recipeWithNonObjectValue = recipe({
        base: { color: 'black' },
        variants: {
          color: {
            blue: "blue", // String instead of object
            red: { color: 'red' }
          }
        }
      });
    `,
      errors: [{ messageId: 'invalidPropertyType' }],
    },

    // Tests the Identifier type handling in variant values
    // This covers the code path where friendlyType === 'Identifier'
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    
    const colorValue = { color: 'blue' };
    
    const recipeWithIdentifierValue = recipe({
      base: { color: 'black' },
      variants: {
        color: {
          blue: colorValue // Using a variable (Identifier) instead of an object literal
        }
      }
    });
  `,
      errors: [{ messageId: 'invalidPropertyType', data: { type: 'variable' } }],
    },

    // Test for handling null literal values in variant properties
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    
    const recipeWithNullVariantValue = recipe({
      base: { color: 'black' },
      variants: {
        color: {
          blue: null,
          red: { color: 'red' }
        }
      }
    });
  `,
      errors: [{ messageId: 'invalidPropertyType', data: { type: 'null' } }],
    },

    // This test ensures the rule correctly identifies and reports empty object values in variants
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    
    const recipeWithEmptyVariantValue = recipe({
      base: { color: 'black' },
      variants: {
        color: {
          blue: {}, // Empty object should be reported
          red: { color: 'red' } // Non-empty to prevent category-level reporting
        }
      }
    });
    
    const anotherRecipe = recipe({
      base: { color: 'black' },
      variants: {
        color: {
          blue: {}, // Another empty object that should be reported
          red: { color: 'red' }
        }
      }
    });
  `,
      errors: [{ messageId: 'emptyVariantValue' }, { messageId: 'emptyVariantValue' }],
    },

    // Tests the default case for node type handling in variant values
    // This covers the code path where neither Literal nor Identifier conditions are met
    {
      code: `
  import { recipe } from '@vanilla-extract/recipes';
  
  const recipeWithArrowFunctionValue = recipe({
    base: { color: 'black' },
    variants: {
      color: {
        blue: () => ({ color: 'blue' }), // Arrow function instead of an object literal
        red: { color: 'red' }
      }
    }
  });
`,
      errors: [{ messageId: 'invalidPropertyType', data: { type: 'ArrowFunctionExpression' } }],
    },

    // Recipe with empty variant category alongside CallExpression variants
    // Should only report the empty category, not the CallExpression
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px', '16px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          large: sprinkles({ padding: '16px' }),
        },
        emptyCategory: {},
      },
    });
  `,
      errors: [{ messageId: 'emptyVariantCategory' }],
      output: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px', '16px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          large: sprinkles({ padding: '16px' }),
        },
        
      },
    });
  `,
    },

    // Recipe with CallExpression in base and empty variants
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'] }
    }));
    
    const myRecipe = recipe({
      base: sprinkles({ display: 'flex' }),
      variants: {},
    });
  `,
      errors: [{ messageId: 'emptyRecipeProperty' }],
      output: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'] }
    }));
    
    const myRecipe = recipe({
      base: sprinkles({ display: 'flex' }),
      
    });
  `,
    },

    // Recipe with mixed valid CallExpression and invalid literal in same category
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          invalid: 'invalid-string',
        },
      },
    });
  `,
      errors: [{ messageId: 'invalidPropertyType' }],
    },

    // Recipe with sprinkles({}) in base and empty variants - entire recipe is empty
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'] }
    }));
    
    export const myRecipe = recipe({
      base: sprinkles({}),
      variants: {},
    });
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }],
    },

    // Recipe with sprinkles({}) in variant value - should be flagged as empty
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          empty: sprinkles({}),
        },
      },
    });
  `,
      errors: [{ messageId: 'emptyVariantValue' }],
      output: `
    import { recipe } from '@vanilla-extract/recipes';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { padding: ['8px'] }
    }));
    
    const myRecipe = recipe({
      base: { color: 'black' },
      variants: {
        spacing: {
          small: sprinkles({ padding: '8px' }),
          
        },
      },
    });
  `,
    },

    // Recipe with both base and variants using empty CallExpressions - entire recipe becomes empty
    {
      code: `
    import { recipe } from '@vanilla-extract/recipes';
    import { style } from '@vanilla-extract/css';
    import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
    
    const sprinkles = createSprinkles(defineProperties({
      properties: { display: ['flex'] }
    }));
    
    export const myRecipe = recipe({
      base: style({}),
      variants: {
        layout: {
          flex: sprinkles({}),
        },
      },
    });
  `,
      errors: [{ messageId: 'emptyStyleDeclaration' }, { messageId: 'emptyVariantValue' }],
    },
  ],
});
