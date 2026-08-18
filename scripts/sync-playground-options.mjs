// Single-source derivation (audit F-1): regenerate the demo playground's
// PUBLIC_OPTIONS block straight from kineto.features.json, so it can never drift
// from the feature contract by hand-editing. Run in `npm run build`; `--check`
// fails (non-zero) if the committed file is out of sync instead of rewriting it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const feat = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));

// Build the contract object with alphabetically-sorted module keys and option lists.
const contract = {};
const variants = {};
for (const m of [...feat.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  contract[m.name] = [...m.publicOptions].sort();
  variants[m.name] = [...m.variants];
}
const literal = `  const PUBLIC_OPTIONS = ${JSON.stringify(contract)};`;
const variantsLiteral = `  const PUBLIC_VARIANTS = ${JSON.stringify(variants)};`;

// Which capability each variant needs, mirrored from the contract so the demo
// never carries its own copy. A module that adds a variant declares it once in
// kineto.features.json and the settings drawer filters correctly with no demo
// change at all.
const requires = {};
for (const m of [...feat.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  if (m.variantRequires && Object.keys(m.variantRequires).length) requires[m.name] = m.variantRequires;
}
const requiresLiteral = `  const VARIANT_REQUIRES = ${JSON.stringify(requires)};`;

// The resting value of every option, mirrored from the contract. Without this the
// settings drawer showed an EMPTY field for any option the demo markup did not
// spell out as an attribute — 176 of 371 fields — so the panel disagreed with the
// running demo until the user touched the control, which then wrote the attribute
// for the first time. Declaring the default in kineto.features.json makes the
// panel show what the module is actually doing, and a new option cannot ship
// blank (tests/option-defaults.mjs enforces it).
const optionDefaults = {};
for (const m of [...feat.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  if (m.optionDefaults && Object.keys(m.optionDefaults).length) optionDefaults[m.name] = m.optionDefaults;
}
const defaultsLiteral = `  const PUBLIC_DEFAULTS = ${JSON.stringify(optionDefaults)};`;

// Which options each variant actually reads, derived from the module sources by
// scripts/derive-variant-options.mjs. This replaces the demo's hand-written WHEN
// predicates for variant gating: a module that adds a variant re-runs the
// derivation and the drawer hides the right controls with no demo edit.
const variantOptions = {};
for (const m of [...feat.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  if (m.variantOptions && Object.keys(m.variantOptions).length) variantOptions[m.name] = m.variantOptions;
}
const variantOptionsLiteral = `  const VARIANT_OPTIONS = ${JSON.stringify(variantOptions)};`;

const file = path.join(root, 'demo/playground.js');
const src = fs.readFileSync(file, 'utf8');
const re = /^ {2}const PUBLIC_OPTIONS = \{.*\};$/m;
if (!re.test(src)) { console.error('sync-playground-options: PUBLIC_OPTIONS block not found'); process.exit(1); }
const variantsRe = /^ {2}const PUBLIC_VARIANTS = \{.*\};$/m;
if (!variantsRe.test(src)) { console.error('sync-playground-options: PUBLIC_VARIANTS block not found'); process.exit(1); }
const reqRe = /^ {2}const VARIANT_REQUIRES = \{.*\};$/m;
if (!reqRe.test(src)) { console.error('sync-playground-options: VARIANT_REQUIRES block not found'); process.exit(1); }
const defRe = /^ {2}const PUBLIC_DEFAULTS = \{.*\};$/m;
if (!defRe.test(src)) { console.error('sync-playground-options: PUBLIC_DEFAULTS block not found'); process.exit(1); }
const varOptRe = /^ {2}const VARIANT_OPTIONS = \{.*\};$/m;
if (!varOptRe.test(src)) { console.error('sync-playground-options: VARIANT_OPTIONS block not found'); process.exit(1); }
const next = src.replace(re, literal).replace(variantsRe, variantsLiteral).replace(reqRe, requiresLiteral).replace(defRe, defaultsLiteral).replace(varOptRe, variantOptionsLiteral);

if (check) {
  if (next !== src) { console.error('demo/playground.js PUBLIC_OPTIONS / PUBLIC_VARIANTS / VARIANT_REQUIRES / PUBLIC_DEFAULTS is out of sync with kineto.features.json. Run: node scripts/sync-playground-options.mjs'); process.exit(1); }
  console.log('playground PUBLIC_OPTIONS in sync with features.json.');
} else {
  if (next !== src) { fs.writeFileSync(file, next); console.log('Synced demo/playground.js PUBLIC_OPTIONS from features.json.'); }
  else console.log('playground PUBLIC_OPTIONS already in sync.');
}
