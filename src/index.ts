import alphabeticalOrderRule from './css-rules/alphabetical-order/index.js';
import concentricOrderRule from './css-rules/concentric-order/index.js';
import customOrderRule from './css-rules/custom-order/rule-definition.js';
import noEmptyStyleBlocksRule from './css-rules/no-empty-blocks/rule-definition.js';
import noPxUnitRule from './css-rules/no-px-unit/index.js';
import noTrailingZeroRule from './css-rules/no-trailing-zero/rule-definition.js';
import noUnknownUnitRule from './css-rules/no-unknown-unit/rule-definition.js';
import noZeroUnitRule from './css-rules/no-zero-unit/rule-definition.js';
import preferLogicalPropertiesRule from './css-rules/prefer-logical-properties/index.js';
import preferThemeTokensRule from './css-rules/prefer-theme-tokens/index.js';

const vanillaExtract = {
  meta: {
    name: '@antebudimir/eslint-plugin-vanilla-extract',
    version: '1.15.1',
  },
  rules: {
    'alphabetical-order': alphabeticalOrderRule,
    'concentric-order': concentricOrderRule,
    'custom-order': customOrderRule,
    'no-empty-style-blocks': noEmptyStyleBlocksRule,
    'no-px-unit': noPxUnitRule,
    'no-trailing-zero': noTrailingZeroRule,
    'no-unknown-unit': noUnknownUnitRule,
    'no-zero-unit': noZeroUnitRule,
    'prefer-logical-properties': preferLogicalPropertiesRule,
    'prefer-theme-tokens': preferThemeTokensRule,
  },
  configs: {},
};

Object.assign(vanillaExtract.configs, {
  recommended: {
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      'vanilla-extract/concentric-order': 'error',
      'vanilla-extract/no-empty-style-blocks': 'error',
      'vanilla-extract/no-trailing-zero': 'error',
      'vanilla-extract/no-unknown-unit': 'error',
      'vanilla-extract/no-zero-unit': 'error',
    },
  },
});

export default vanillaExtract;
