// Enforce the size of the actual npm/GitHub Release tarball, not just individual
// build artifacts. Development sources, demos, QA documents, and unminified
// builds stay in Git, while npm receives only supported runtime entry points.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = JSON.parse(execFileSync('npm', ['pack', '--json', '--dry-run'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
}))[0];

const files = result.files.map((file) => file.path).sort();
const packedKb = result.size / 1024;
const unpackedKb = result.unpackedSize / 1024;
const check = process.argv.includes('--check');

const BUDGET = {
  // The 52-entry modular graph adds the Date Time runtime while retaining the
  // same allowlist. It measures 473.9 KB on Node 25/npm 11 and 475.2 KB on
  // the Node 22/npm 10 release runner, with 1604.7 KB unpacked / 72 files.
  //
  // 2026-08-09: the Page Reveal rewrite replaced 5 duplicate presets with 5 new
  // mechanisms (curve / dissolve / push / grid / skew) and added the pace table;
  // `textTransition.slide` and `glitch.digital` — both exact aliases — became
  // `flip` and `wave`. Measures 481.3 KB packed / 1622.4 KB unpacked / 72 files.
  // `skew` then became `fold`; `reveal` lost the `zoom`/`flip` near-duplicates and
  // gained `swing`/`skew`, and its no-GSAP fallback now renders rotation and shear
  // instead of dropping them. `cardGlow.pointer` (an exact alias of `spotlight`)
  // became `edge`. The file count is
  // unchanged throughout, so this is preset code, not new surface.
  // Keeping the same ~1 KB cross-runner compression headroom as before; still
  // not a blanket increase for future dependencies.
  // 2026-08-16: Motion States v1 adds the opt-in controller to the full
  // runtime. Its measured release tarball is 488.9 KB packed / 1646.4 KB
  // unpacked, still within the RFC's 3 KB gzip and package allowlist policy.
  // 2026-08-16: the standalone `states` and prototype `presence` modular
  // entries add four runtime/type surface files without broadening the allowlist.
  // Node 24/npm 11
  // measures 491.8 KB while Node 25/npm 11 measures 490.7 KB, so keep a
  // bounded cross-runner margin instead of making the check environment-specific.
  packedKb: 496,
  unpackedKb: 1665,
  files: 78
};

console.log(`release package: ${packedKb.toFixed(1)} KB packed · ${unpackedKb.toFixed(1)} KB unpacked · ${files.length} files`);

const failures = [];
if (packedKb > BUDGET.packedKb) failures.push(`packed ${packedKb.toFixed(1)} KB > ${BUDGET.packedKb} KB`);
if (unpackedKb > BUDGET.unpackedKb) failures.push(`unpacked ${unpackedKb.toFixed(1)} KB > ${BUDGET.unpackedKb} KB`);
if (files.length > BUDGET.files) failures.push(`files ${files.length} > ${BUDGET.files}`);

const forbidden = files.filter((file) => (
  file.startsWith('demo/')
  || file.startsWith('docs/')
  || file.startsWith('tests/')
  || file === 'dist/kineto.js'
  || file === 'dist/kineto.umd.js'
  || file === 'dist/kineto.css'
));
if (forbidden.length) failures.push(`development-only files included: ${forbidden.join(', ')}`);

const required = [
  'dist/kineto.min.css',
  'dist/kineto.min.js',
  'dist/kineto.umd.cjs',
  'dist/kineto.umd.min.js',
  'dist/modular/core.js',
  'dist/modular/states.js',
  'dist/modular/presence.js',
  'dist/modular/modules/slider.js',
  'types/index.d.ts',
  'types/states.d.ts',
  'types/presence.d.ts',
  'types/core.d.ts',
  'types/module.d.ts',
  'package.json',
  'README.md',
  'LICENSE'
];
for (const file of required) {
  if (!files.includes(file)) failures.push(`required release file missing: ${file}`);
}

if (check && failures.length) {
  console.error(`release package budget FAIL:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
if (check) console.log('release package budget OK — full and modular runtime allowlists are intact.');
