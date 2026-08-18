// `variantOptions` says, per variant, which public options that variant actually
// reads. The settings drawer hides everything else, so a wrong entry either shows
// a dead control or — worse — hides a working one.
//
// This is derived, not authored: scripts/derive-variant-options.mjs parses each
// module and attributes every `opts.X` read to the variant branch that encloses
// it. This test keeps the committed contract in step with the sources and checks
// the result is structurally sane.
//
// Run: node tests/variant-options.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const problems = [];

const declared = contract.modules.filter((module) => module.variantOptions);
for (const module of declared) {
  const publicOptions = new Set(module.publicOptions);
  const variants = new Set(module.variants);
  for (const [variant, options] of Object.entries(module.variantOptions)) {
    if (!variants.has(variant)) problems.push(`${module.name}.variantOptions names "${variant}", which is not in variants`);
    if (!Array.isArray(options)) { problems.push(`${module.name}.variantOptions["${variant}"] is not an array`); continue; }
    if (!options.length) problems.push(`${module.name}.variantOptions["${variant}"] is empty — a variant that reads nothing would hide every control`);
    for (const key of options) {
      if (!publicOptions.has(key)) problems.push(`${module.name}.variantOptions["${variant}"] names "${key}", which is not a public option`);
    }
    if (new Set(options).size !== options.length) problems.push(`${module.name}.variantOptions["${variant}"] repeats an option`);
  }
  // Every variant must appear, otherwise the drawer silently falls back to
  // "show everything" for the missing ones and the gating looks broken.
  for (const variant of module.variants) {
    if (!(variant in module.variantOptions)) problems.push(`${module.name}.variantOptions is missing the "${variant}" variant`);
  }
  // A table where all variants are identical carries no information and should
  // not have been written at all.
  const shapes = new Set(Object.values(module.variantOptions).map((list) => [...list].sort().join(',')));
  if (shapes.size === 1) problems.push(`${module.name}.variantOptions is identical for every variant — drop it instead`);
}

// The generated demo block must mirror the contract exactly.
const source = fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8');
const variantListMatch = source.match(/^ {2}const PUBLIC_VARIANTS = (\{.*\});$/m);
if (!variantListMatch) problems.push('demo/playground.js no longer contains a generated PUBLIC_VARIANTS block');
else {
  const mirroredVariants = JSON.parse(variantListMatch[1]);
  const expectedVariants = Object.fromEntries([...contract.modules]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((module) => [module.name, module.variants]));
  if (variantListMatch[1] !== JSON.stringify(expectedVariants)) {
    problems.push('demo PUBLIC_VARIANTS has drifted from the contract. Run: node scripts/sync-playground-options.mjs');
  }
  if (JSON.stringify(mirroredVariants.pageReveal) !== JSON.stringify(contract.modules.find((module) => module.name === 'pageReveal').variants)) {
    problems.push('pageReveal settings choices do not mirror the public contract');
  }
}
const match = source.match(/^ {2}const VARIANT_OPTIONS = (\{.*\});$/m);
if (!match) problems.push('demo/playground.js no longer contains a generated VARIANT_OPTIONS block');
else {
  const mirrored = {};
  for (const module of [...contract.modules].sort((a, b) => a.name.localeCompare(b.name))) {
    if (module.variantOptions && Object.keys(module.variantOptions).length) mirrored[module.name] = module.variantOptions;
  }
  if (match[1] !== JSON.stringify(mirrored)) {
    problems.push('demo VARIANT_OPTIONS has drifted from the contract. Run: node scripts/sync-playground-options.mjs');
  }
}

// And the contract must match what the sources say today.
try {
  execFileSync(process.execPath, [path.join(root, 'scripts/derive-variant-options.mjs'), '--check'], { cwd: root, stdio: 'pipe' });
} catch (error) {
  problems.push(`derive-variant-options --check failed: ${String(error.stdout || error.message).trim().split('\n')[0]}`);
}

if (problems.length) {
  console.error('variant-options FAILED:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
const total = declared.reduce((sum, m) => sum + Object.keys(m.variantOptions).length, 0);
console.log(`variant-options OK — ${declared.length} modules, ${total} variants gated from the module sources.`);
