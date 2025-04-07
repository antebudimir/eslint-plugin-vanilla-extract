import alphabeticalOrderRule from './css-rules/alphabetical-order/index.js';
import concentricOrderRule from './css-rules/concentric-order/index.js';
import customOrderRule from './css-rules/custom-order/rule-definition.js';
import noEmptyStyleBlocksRule from './css-rules/no-empty-blocks/rule-definition.js';

export const vanillaExtract = {
  meta: {
    name: '@antebudimir/eslint-plugin-vanilla-extract',
    version: '1.7.0',
  },
  rules: {
    'alphabetical-order': alphabeticalOrderRule,
    'concentric-order': concentricOrderRule,
    'custom-order': customOrderRule,
    'no-empty-style-blocks': noEmptyStyleBlocksRule,
  },
  configs: {
    recommended: {
      plugins: ['vanilla-extract'],
      rules: {
        'vanilla-extract/concentric-order': 'error',
        'vanilla-extract/no-empty-style-blocks': 'error',
      },
    },
  },
};

export default vanillaExtract;
