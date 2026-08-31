// Bundle-size tracker (audit D-4): report ESM / UMD / minified sizes plus gzip
// and brotli for every shipped dist artifact, and — with `--check` — fail if any
// artifact grows past its budget so bloat can't sneak into a release unnoticed.
//
//   node scripts/bundle-size.mjs           # print the table
//   node scripts/bundle-size.mjs --check   # print + enforce budgets (CI/tests)
//   node scripts/bundle-size.mjs --md      # also write docs/bundle-size.md
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

// Per-artifact budgets. Ceilings sit a little above today's numbers so normal
// churn passes but a real regression (a heavy dependency, an un-tree-shaken
// import) trips the check. Sizes are KB. `gz` is the number consumers feel.
// GSAP/Lenis are no longer bundled (loaded on demand from the CDN), so these
// ceilings reflect Kineto's own code only. A re-bundled engine (~125 KB) would
// blow past them.
//
// ── Measured 2026-07-29: the monolith is close to its compression floor. Read
// this before changing the build or loosening a ceiling. ─────────────────────
//   * JS is genuinely minified (oxc/rolldown mangles identifiers). Adding
//     `compress`, `mangle.topLevel` or `codegen.removeWhitespace` changed
//     virtually nothing in the previous audit.
//     `dropConsole` saved 0.4 KB raw / 0.2 KB gz across 8 call sites — not
//     worth losing the error paths.
//   * `kineto.min.css` being a byte copy of `kineto.css` is CORRECT, not a
//     missing step: Vite already minifies it. Re-running lightningcss over the
//     output changed raw by -0.1% and gz by 0.2%.
//   * There is no duplicated helper code to hoist: 0 identical function bodies
//     shared by 3+ modules.
//   * Inlined CSS template literals total 3.1 KB (lightbox 2.1, core 1.0) — not
//     a bulk contributor.
//   * Summing the modules bundled INDIVIDUALLY gives roughly 406 KB against the
//     365.1 KB monolith, i.e. only 41.0 KB of shared core. The bundle really is
//     the sum of its parts.
//
// The one large win left is tree-shaking, not compression: `reveal` alone
// bundles to 12.0 KB raw / 4.2 KB gz, so a single-module consumer currently
// pays 25x. It is blocked by `src/index.js` line ~108, which registers every
// module through a side-effectful `Object.entries(moduleEntries).forEach(...)`
// loop that no bundler can shake. Fixing it means shipping per-module entry
// points, which needs either `src/` published (+~780 KB unpacked) or 50 built
// files (+~406 KB unpacked) — both blow the package-size budget, so it is a
// packaging decision for the maintainer, not a silent build tweak.
// 2026-07-29 (late): measured 471.7/123.0 (esm), 373.2/109.8 (min), 371.4/109.2 (umd)
// after the coverflow active-shadow option and the CSS-first lazy wave/grain work.
// Raised ~2 KB raw / ~1 KB gzip over the measurement, not to a round number.
const BUDGETS = {
  // The 2026-07-29 release adds CSS-first lazy wave/grain rendering and shared
  // determinate progress outputs. Their measured ESM sizes are 470.2/122.4 KB
  // (debug/gzip) and 371.8/109.2 KB (min/gzip), so these ceilings leave less
  // than 2 KB raw and 1 KB gzip headroom.
  // Hover/focus state coordination adds 0.2 KB to the readable ESM only; the
  // consumer-facing gzip ceiling remains unchanged.
  // 2026-08-01: two-color image sampling, frame-rate-independent cursor
  // interpolation, and the full-circle radial layout add 1.4 KB raw / 0.4 KB
  // gzip. Image-derived palette ranking adds 46 bytes beyond the former gzip
  // ceiling; 125 KB retains <1 KB headroom and still rejects dependency bloat.
  // A real FLIP crossfade snapshots computed styles so the outgoing old-slot
  // clone and incoming live item can overlap. Its bounded ~0.7 KB cost gets a
  // 1 KB raw/gzip allowance without relaxing the dependency-bloat guard.
  // SHA-384 integrity metadata for the three pinned CDN engines adds ~0.5 KB
  // raw and measures 125.2 KB gzip in the readable ESM / 111.1 KB gzip in
  // the UMD artifacts. One additional KB preserves sub-KB headroom without
  // weakening the guard against accidentally rebundling an engine.
  // 2026-08-09: the 52-module build adds Date Time, the completed Page Reveal
  // mechanisms and their control surface. Measured on the release runtime
  // (Node 24/npm 11): 492.2/128.7 KiB ESM and 389.0/115.0 KiB minified ESM.
  // The ceilings retain roughly 1 KiB gzip headroom and remain far below a
  // third-party motion engine being bundled accidentally.
  // 2026-08-17: Slider release momentum is now an opt-in public control. The UMD
  // raw ceiling moves to 394 KB for this bounded runtime-only addition; gzip stays
  // at the strict 118 KB ceiling.
  // 2026-08-17: the opt-in Slider spring solver adds ~0.3 KB raw to the ESM
  // artifacts; gzip remains under the existing 118/132 KB ceilings.
  // 2026-08-16: Motion States v1 adds 1.6 KB gzip to the readable build and
  // remains below the RFC's 3 KB incremental limit. Keep a small, explicit
  // headroom instead of allowing an unbounded budget increase.
  // 2026-08-17: date-time parsing now accepts compact/Korean/locale-aware
  // server timestamps and reduced counters preserve seconds-only output.
  // Measured raw deltas are +0.6 KB ESM, +0.3 KB minified, and +0.5 KB UMD;
  // gzip remains below the existing ceilings, so absorb only this bounded
  // runtime cost without changing the compressed budgets.
  // 2026-08-17: Radial spring settling adds 0.3 KB raw to ESM/UMD while
  // remaining below the compressed ceilings; retain the dependency guard with
  // a sub-KB raw allowance.
  // 2026-08-18: the opt-in `flip` View Transitions path adds 0.4 KB raw to
  // readable ESM and 0.7 KB to minified ESM; gzip remains under the existing
  // ceilings, so absorb only this measured runtime cost.
  // 2026-08-18: hidden-tab indicator recovery adds ~0.2 KB raw to the UMD
  // runtime; keep gzip strict and absorb only this measured visibility cost.
  // Node 24/npm 11's zlib reports 132.3/118.2 KB for the same release bytes
  // that Node 25 reports as 132.0/118.0 KB. Keep the product ceilings strict
  // and allow only this bounded cross-runtime gzip variance.
  // 2026-08-19: the opt-in diagnostics hub adds the stable code table and
  // bounded history to every entry. Measured Node 25/npm 11 output is
  // 506.4/133.0 KB readable ESM, 400.0/118.8 KB minified ESM, and
  // 398.2/118.1 KB UMD. Keep the allowlist and dependency guard unchanged;
  // absorb only this measured runtime surface with rounded ceilings.
  // 2026-08-31: native Scroll Snap adds a bounded runtime path to Slider
  // (strict eligibility + mouse drag bridge + lifecycle sync). The measured
  // raw deltas are ~3.1 KB ESM, ~2.9 KB minified ESM, and ~2.5 KB UMD; gzip
  // remains within the existing 1 KB runner variance. Raise only raw ceilings
  // to the next KB and keep compressed budgets unchanged.
  'kineto.js': { raw: 511, gz: 133, variance: 1 },
  'kineto.min.js': { raw: 404, gz: 119, variance: 1 },
  'kineto.umd.js': { raw: 402, gz: 119 },
  'kineto.umd.min.js': { raw: 402, gz: 119 },
  // The Loading Indicator visuals are deliberately CSS-first. Keep both JS
  // and CSS ceilings close to the 51-module build so future bloat still fails.
  // Continuous grow keyframes add ~0.1 KB raw while gzip remains 7.8 KB.
  // Raised for the Spinner/Progress indeterminate rewrite: the reference motion is
  // reproduced by SAMPLING the measured edge trajectories (arc every 4%, bar every
  // ~3.3%) instead of four hand-placed keyframes. 59 extra keyframes, +5.7 KB raw /
  // +0.7 KB gzip. It buys what the coarse version could not do — continuous
  // interpolation with no stall, no bounce at the loop seam, no backwards sweep.
  // The rest of the CSS is at its floor (measured 2026-07-29: re-minifying the
  // Vite output with lightningcss moves raw by -0.1%).
  'kineto.css': { raw: 45, gz: 10 },
  'kineto.min.css': { raw: 45, gz: 10 }
};

const kb = (n) => n / 1024;
const fmt = (n) => `${kb(n).toFixed(1)} KB`;

const rows = [];
for (const file of Object.keys(BUDGETS)) {
  const p = path.join(dist, file);
  if (!fs.existsSync(p)) { rows.push({ file, missing: true }); continue; }
  const buf = fs.readFileSync(p);
  rows.push({
    file,
    raw: buf.length,
    gz: zlib.gzipSync(buf, { level: 9 }).length,
    br: zlib.brotliCompressSync(buf).length,
    budget: BUDGETS[file]
  });
}

const check = process.argv.includes('--check');
const writeMd = process.argv.includes('--md');

let header = 'artifact'.padEnd(20) + 'raw'.padStart(10) + 'gzip'.padStart(10) + 'brotli'.padStart(10) + '  budget(gz)'.padStart(34);
const lines = [header];
const failures = [];
for (const r of rows) {
  if (r.missing) { lines.push(`${r.file.padEnd(20)}${'— not built —'.padStart(30)}`); failures.push(`${r.file} is missing from dist/`); continue; }
  const variance = (r.budget.variance || 0) * 1024;
  const over = r.raw > r.budget.raw * 1024 || r.gz > r.budget.gz * 1024 + variance;
  const flag = over ? '  ✗ OVER' : '';
  const budgetLabel = `≤ ${r.budget.gz} KB${r.budget.variance ? ` (+${r.budget.variance} KB runner variance)` : ''}`;
  lines.push(`${r.file.padEnd(20)}${fmt(r.raw).padStart(10)}${fmt(r.gz).padStart(10)}${fmt(r.br).padStart(10)}${budgetLabel.padStart(34)}${flag}`);
  if (over) failures.push(`${r.file}: raw ${fmt(r.raw)} (≤${r.budget.raw}KB), gzip ${fmt(r.gz)} (≤${r.budget.gz}KB${r.budget.variance ? ` + ${r.budget.variance}KB runner variance` : ''})`);
}

console.log(lines.join('\n'));

if (writeMd) {
  const md = ['# Bundle size', '', 'Generated by `npm run size:md`. gzip is what consumers download.', '', '| Artifact | Raw | Gzip | Brotli |', '| --- | ---: | ---: | ---: |',
    ...rows.filter((r) => !r.missing).map((r) => `| \`${r.file}\` | ${fmt(r.raw)} | ${fmt(r.gz)} | ${fmt(r.br)} |`), ''].join('\n');
  fs.writeFileSync(path.join(root, 'docs/bundle-size.md'), md);
  console.log('\nWrote docs/bundle-size.md');
}

if (check) {
  if (failures.length) { console.error('\nbundle-size FAIL — over budget:\n  ' + failures.join('\n  ')); process.exit(1); }
  console.log('\nbundle-size OK — every artifact is within budget.');
}
