import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tick = String.fromCharCode(96);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const contract = JSON.parse(read('kineto.features.json'));
const metadata = JSON.parse(read('kineto.module-metadata.json'));
const names = contract.modules.map(({ name }) => name);

assert.equal(metadata.libraryVersion, contract.libraryVersion, 'metadata version must match feature contract');
assert.equal(metadata.moduleCount, contract.moduleCount, 'metadata count must match feature contract');
assert.deepEqual(Object.keys(metadata.modules), names, 'metadata order and module coverage must match contract');
for (const name of names) {
  const item = metadata.modules[name];
  for (const key of ['summary', 'useWhen', 'avoidWhen', 'accessibility', 'performance', 'reducedMotion', 'browserCoverage']) {
    assert.equal(typeof item[key], 'string', `${name}.${key} must be a string`);
    assert.ok(item[key].trim(), `${name}.${key} must not be empty`);
  }
  assert.ok(['native', 'managed', 'manual', 'visual-only'].includes(item.accessibility), `${name}: unsupported accessibility status`);
  assert.ok(['light', 'medium', 'heavy'].includes(item.performance), `${name}: unsupported performance status`);
  assert.ok(['final-state', 'static'].includes(item.reducedMotion), `${name}: unsupported reduced-motion status`);
}

const demoContext = { window: {} };
vm.runInNewContext(read('demo/module-metadata.js'), demoContext);
assert.deepEqual(Object.keys(demoContext.window.KINETO_MODULE_METADATA), names, 'demo metadata map must cover every module');
for (const name of names) assert.equal(JSON.stringify(demoContext.window.KINETO_MODULE_METADATA[name]), JSON.stringify({
  accessibility: metadata.modules[name].accessibility,
  performance: metadata.modules[name].performance,
  reducedMotion: metadata.modules[name].reducedMotion
}), `${name}: demo status map is stale`);

const matrix = read('docs/module-usage-matrix.md');
for (const name of names) assert.ok(matrix.includes(`| ${tick}${name}${tick} |`), `${name}: usage matrix row is missing`);
assert.match(read('demo/main.js'), /module-quality-meta/, 'demo must render module quality metadata');
assert.match(read('demo/index.html'), /module-metadata\.js/, 'demo must load the generated metadata map');

console.log(`module-metadata OK — ${names.length} modules have usage, accessibility, performance, and reduced-motion guidance.`);
