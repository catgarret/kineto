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
  // measured 4.6 KB unpacked on Node 25/npm 11 (1731.3 KB total) while the
  // 77-file surface remains fixed. Absorb only this parser safety cost in the
  // rounded unpacked ceiling; consumer gzip budgets remain unchanged. Node 24
  // npm 11 reports 516.0 KB packed (528410 bytes) for the resulting archive,
  // 26 bytes above the integer 516 KB boundary. Round the runner ceiling to
  // 517 KB; it remains a fixed 77-file allowlist and is not a surface increase.
  // 2026-09-06: click-image one-shot parsing/cleanup, multiline author-state
  // restoration, counter clipping and cssScroll guards measure 526.9 KB packed
  // / 1755.0 KB unpacked on Node 24/npm 11. This is measured feature/fix cost,
  // not compression variance; retain all 77 allowed files and round only bytes.
  // 2026-09-14: reversible masked Reveal, ancestor clipping, and Wave's finite
  // playback/visibility lifecycle measure 532.2 KB packed / 1764.5 KB unpacked
  // on Node 24/npm 11. This is explicit correctness cost, not compression
  // variance. Retain all 77 files and bounded rounding/runner headroom.
  // Opt-in Wave palette/blending: Node 24 measures 534.0 KB packed /
  // 1770.3 KB unpacked. This is feature cost, not runner variance.
  // 2026-09-18: Presence status subscription (adapters stay in sync with a
  // propagating parent), SRI-verified engine tag reuse, and the shared
  // priority-preserving inline-style snapshot measure 535.2 KB packed /
  // 1773.1 KB unpacked on Node 22/npm 10 with the same 77 files. These are
  // correctness/security bytes; round the ceilings by 1 KB each.
  // 2026-09-19: the Lazy stylized-media rasterizer (dither / ascii / halftone
  // for <img> and <video>) ships in every JS artifact and the modular lazy
  // entry: 549.9 KB packed / 1812.0 KB unpacked on Node 22/npm 10, still 77
  // files. Requested feature bytes — round both ceilings to the next KB.
  // 2026-09-19: `Kineto.observe()` (MutationObserver live-DOM attach/release,
  // the 29th Core API) ships in the ESM/UMD/min bundles, the modular core and
  // the type declarations: 552.9 KB packed / 1820.6 KB unpacked on Node
  // 22/npm 10, still 77 files. Requested Core API bytes — round both ceilings
  // to the next KB.
  // 2026-09-19: the env() navigator guard (window without navigator must not
  // throw) measures 553.1 KB packed on Node 22/npm 10; correctness bytes,
  // rounded to the next KB. Unpacked stays within 1821 KB.
  // 2026-09-19: Stylize ships as its own module entry, so the modular build
  // enumerates 53 files instead of 52 and the package carries dist/modular
  // entries for the new module plus the shared media helpers. Measured
  // 560.2 KB packed / 1843.1 KB unpacked / 79 files on this runtime.
  // 2026-09-19 (quality pass): the Stylize living look measures 567.2 KB packed
  // / 1860.8 KB unpacked across the same 79 files.
  // 2026-09-20 image timers + explicit Core pause: 572.9 / 1874.9 KiB,
  // same 79 files. Absorb only the measured lifecycle correction.
  // 2026-09-20 (page-transition): ignoring a hash-only history move costs a few
  // hundred bytes of guard and measures 573.1 KB packed on the same 79 files.
  // A Back press destroying the page is a correctness bug, not a feature.
  // Native Reveal boundary/reverse lifecycle: 574.5 / 1879.6 KiB, still 79 files.
  // 2026-09-20 (control labels): one `labels` map per module plus the shared
  // `labeller` helper measures 575.7 KB packed on the same 79 files. The
  // library was announcing invented English (and one Korean) string to every
  // consumer's readers; letting the page name its own controls is an
  // accessibility correction, not a new surface.
  // 2026-09-20 (toast region lifetime): reference-counting the shared region and
  // closing an instance's toasts on destroy measures 576.2 KB packed / 1884.1 KB
  // unpacked on the same 79 files. Restoring the document a module changed is
  // the destroy contract, not a feature.
  packedKb: 577,
  // Low-tier Reveal preset routing measures 1766.1 KB unpacked. Preserve the
  // packed ceiling and file allowlist; round only this measured source cost.
  // Terminal Glitch guards and priority-preserving owned-style restoration:
  // Node 24 measures 534.4 KB packed / 1771.4 KB unpacked, still 77 files.
  // See the 2026-09-18 note above for the 1773.1 KB measurement; the shared
  // priority-preserving inline-style snapshot then measures 1774.2 KB.
  // See the 2026-09-19 note above for the 1812.0 KB stylized-media measurement.
  // See the 2026-09-19 observe() note above for the 1820.6 KB measurement.
  // 2026-09-20: video trigger/active-clock guards measure 1872.1 KB unpacked
  // after sharing media styles and stop-event wiring (initially 1872.7 KB).
  // Round only this measured correctness cost; packed/files budgets stay fixed.
  // 2026-09-20 (page-transition): the same guard measures 1875.4 KB unpacked.
  // 2026-09-20 (control labels): the same change measures 1883.1 KB unpacked —
  // default label maps in four modules and the shared helper. Round only this
  // measured accessibility cost; packed/files budgets follow their own notes.
  // See the toast-region note above for the 1884.1 KB measurement.
  unpackedKb: 1885,
  files: 79
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
