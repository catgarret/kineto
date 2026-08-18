import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const contract = JSON.parse(read('kineto.features.json'));
const status = read('docs/module-status.md');

assert.match(status, /\| `stable` \| 52 \|/);
assert.match(status, /\| `maintenance` \| 0 \|/);
assert.match(status, /\| `experimental` \| 0 \|/);
assert.match(status, /\| `deprecated` \| 0 \|/);
assert.match(status, new RegExp(`52개 공개 모듈`));
assert.match(status, /CHANGELOG\.md/);
assert.match(status, /reduced motion/);
assert.equal(contract.moduleCount, 52, 'module status baseline must track the public contract count');

console.log(`module-status OK — ${contract.moduleCount} contract modules remain stable; no unapproved lifecycle status changes.`);
