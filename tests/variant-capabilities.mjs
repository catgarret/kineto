// Guards the variant-capability contract that drives the settings drawer:
// `variantRequires` is what stops the demo from offering, say, glitch's image
// presets on a text target. Because the drawer reads this and nothing else, a
// drift here silently reintroduces unsupported options — so it is asserted.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));

const vocabulary = contract.variantCapabilities;
assert.ok(vocabulary && typeof vocabulary === 'object', 'contract must publish variantCapabilities');
assert.ok(vocabulary.any, 'the vocabulary needs an explicit "any" (no requirement)');
for (const [name, description] of Object.entries(vocabulary)) {
  assert.match(name, /^[a-z]+$/, `capability names stay simple: ${name}`);
  assert.ok(String(description).trim().length > 10, `${name} needs a real description`);
}

let declared = 0;
for (const module of contract.modules) {
  const rules = module.variantRequires;
  if (!rules) continue;
  const variants = new Set(module.variants || []);
  for (const [variant, requirement] of Object.entries(rules)) {
    declared += 1;
    assert.ok(variants.has(variant),
      `${module.name}.variantRequires lists "${variant}", which is not one of its variants`);
    assert.ok(Object.hasOwn(vocabulary, requirement),
      `${module.name}.${variant} requires "${requirement}", which is not in variantCapabilities`);
  }
}
assert.ok(declared > 0, 'at least one module must declare variant requirements');

// The demo must not keep its own copy — it is generated from the contract.
const playground = fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8');
const match = playground.match(/^ {2}const VARIANT_REQUIRES = (\{.*\});$/m);
assert.ok(match, 'demo/playground.js must carry a generated VARIANT_REQUIRES block');
const mirrored = JSON.parse(match[1]);
const expected = {};
for (const module of [...contract.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  if (module.variantRequires && Object.keys(module.variantRequires).length) {
    expected[module.name] = module.variantRequires;
  }
}
assert.deepEqual(mirrored, expected, 'VARIANT_REQUIRES drifted from the contract — run npm run sync:options');

console.log(`variant-capabilities OK — ${Object.keys(vocabulary).length} capabilities, ${declared} declared variant rules.`);
