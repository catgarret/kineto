import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const reveal = contract.modules.find((module) => module.name === 'pageReveal');
const source = fs.readFileSync(path.join(root, 'src/modules/pageReveal.js'), 'utf8');
const audit = fs.readFileSync(path.join(root, 'docs/variant-distinctness.md'), 'utf8');
assert.ok(reveal, 'pageReveal contract is required');
assert.equal(reveal.variants.length, 16, 'the public Page Reveal set must remain bounded at 16 variants');
for (const variant of reveal.variants) {
  const row = new RegExp('\\\\| `' + variant + '` \\| ([^|]+) \\| ([^|]+) \\| distinct \\|').exec(audit);
  assert.ok(row, `variant audit must contain a distinct row for ${variant}`);
  assert.ok(row[1].trim().length > 12 && row[2].trim().length > 2, `variant audit needs a mechanism and code reference for ${variant}`);
  const branch = variant === 'curtain' ? /curtain \(default\)/ : new RegExp(`effect === ['"]${variant.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}['"]`);
  assert.match(source, branch, `pageReveal source must retain a mechanism branch for ${variant}`);
}
for (const legacy of ['circle', 'wipe', 'columns', 'strips', 'checker']) {
  assert.doesNotMatch(JSON.stringify(reveal.variants), new RegExp(`\\b${legacy}\\b`), `legacy variant ${legacy} must stay out of the public contract`);
}
assert.match(audit, /수동 검토일: 2026-08-19/);
console.log(`variant-distinctness OK — ${reveal.variants.length} Page Reveal mechanisms audited.`);
