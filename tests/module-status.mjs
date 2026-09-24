import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const contract = JSON.parse(read('kineto.features.json'));
const status = read('docs/module-status.md');

// Every contracted module is stable until a status change is recorded; the
// count comes from the contract, so adding a module updates this doc, not the test.
const stable = contract.moduleCount;
assert.match(status, new RegExp(`\\| \`stable\` \\| ${stable} \\|`), `docs/module-status.md must count ${stable} stable modules`);
assert.match(status, /\| `maintenance` \| 0 \|/);
assert.match(status, /\| `experimental` \| 0 \|/);
assert.match(status, /\| `deprecated` \| 0 \|/);
assert.match(status, new RegExp(`${stable}개 공개 모듈`));
assert.match(status, /CHANGELOG\.md/);
assert.match(status, /reduced motion/);

console.log(`module-status OK — ${contract.moduleCount} contract modules remain stable; no unapproved lifecycle status changes.`);
