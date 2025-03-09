import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text'],
      reportsDirectory: './coverage/vitest-reports',
      //   include: ['src/**/rule-definition.ts'],
      include: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/__tests__/**'],
      //   exclude: [
      //     'src/**/*.css.ts',
      //     'src/**/*.test.ts',
      //     'src/**/*constants.ts',
      //     'src/**/*index.ts',
      //     // Exclude all icon directories and their contents
      //     'src/components/common/icons/**',
      //     // But include the CheckboxIcon component
      //     '!src/components/common/icons/checkbox-icon/CheckboxIcon.tsx',
      //   ],
    },
    reporters: [
      'default',
      ['json', { outputFile: './coverage/vitest-results/vitest-results.json' }],
      ['junit', { outputFile: './coverage/vitest-results/vitest-results.xml' }],
    ],
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
