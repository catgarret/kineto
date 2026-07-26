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
for (const m of [...feat.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  contract[m.name] = [...m.publicOptions].sort();
}
const literal = `  const PUBLIC_OPTIONS = ${JSON.stringify(contract)};`;

const file = path.join(root, 'demo/playground.js');
const src = fs.readFileSync(file, 'utf8');
const re = /^ {2}const PUBLIC_OPTIONS = \{.*\};$/m;
if (!re.test(src)) { console.error('sync-playground-options: PUBLIC_OPTIONS block not found'); process.exit(1); }
const next = src.replace(re, literal);

if (check) {
  if (next !== src) { console.error('demo/playground.js PUBLIC_OPTIONS is out of sync with kineto.features.json. Run: node scripts/sync-playground-options.mjs'); process.exit(1); }
  console.log('playground PUBLIC_OPTIONS in sync with features.json.');
} else {
  if (next !== src) { fs.writeFileSync(file, next); console.log('Synced demo/playground.js PUBLIC_OPTIONS from features.json.'); }
  else console.log('playground PUBLIC_OPTIONS already in sync.');
}
