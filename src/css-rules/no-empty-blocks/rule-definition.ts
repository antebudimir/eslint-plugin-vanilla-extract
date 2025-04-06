import type { Rule } from 'eslint';
import { createEmptyStyleVisitors } from './empty-style-visitor-creator.js';

const noEmptyStyleBlocksRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow empty style blocks in vanilla-extract stylesheets',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      emptyConditionalStyle: 'Empty conditional style object should be removed.',
      emptyMedia: 'Empty @media object should be removed.',
      emptyNestedStyle: 'Empty nested style object should be removed.',
      emptyRecipeProperty: 'Empty {{propertyName}} object in recipe should be removed.',
      emptySelectors: 'Empty selectors object should be removed.',
      emptySpreadObject: 'Empty spread object should be removed.',
      emptyStyleDeclaration: 'Declarations with only empty style blocks should be removed.',
      emptySupports: 'Empty @supports object should be removed.',
      emptyVariantCategory: 'Empty variant category should be removed.',
      emptyVariantValue: 'Empty variant value should be removed.',
      invalidPropertyType: 'Variant values must be objects, found {{type}} instead.',
    },
  },
  create(ruleContext) {
    return createEmptyStyleVisitors(ruleContext);
  },
};

export default noEmptyStyleBlocksRule;
