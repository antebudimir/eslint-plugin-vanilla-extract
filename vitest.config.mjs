import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text'],
      reportsDirectory: './coverage/vitest-reports',
      include: ['src/css-rules/**/*.ts', 'src/shared-utils/**/*.ts'],
      exclude: ['src/**/*.css.ts', 'src/**/*index.ts', 'src/**/*types.ts'],
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
