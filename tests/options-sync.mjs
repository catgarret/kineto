// F (single-source) — cross-validate the demo's option definitions against the
// ONE source of truth, kineto.features.json:
//   1. KinetoPlayground.publicOptions  ===  features.json publicOptions  (exact)
//   2. every settings FIELD key is a real public option (no phantom editable key)
//   3. report per-module settings coverage (informational; callbacks/code-only
//      options are legitimately absent from the form)
// This fails the build the moment the hand-authored demo copy drifts from the
// contract — which is the recurring root cause the audit (F-1/B-7) calls out.
// Run: node tests/options-sync.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const feat = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const contract = {};
feat.modules.forEach((m) => { contract[m.name] = [...m.publicOptions].sort(); });

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window: w } = dom; const d = w.document;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const run = (c) => { const s = d.createElement('script'); s.textContent = c; d.body.appendChild(s); };
run(fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8'));
const KP = w.KinetoPlayground;
if (!KP || !KP.publicOptions || !KP.fields) { console.error('KinetoPlayground.publicOptions/fields not exposed'); process.exit(1); }

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const arrEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// 1. publicOptions == contract, exactly, per module and same module set.
const cMods = Object.keys(contract).sort();
const pMods = Object.keys(KP.publicOptions).sort();
ok(arrEq(cMods, pMods), `module set differs: onlyContract=[${cMods.filter((m) => !pMods.includes(m))}] onlyPublic=[${pMods.filter((m) => !cMods.includes(m))}]`);
for (const m of cMods) {
  const p = [...(KP.publicOptions[m] || [])].sort();
  if (!arrEq(contract[m], p)) {
    const miss = contract[m].filter((x) => !p.includes(x));
    const extra = p.filter((x) => !contract[m].includes(x));
    fails.push(`${m}: publicOptions != contract  missing=[${miss}] extra=[${extra}]`);
  }
}

// 2. every FIELD key is a real public option for that module.
const coverage = [];
for (const m of Object.keys(KP.fields)) {
  const keys = (KP.fields[m] || []).map((f) => f[0]);
  const po = KP.publicOptions[m] || [];
  const phantom = keys.filter((k) => !po.includes(k));
  ok(phantom.length === 0, `${m}: settings fields not in publicOptions (phantom): [${phantom}]`);
  if (po.length) coverage.push([m, keys.length, po.length]);
}

coverage.sort((a, b) => a[1] / a[2] - b[1] / b[2]);
console.log('settings coverage (fields / publicOptions), lowest first:');
console.log('  ' + coverage.slice(0, 12).map(([m, f, p]) => `${m} ${f}/${p}`).join('  '));
console.log('modules:', cMods.length, '| publicOptions synced with contract:', cMods.every((m) => arrEq(contract[m], [...(KP.publicOptions[m] || [])].sort())));

if (fails.length) { console.error('\nFAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('\noptions-sync OK — publicOptions == features.json, no phantom settings fields.');
