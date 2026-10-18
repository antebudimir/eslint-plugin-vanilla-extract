#!/usr/bin/env bash
# Run the locally built plugin through the real ESLint CLI against the fixtures in integration/. Fixtures are restored from integration/.snapshot before each run.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Building plugin..."
pnpm build >/dev/null 2>&1

echo "Restoring pristine fixtures from integration/.snapshot ..."
cp integration/.snapshot/*.ts integration/

EXPECTED_REMAINING=9

echo ""
echo "=== Pass 4 check: kitchen-sink clean fixture ==="
CLEAN_OUTPUT=$(pnpm exec eslint -c integration/eslint.config.mjs integration/complex.css.ts 2>&1)
if [ -n "$CLEAN_OUTPUT" ]; then
  echo "FAIL: complex.css.ts must lint completely clean (false-positive regression):" >&2
  echo "$CLEAN_OUTPUT" >&2
  exit 1
fi
echo "Pass 4 OK (complex.css.ts lints clean)."

echo ""
echo "=== Pass 1: lint (expect reported problems) ==="
set +e
pnpm exec eslint -c integration/eslint.config.mjs 'integration/**/*.ts'
PASS1=$?
set -e
if [ "$PASS1" -eq 0 ]; then
  echo "FAIL: pass 1 reported no problems, rules did not fire." >&2
  exit 1
fi
echo "Pass 1 OK (problems reported, as expected)."

echo ""
echo "=== Pass 2: eslint --fix ==="
pnpm exec eslint -c integration/eslint.config.mjs 'integration/**/*.ts' --fix || true

echo ""
echo "=== Pass 3: lint after fix (expect only non-fixable suggestions) ==="
set +e
REMAINING=$(pnpm exec eslint -c integration/eslint.config.mjs 'integration/**/*.ts' 2>&1 | grep -cE '^[[:space:]]+[0-9]+:[0-9]+[[:space:]]+error' || true)
set -e
if [ "$REMAINING" -ne "$EXPECTED_REMAINING" ]; then
  echo "FAIL: expected exactly $EXPECTED_REMAINING non-fixable errors after --fix, got $REMAINING." >&2
  pnpm exec eslint -c integration/eslint.config.mjs 'integration/**/*.ts' || true
  exit 1
fi
echo "Pass 3 OK (exactly $EXPECTED_REMAINING expected non-autofixable suggestions remain)."

echo ""
echo "Integration test PASSED ✅"
