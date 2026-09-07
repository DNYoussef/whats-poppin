import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', 'src/components/events/SearchBar.tsx', 'tests/search-debounce.test.ts', '--max-warnings', '0'], { encoding: 'utf8' });
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
assert.equal(result.status, 0);
console.log('SEARCH_LINT_VERIFIED');
