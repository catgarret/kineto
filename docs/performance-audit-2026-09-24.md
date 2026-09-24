# Performance audit — 2026-09-24

## Scope and compatibility

Baseline: `e58442a`. Work was isolated on `codex/performance-audit` because another
agent was working concurrently. No public module, variant, option, default,
export, visual effect, or demo card was removed. No dependency or size budget
was added/increased. No release or deployment is part of this change.

Reviewed the core scan/observer lifecycle, shared option parsing, renderer hot
loops, Scroll Velocity, Scroll Sequence, Progress, and existing performance and
browser guards. Implemented the four demonstrated opportunities below; this is
not a claim that all 54 modules have been profiled on physical devices.

## Changes and deterministic evidence

| Path | Before | After | Evidence |
| --- | --- | --- | --- |
| Live DOM insertion | Parent plus 100 children: 101 scans | 1 scan | `tests/performance-runtime.mjs` |
| Repeated scan | Parses options before duplicate detection | Skips existing instances before parsing | Throwing dataset getter regression |
| Core-only import | Unregistered engine-backed markup can load GSAP | Only registered, uninitialized modules can request it | No injected engine script regression |
| Observer disconnect | A separately queued scan can still execute | Queued scans are cancelled | Disconnect between observer delivery and its microtask |
| Scroll Velocity idle | Continuous RAF/style/callback work at zero | No RAF after position, target and velocity settle | Spring/lerp, wake, explicit pause, callback reentry and terminal teardown checks |
| Dither output | 1,188 extra ImageData allocations in the fixture | 0 | `tests/rasterizer-performance.mjs` |
| Error diffusion | Full grid, newly allocated for each paint | Reused 2-row Floyd–Steinberg / 3-row Atkinson window | 264 → 108 allocations across changing widths; maximum 2,109 → 171 floats |
| ASCII / monochrome Halftone | Identical fillStyle assigned per cell | One ink colour assignment per paint | Browser pixel comparison |

The rasterizer fixture performs 1,080 renders and 1,188 paints including pointer
lenses. It covers all nine dither patterns, six motions, original colours on/off,
an accent palette, transparent samples, dimension changes and a one-cell edge
case. Its full output SHA-256 is unchanged:
`74d8472cb66080b5f4e3021e9607e77ea64634afc71eb31d4c7e636c5388f28c`.

The diffusion working memory changes from `cols × rows × channels × 4` bytes
to `cols × (2 or 3) × channels × 4` bytes. Sampling still reads the current
image/video frame. This does not cache stale media or reduce resolution/FPS.
The renderer releases its retained error buffer on destroy.

Scan discovery remains a per-module snapshot taken before initializing the root;
factory-created clones do not expand that same scan. Connected reparenting keeps
instances; additions moved outside the observed root are not initialized.

Scroll Velocity's `onUpdate` now runs only during processing frames, including
the final zero frame; it no longer acts as a permanent idle timer. Explicit
`pause()` stays paused when input arrives, and destroyed instances cannot restart.
This callback-frequency change is documented in the module guide. Recommended
release classification: patch, subject to the owner's release decision.

## Files and integration

- Runtime: `src/core.js`, `src/modules/scrollVelocity.js`,
  `src/modules/media/rasterizer.js`.
- Added regressions: `tests/performance-runtime.mjs`,
  `tests/rasterizer-performance.mjs`; both run through `npm run test:perf` and CI.
- Added reproduction tool: `scripts/benchmark-rasterizer.mjs`.
- Updated `docs/performance.md`, the Scroll Velocity and Stylize module guides,
  and matching English/Korean `CHANGELOG.md` Unreleased entries.
- Regenerated full/UMD/modular `dist/` outputs and the demo's `site/` runtime.
  Obsolete hashed core/stylizer chunks are replaced, not retained alongside the
  new ones. No runtime source file was deleted.

The public contract and demo controls need no additions: the same API and
settings exercise the optimized paths. No new UI copy requires translation.

## Local browser measurements

macOS arm64, Node 25.9.0, installed Playwright Chromium / Firefox / WebKit,
headless. Deterministic 640×360 canvas source, cell size 3, colour steps 4.
Each result is the median of seven 20-frame batches after warmup; old/new order
alternates. Values are milliseconds per render, **not** page FPS. Every engine
compares all RGBA channels of the final canvas; all five cases matched exactly.

| Case | Chromium before → after | Firefox before → after | WebKit before → after |
| --- | --- | --- | --- |
| Ordered dither | 0.695 → 0.570 | 1.700 → 1.650 | 1.350 → 0.800 |
| Floyd–Steinberg RGB | 2.495 → 1.900 | 4.500 → 4.100 | 5.000 → 3.500 |
| Atkinson | 2.240 → 1.420 | 3.050 → 3.150 | 2.850 → 2.600 |
| Monochrome Halftone | 6.495 → 3.250 | 21.550 → 19.700 | 9.300 → 9.100 |
| ASCII | 9.645 → 9.640 | 19.750 → 18.450 | 18.350 → 18.000 |

Firefox Atkinson was slightly slower in this sample; ASCII in Chromium was
essentially unchanged. Do not turn these figures into a blanket speed claim.
Browser load, scheduling, graphics backend and hardware affect timing. A first
ring-buffer prototype was slower in Chromium; it was replaced by sliding rows
and shared channel handling before the measurements above.

Reproduce from the repository root:

```bash
npm run test:perf
node scripts/benchmark-rasterizer.mjs e58442a
KT_BROWSER=firefox node scripts/benchmark-rasterizer.mjs e58442a
KT_BROWSER=webkit node scripts/benchmark-rasterizer.mjs e58442a
npm run ci
```

`KT_CHROME` can select a local Chromium. The benchmark temporarily writes the
baseline renderer alongside its source imports and removes it in `finally`.
It checks pixel parity but deliberately has no machine-dependent timing gate.

## Size and validation

The existing package and per-artifact budgets pass unchanged. The local npm
archive measures 604.1 KiB packed / 1970.9 KiB unpacked with 80 files; minified
ESM measures 141.5 KiB gzip. This is a runtime-work optimization, not a claim of
substantial bundle reduction. Compared with baseline Git artifacts, minified ESM
raw size increases by 5 bytes (473,557 → 473,562), and minified UMD by 12 bytes
(471,634 → 471,646). Package headroom remains narrow.

Final `npm run ci` completed with exit code 0 on 2026-09-24. This includes
lint, generated builds/contracts/docs, type checks, package/tarball installation,
consumer bundle budgets, React/Vue SSR/hydration/mount-unmount, UI integrations,
MCP, 233 playgrounds, lifecycle/UMD smoke, visible animated-media continuity,
and the complete Chromium browser suite. Stylize's 19 pattern cases and 30
moving look/motion combinations passed. The separate A/B Canvas check passed
on Chromium, Firefox and WebKit.

Existing browser tests reported environment skips: Lazy/Stylize offscreen GIF
redraw could not be verified because this headless engine did not advance those
frames; Card Glow's backdrop-filter pixel assertion was skipped because the
plain control did not composite blur (1.16× the bare stripes). Those checks were
not weakened or removed. Physical iOS Safari, Android Chrome, battery consumption
and production-site field measurements were not performed. Progressive enhancement, accessibility
labels, reduced-motion behavior and media failure fallbacks remain unchanged.

## Follow-up candidates, not implemented

- Scroll Sequence frame-paint deduplication and bounded retained-image eviction
  are now implemented in follow-up PRs. The cache keeps a wider window than
  `preloadRadius`, releases loaded `Image` references/handlers outside it,
  and allows reverse scrubbing to recreate evicted frames. Browser/network
  resource caches remain browser-managed; this only bounds Kineto-owned refs.
- A shared scheduler for all pointer/scroll effects could reduce per-instance
  overhead, but it needs ordering and lifecycle evidence across the modules.
- Static-source sampling caches need explicit invalidation for resize, source
  changes, live media, flow motion and pointer lenses; no such cache was added.

Implementation references: [MDN Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
and [MutationObserver disconnect](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect).
