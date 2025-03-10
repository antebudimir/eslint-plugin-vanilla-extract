import alphabeticalOrderRule from './css-rules/alphabetical-order/index.js';
import concentricOrderRule from './css-rules/concentric-order/index.js';
import customOrderRule from './css-rules/custom-order/rule-definition.js';

export const vanillaExtract = {
  meta: {
    name: '@antebudimir/eslint-plugin-vanilla-extract',
    version: '1.4.4',
  },
  rules: {
    'alphabetical-order': alphabeticalOrderRule,
    'concentric-order': concentricOrderRule,
    'custom-order': customOrderRule,
  },
  configs: {
    recommended: [
      {
        plugins: {
          'vanilla-extract': {
            rules: { 'concentric-order': concentricOrderRule },
          },
        },
        rules: { 'vanilla-extract/concentric-order': 'warn' },
      },
    ],
    alphabetical: [
      {
        plugins: {
          'vanilla-extract': {
            rules: { 'alphabetical-order': alphabeticalOrderRule },
          },
        },
        rules: { 'vanilla-extract/alphabetical-order': 'warn' },
      },
    ],
  },
};

export default vanillaExtract;
