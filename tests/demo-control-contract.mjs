// Demo control manifest contract.
//
// The older source-text audits only saw the first FIELDS object literal and
// therefore missed controls appended later with Object.assign()/push(). Run the
// real playground script so every runtime field definition is checked.
// Run: node tests/demo-control-contract.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dom = new JSDOM('<!doctype html><body></body>', {
  url: 'https://example.test/',
  runScripts: 'dangerously',
  pretendToBeVisual: true
});
const { window } = dom;
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {}
});

const script = window.document.createElement('script');
script.textContent = fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8');
window.document.body.appendChild(script);

const fields = window.KinetoPlayground?.fields;
assert.ok(fields && typeof fields === 'object', 'KinetoPlayground.fields must expose the complete runtime field manifest');
const contracts = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8')).modules;
for (const name of ['reveal', 'lazy', 'cursor', 'overflowText', 'glitch', 'slider']) {
  const contract = contracts.find((module) => module.name === name);
  assert.deepEqual(
    [...fields[name].find(([key]) => key === 'preset')[3]].sort(),
    [...contract.variants].sort(),
    `${name}: the rendered preset field must include every public variant and no removed aliases`
  );
}

const supportedTypes = new Set(['checkbox', 'color', 'easing', 'number', 'range', 'select', 'text']);
const seenTypes = new Set();
const duplicateKeys = [];
const invalidDefinitions = [];
let fieldCount = 0;

for (const [module, definitions] of Object.entries(fields)) {
  assert.ok(Array.isArray(definitions), `${module}: field definitions must be an array`);
  const seenKeys = new Set();
  for (const definition of definitions) {
    fieldCount += 1;
    const [key, label, type] = definition;
    if (typeof key !== 'string' || key.length === 0
      || typeof label !== 'string' || label.length === 0
      || !supportedTypes.has(type)) {
      invalidDefinitions.push(`${module}.${String(key)} (${String(type)})`);
      continue;
    }
    if (seenKeys.has(key)) duplicateKeys.push(`${module}.${key}`);
    seenKeys.add(key);
    seenTypes.add(type);
  }
}

assert.deepEqual(invalidDefinitions, [], `invalid demo control definitions: ${invalidDefinitions.join(', ')}`);
assert.deepEqual(duplicateKeys, [], `duplicate demo controls: ${duplicateKeys.join(', ')}`);
assert.deepEqual(
  [...seenTypes].sort(),
  [...supportedTypes].sort(),
  'the runtime field manifest must exercise every supported control type'
);
assert.ok(fieldCount >= 500, `expected the complete runtime manifest, got only ${fieldCount} fields`);

// Rendering the real panel also checks WHEN rules: the contract alone cannot
// catch a valid Wave option silently dropped from settings and copied code.
const waveCard = window.document.createElement('article');
waveCard.className = 'card';
waveCard.innerHTML = '<h3>Wave</h3><div data-kt-glitch="wave" data-kt-seed="7" data-kt-channel-offset="12">WAVE</div>';
window.document.body.appendChild(waveCard);
window.KinetoPlayground.capture();
window.KinetoPlayground.mount();
const wavePanel = waveCard.querySelector('.kt-playground');
const waveBody = wavePanel.__buildBody();
for (const key of ['seed', 'channelOffset', 'trigger', 'loop', 'duration', 'delay']) {
  const field = waveBody.querySelector(`[data-module="glitch"][data-key="${key}"]`);
  assert.ok(field && !field.hidden, `Wave ${key} must be available in its actual settings panel`);
}
assert.match(wavePanel.dataset.htmlCode, /data-kt-seed="7"/, 'copied Wave HTML must retain its noise seed');
assert.match(wavePanel.dataset.htmlCode, /data-kt-channel-offset="12"/, 'copied Wave HTML must retain its displacement amount');
window.close();

console.log(`demo-control-contract OK — ${fieldCount} runtime fields across ${Object.keys(fields).length} modules and ${seenTypes.size} control types, with no duplicate keys.`);
