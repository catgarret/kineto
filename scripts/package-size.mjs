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
  // 2026-08-17: npm 11 on the GitHub runner rounds this archive to exactly
  // 496.0 KB while the local npm 11 toolchain reports 494.9 KB. Keep the
  // allowlist unchanged and add only the measured 1 KB boundary margin.
  // 2026-08-17: the opt-in Slider spring controls add one measured KB to the
  // unpacked archive; keep the file allowlist fixed and absorb that bounded cost.
  // 2026-08-17: host-owned React/Vue Presence adapters add their public source
  // and declarations to the same allowlist; absorb the measured 5.4 KB cost.
  // 2026-08-17: the Node 24/npm 11 GitHub runner measured 497.9 KB packed
  // while the local Node 25/npm 11 toolchain measured 496.7 KB; keep a bounded
  // cross-runner margin without changing the release file allowlist.
  // 2026-08-17: the direct keyed-child Presence groups add 2.4 KB packed and
  // 8.2 KB unpacked on the local toolchain; retain runner headroom below.
  // 2026-08-17: nested parent propagation adds 0.3 KB unpacked at the local
  // npm 11 boundary; keep the allowlist fixed and absorb only that measured
  // cost plus a small cross-runner margin.
  // 2026-08-17: the date-time parser now accepts compact, Korean clock-text,
  // and locale-aware day/month server timestamps, while reduced counters keep
  // seconds-only output. The local npm 11 archive measures 501.1 KB packed /
  // 1688.2 KB unpacked; Node 24/npm 11 measures 502.3 KB packed. Keep the
  // allowlist fixed and absorb this bounded runtime increase with a 1.7 KB
  // cross-runner margin rather than widening the file surface.
  // 2026-08-17: Radial now shares the opt-in spring solver with Track Slider.
  // The modular runtime adds 0.5 KB unpacked locally; retain the fixed file
  // allowlist and a bounded 2 KB margin for the cross-runner archive delta.
  // 2026-08-18: the opt-in same-document View Transitions path for `flip`
  // measures 503.9 KB packed / 1697.5 KB unpacked locally with the same
  // 78-file allowlist. Absorb that measured runtime cost plus a small Node/npm
  // archive delta; this is a bounded budget update, not permission to widen the
  // release surface.
  // 2026-08-18: Node 24/npm 11 measured 506.3 KB after the documentation-only
  // package metadata update while Node 25/npm 11 remained at 505.1 KB. Keep the
  // allowlist fixed and absorb only this rounded 1 KB runner boundary.
  // 2026-08-19: the opt-in diagnostics hub adds the public code table, bounded
  // history, and source/type surface. Node 25/npm 11 measures 508.2 KB packed /
  // 1708.8 KB unpacked; keep the allowlist fixed and absorb only this measured
  // runtime cost with a small rounded margin.
  // Node 24/npm 11 measures 509.8 KB packed / 1709.8 KB unpacked, so the
  // rounded packed ceiling must cover that runner without widening the file list.
  // 2026-08-25: Slider release momentum/bounce/sticky-snap controls add 1.4 KB
  // unpacked on the local Node 25/npm 11 archive; keep the fixed allowlist and
  // absorb only this bounded physics runtime cost.
  // 2026-08-31: the opt-in native Scroll Snap path adds 0.7 KB packed and
  // 9.9 KB unpacked through the built Slider/module artifacts. Keep the same
  // 78-file allowlist and absorb only this bounded runtime cost plus the
  // existing cross-runner margin.
  // 2026-09-01: adding the supply-chain workflow contract and script metadata
  // raised the Node 24/npm 11 archive to a rounded 513.0 KB while Node 25/npm
  // 11 remains 511.8 KB. Keep the 77-file allowlist and absorb only this
  // measured 1 KB package-metadata boundary; this is not a runtime budget
  // increase or permission to widen the release surface.
  // 2026-09-01: the Radial native-drag guard and deterministic SQL/ISO date
  // parser add 2.7 KB unpacked on the local npm 11 archive. Node 24/npm 11
  // measures 514.2 KB packed for the same 77-file surface; absorb that bounded
  // runner delta in the packed ceiling while keeping the file list and
  // consumer gzip budgets unchanged.
  // 2026-09-01: strict year-first separator/time/offset validation adds the
  // measured 3.6 KB unpacked on Node 25/npm 11 (1730.3 KB total) while the
  // 77-file surface remains fixed. Absorb only this parser safety cost in the
  // rounded unpacked ceiling; consumer gzip budgets remain unchanged.
  packedKb: 515,
  unpackedKb: 1731,
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
