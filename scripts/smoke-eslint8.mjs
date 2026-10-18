// ESLint 8 compatibility smoke test. Runs the built plugin against ESLint 8's flat-config Linter API and asserts that a fixable rule reports, that the ESLint v8 context.getSourceCode() fallback path works, and that autofix produces the expected output. Usage: create a temp dir, install eslint@8 there, then PLUGIN_DIST=/abs/path/to/dist/index.js node smoke-eslint8.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(path.join(process.cwd(), 'noop.js'));
const { Linter } = require('eslint');

const pluginPath = process.env.PLUGIN_DIST;
if (!pluginPath) {
  console.error('PLUGIN_DIST env var must point to the built plugin (dist/index.js)');
  process.exit(1);
}

const { default: plugin } = await import(pathToFileURL(pluginPath).href);

const linter = new Linter({ configType: 'flat' });
const config = [
  {
    files: ['**/*.ts'],
    plugins: { 'vanilla-extract': plugin },
    rules: {
      'vanilla-extract/no-trailing-zero': 'error',
      'vanilla-extract/prefer-logical-properties': 'error',
    },
  },
];

// 1. no-trailing-zero reports and offers a fix
const messages = linter.verify(
  "import { style } from '@vanilla-extract/css';\nconst s = style({ margin: '1.50px' });",
  config,
  'a.ts'
);
assert.equal(messages.length, 1, `expected 1 message, got ${JSON.stringify(messages)}`);
assert.equal(messages[0].ruleId, 'vanilla-extract/no-trailing-zero');
assert.equal(messages[0].messageId, 'trailingZero');

// 2. prefer-logical-properties reports (exercises context.sourceCode/getSourceCode() path)
const messages2 = linter.verify(
  "import { style } from '@vanilla-extract/css';\nconst s = style({ 'padding-left': '10px' });",
  config,
  'b.ts'
);
assert.equal(messages2.length, 1, `expected 1 message, got ${JSON.stringify(messages2)}`);
assert.equal(messages2[0].ruleId, 'vanilla-extract/prefer-logical-properties');

// 3. verifyAndFix produces the expected autofixed output
const fixed = linter.verifyAndFix(
  "import { style } from '@vanilla-extract/css';\nconst s = style({ margin: '1.50px' });",
  config,
  'c.ts'
);
assert.ok(fixed.fixed, 'expected autofix to be applied');
assert.match(fixed.output, /margin: '1\.5px'/, `unexpected fixed output: ${fixed.output}`);

console.log(`ESLint ${require('eslint/package.json').version} smoke test passed ✔`);
