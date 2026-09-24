# AI handoff — Kineto

This file is the stable starting point for a new Codex or Claude conversation.
It records where history lives and how work must be handed off without relying
on one vendor's chat context.

This English file is the canonical prompt for every coding agent and every
locale. The owner-facing Korean guide is
[`AI-HANDOFF.ko.md`](AI-HANDOFF.ko.md). Do not translate this file into more
agent prompts: keeping one canonical instruction prevents policy drift.

## Agent task protocol

Treat the repository as the conversation memory. Chat history, screenshots, and
another agent's prose report are leads to verify, not evidence of completion.

1. Read the files in the order defined by the root `AGENTS.md`.
2. Inspect `git status`, both staged and unstaged diffs, and the latest 30
   commits before editing.
3. Preserve the public API and existing user work. Never reduce a contract or
   demo to make a failure disappear.
4. State the behavior being fixed, add a proportional regression test, then
   implement the smallest compatible change.
5. Synchronize source, demo, contract, generated reference, translations, and
   the English/Korean `Unreleased` changelog pair.
6. Run focused checks while editing and `npm run ci` once before handoff.
   Before a release, run `npm run verify`.
7. Review the complete diff for security, accessibility, standards,
   progressive enhancement/degradation, lifecycle cleanup, network cost,
   bundle size, and untranslated copy.
8. Commit only task-owned files unless the owner explicitly requests an
   approval checkpoint. Never publish without explicit release approval.

### Scope and composition

- Add composition only for a concrete, low-coupling use case. Prefer existing
  DOM events and instance methods over a global event bus.
- Do not create circular module imports or a universal cross-module API.
- If useful composition would materially increase bundle size or API
  complexity, document the candidate and defer it.
- Do not change package exports or introduce per-module entry points during a
  patch release. Tree-shaking work requires a separate compatibility plan.
- Delete or merge a file only after repository-wide import, build, test,
  documentation, and package-reference searches prove it is unused.

### Hosted runner policy

All repository workflows pin `runs-on: ubuntu-24.04`. Do not restore a floating
OS label: GitHub's [Ubuntu 26 migration notice](https://github.com/actions/runner-images/issues/14748)
starts on 2026-10-19. `test:supply-chain-automation` checks every workflow so
OS migrations require an explicit contract update and browser validation.
The OS image still receives updates within Ubuntu 24.04.

## Current state

- Package: `@dong-gri/kineto`
- Current source version: `0.11.0`
- Latest published npm version at the time of this handoff: `0.10.0`
- Public surface: 54 modules and 29 Core APIs
- Primary branch: `main`
- Remote: `https://github.com/catgarret/kineto`

The exact current version and public surface are authoritative in
`package.json`, `kineto.features.json`, and `kineto.requirements.json`.

### Current owner workflow (updated 2026-09-24)

Multiple coding agents may work concurrently. Ordinary implementation work must
use an isolated task branch and a pull request into `main`; agents must not
direct-push implementation commits to `main`, even if GitHub temporarily has no
server-side branch protection configured. Recheck `origin/main` before edits,
before the final commit, and before updating the PR. If upstream touched the same
surface, reconcile against the new source instead of replaying an older patch.

Completed improvement batches should still reach the public demo: merge the
validated PR, let authoritative main CI complete, then verify the Pages
deployment for that merged commit. This does not authorize npm/MCP publication
or a tag; release approval remains separate.

## How to recover project history

Read:

1. `CHANGELOG.md` — user-facing changes and pending bilingual release notes
2. `git log --oneline --decorate -30` — exact implementation sequence
3. `OWNER_REQUIREMENTS.md` and `kineto.requirements.json` — owner-locked intent
4. `FEATURE_CONTRACT.md` and `kineto.features.json` — public API contract
5. `docs/CONTEXT.md` — behavior that previous agents must not regress
6. `docs/QA_REPORT.md` and `docs/STABILIZATION_REPORT.md` — verified surfaces

At this handoff, the most recent completed work includes:

- settings and demo hardening across the 53-module playground;
- composable Tilt/Card Glow shadows;
- Cover Reveal single/pair/palette/automatic colour modes;
- CSS colour inputs that preserve HEX, RGB(A), HSL(A), and custom properties;
- full CI, browser, lifecycle, package, and bundle-budget coverage.
- a runtime-only npm allowlist with an enforced release tarball size budget.
- variant-aware settings derived from source and checked against the public
  contract;
- determinate Loader/Loading Indicator progress events, CSS variables, and
  output binding;
- bounded composition through existing Slider, Cover Reveal, and loading
  lifecycle APIs.
- an end-to-end v0.9.6 release whose cross-browser CI, npm SLSA provenance,
  checksum-identical npm/GitHub tarballs, canonical Pages, and synchronized
  backup deployment are recorded in `docs/browser-qa-history.md`.
- v0.9.7 production fixes for authored text breaks, line-height-clipped counter
  reels, one-shot click media, deduplicated Quad Dot presets, and inertial hero
  landing; exhaustive control QA and native/fallback cssScroll checks are
  recorded alongside matching npm/GitHub tarballs and both deployed sites in
  `docs/QA_REPORT.md` and `docs/browser-qa-history.md`.
- v0.9.8 Slider/Reveal lifecycle fixes, nine comparison cards, complete
  high-risk preset selectors, animated hero locale/ARIA rebuilding, and
  immutable-action/dependency-floor guards; the 2026-09-12 local CI and
  three-engine variant checks are recorded in `docs/QA_REPORT.md`. CI
  `34674057118`, Release `34674057605`, canonical Pages `34674519452`, backup
  sync `34674543935`, and backup Pages `34674565133` succeeded. npm/GitHub
  tarballs are byte-identical, provenance metadata matches release commit
  `92bc1b688c04c0bf9833abfa53d4200648b80464`, and both sites served that build's
  matching first-party JS/CSS and click media at 2026-09-12 14:04 KST.

Subsequent source changes remain Unreleased until their own verification and
publication evidence is recorded. v0.9.8 does not close the documented Reveal
mask-family repeat/callback or Glitch Wave option gaps, physical-device QA, or
external case-study gates.

The 2026-09-14 Unreleased batch addresses masked Reveal reversible playback,
boundary callbacks and pause/resume, and Wave trigger/loop/duration/delay/
randomness plus hidden-tab suspension. It adds a localized one-shot Wave card
(199 playgrounds; 57/78 dedicated high-risk variants) and three-engine behavior
tests. A subsequent Unreleased change adds generic native Reveal pause/resume
when Web Animations is available, retaining delay/stagger and author animations.
Wave colors/blendMode now have opt-in palette/backdrop rendering, author-state
restoration and three-engine pixel tests. Generic native repeated viewport
callbacks remain open.
Five additional Reveal comparison cards (Fade, Zoom In/Out, Flip X/Y) bring
the demo to 204 playgrounds and 62/78 dedicated high-risk variants. Five directional
comparisons (Fade Down/Left/Right and Slide Down/Right) now bring those counts to
209 playgrounds and 67/78, without changing the historical preset directions.
Blur, Rise, Soft and Rotate complete dedicated Reveal coverage at 23/23, bringing
the current demo to 213 playgrounds and 71/78 dedicated high-risk variants.
Glitch text/image/CRT/VCR/seeded burst teardown now prevents retained instances
from restarting and restores owned style priorities. Ten renderer cases exercise
terminal teardown alongside the existing Wave checks; see QA_REPORT for size cost.
The next Unreleased correction resolves low-tier Reveal presets through the
native backend before rendering; loaded GSAP/ScrollTrigger are not used there.
Native completion tracking uses a Set and reuses keyframe input;
multi-token class hooks are batched. See QA_REPORT for the separate cost evidence.
Package growth is an explicit lifecycle cost, not a bundle-size optimization;
see the current budget reports and QA evidence before releasing this batch.

The 2026-09-18 Unreleased batch (Claude, working from a cloud clone synced with
the owner's checkout) verified and committed the pending Glitch teardown work,
then added: a share-link policy that keeps markup-rendering fields and
off-origin resource URLs out of `?kt=` restores (a crafted link could execute
script on the public demo); SRI-verified reuse of pre-existing engine tags;
`subscribe()` on the Presence controller so React/Vue `status`/`result` follow
parent-propagated runs (the framework QA nested-propagation assertion was
timing-dependent before); one shared priority-preserving `snapshotInlineStyles`
(Glitch's local copy removed); minified demo assets in the deployed `site/`
with a Chromium `site-smoke` gate; and the five Dependabot GitHub Actions
majors with upstream-verified SHAs. Budgets absorb only measured costs
(package 536/1775 KB, min ESM 416 KB raw, Vue consumer 144 KB). Local
verification ran on Node 22 with Chromium 141; `test:demo`'s animated-media
step could not complete in that container on the published v0.9.8 baseline
either, so remote CI is the authority for it. See QA_REPORT for the record.

v0.9.9 shipped on 2026-09-18 (KST 2026-09-19 00:11): CI `35359625205`,
Release `35359768823`, canonical Pages `35361162158`; npm and GitHub tarballs
are byte-identical (`f9104ab4…10cd`), provenance points at release commit
`ba0bb4bcfe51a3fc6919149f7ac1191da4d7a93d`, and kineto.dongri.me served that
build's 16 first-party assets byte-matched at 15:18 UTC. Backup parity is
recorded separately once the 15-minute sync catches up. Physical-device QA and
external case studies remain open.

The 2026-09-19 Unreleased batch (targeting v0.10.0) adds the Lazy stylized
media variants `dither` / `ascii` / `halftone` on one shared canvas rasterizer
(`src/modules/lazy/stylizedMedia.js`; option reading and canvas layering are
shared by the `<img>` and `<video>` paths through `readStylizedSettings()` /
`createStylizedCanvasLayer()` in `src/modules/lazy.js`). Contract: owner
requirements MK-LAZY-008 and MK-STYLIZE-001 (50 total, requirements 3.3.0), feature contract 1.7.0
with a new `media` variant capability, twelve public options with declared
defaults, and derived `variantOptions`. Demo: four cards (217 playgrounds,
74/81 dedicated high-risk variants) plus seven-language copy and tooltips; the
drawer now applies variant gating at open (a pre-existing bug fixed and
regression-tested in `drawer-layout`). Tests: `tests/browser/lazy-stylized.mjs`
(Chromium/Firefox/WebKit, environment-aware for headless builds that do not
advance GIF frames or deliver canvas-stream video frames) is in `test:browser`
and both cross-browser lanes, plus `tests/lazy-stylized-media.mjs` for the
rasterizer's pure parts. Budgets absorb the measured ~13 KB raw / 4.7 KB gzip
cost only. Guides changed: push vs release approvals, `data-demo-no-legacy-share`,
`KT_CHROME` unification, real-usage evidence definition and variant→module
promotion criteria in ROADMAP §3.

v0.10.0 shipped on 2026-09-19 04:22 UTC (KST 13:22): CI `35420646875` and
Release `35420648097` succeeded; npm and GitHub tarballs are byte-identical
(`50d6d0e0…658f`, 563,063 bytes), provenance points at release commit
`3228d26cdd91380fdb08af59c2580b7876f6f59f`. The canonical Pages deploy
(`35421347873`) was **cancelled** by the static `demo-site` concurrency group —
Dependabot-branch CI completions create skipped `workflow_run` deploys that
still entered the group — so kineto.dongri.me kept serving build `9b9449e`
(v0.9.9) while the backup mirror already served `3228d26`. `pages.yml` now scopes
the group to real deploys (`demo-site-main`) and `tests/release-automation.mjs`
locks it; the next successful `main` push CI (or a `workflow_dispatch` of
`pages.yml`) republishes the canonical site. See QA_REPORT `### v0.10.0`.

The post-v0.10.0 Unreleased batch is the integration program: `Kineto.observe()`
(29th Core API, MutationObserver-based live DOM attach/release),
`kineto.integrations.json` (+ schema; 12 ecosystems, 31 intents, Figma hints)
generating `docs/integrations/*.md`, `ai/kineto.rules.md`,
`ai/cursor/kineto.mdc`, `site/llms.txt` and the MCP contract copies via
`npm run integrations:build`; the shadcn registry (`registry/` → `site/r/*.json`,
namespace `@kineto`); the real-library fixture `tests/integrations/` (MUI,
Mantine, Chakra, Ant Design, Vuetify, PrimeVue attachment QA, strict TS +
`shadcn add` registry QA incl. the namespaced form, and the Bootstrap 5
coexistence page `examples/bootstrap/index.html` driven in Chromium); and the
MCP server package `packages/kineto-mcp` (`@dong-gri/kineto-mcp`, seven tools,
four resources, one prompt, stdio E2E test; publishing is the owner's call).
All of it is contract-checked by `tests/integrations-contract.mjs` and wired
into `test:node`, both workflow loops (`test:observe`, `test:integrations`,
`test:mcp`), lockfile/audit/Dependabot coverage and lint.

Environment note for agents: every browser suite locates a local Chromium
through `KT_CHROME` (`MK_CHROMIUM` remains a legacy alias for the demo /
animated-media / browser-smoke / nav-parity suites); set it when the installed
Playwright browser revision differs. `npx playwright install firefox webkit`
downloads the other two engines for `KT_BROWSER=firefox|webkit` runs.

Always verify this summary against Git history because later commits supersede
it.

The 2026-09-20 review hardens Stylize reduced-motion handling (keep the texture,
disable added motion/pointer reactions), repeated image/video teardown, and
callback-triggered image-controller teardown. ROADMAP §10 now separates completed
comparison/Stylize work from open video trigger/timing and pause-scheduling gaps.

The follow-up completes video reveal trigger/timing and active-time suspension:
manual/view gating, queued pre-load replay, delay/hold, module/media pause and
hidden-tab RAF cancellation. Source and public-bundle browser regressions share
a decoded-video probe. See QA_REPORT for the measured raw/package cost,
unchanged gzip limits and environment gaps.
The image batch also preserves delay/hold timers and reveal progress across
pause/visibility, defers static resize and paused replay, and guards callback
re-entry. Core tracks explicit pause separately from visibility suspension so
the same behavior holds through the public API, not only direct module calls.

The native transform/opacity Reveal path now shares the mask family's boundary
observer: repeat/reverse, all four boundary callbacks, nested clipping and
replay retain their lifecycle. Own transforms are excluded from trigger bounds
to prevent edge oscillation. This supersedes the earlier generic-native repeat
gap; class-only hooks and no-WAAPI pause limitations are unchanged.

Stylize can now be switched between a moving and a still look WHILE it runs.
`update()` accepts the living-look options only (`motion`, `motionSpeed`,
`motionAmount`, `pointer`, `pointerRadius`, `pointerStrength`,
`pointerCellSize` — `LIVE_LOOK_KEYS` in `src/modules/media/rasterizer.js`) and
returns `false` for anything else, which is now a normal answer:
`Kineto.updateModule()` recreates the instance quietly instead of logging an
error, so a module no longer has to throw to decline a patch. The renderer gained
`configure()` (re-resolves the live-look block in place) and each stylizer gained
`setLiveLook()`; on `persist` the frame loop is started or stopped so a stopped
look also stops costing frames. Instances expose `motion`, the motion actually in
effect, because reduced motion can differ from what the markup asked for — the
demo's per-card motion switch reads that rather than the attribute. Covered by
`tests/browser/stylize.mjs` (canvas identity, measured frame counts, and the
demo's own switches pressed on the real page), `tests/update-model.mjs` (the
declined-patch contract), `tests/lazy-stylized-media.mjs` (the resolver) and
`tests/demo-structure.mjs` (the demo switches' markup contract).

Squircle is the 54th public module, and the first added under ROADMAP §3's new
evidence ④ (owner asked, with a concrete blocker: `border-radius` cannot draw
the corner their design uses). The geometry lives in
`src/modules/surface/superellipse.js` so other looks can share it — `cornerProfile(k)`
returns how a quadrant is walked and `diagonalFraction(k)` the one number that
identifies a shape. Two facts there are measured, not read: CSS's
`superellipse(K)` means exponent `2^K`, and a NEGATIVE K is the mirror of the
positive curve rather than that formula with a fractional exponent (Chromium's
`scoop` meets the 45° diagonal at 70.7% of the radius; the fractional-exponent
curve would be at 75%). Quadrant endpoints are written down rather than computed
because `Math.cos(Math.PI / 2)` is 6.1e-17, which at the extreme K values raises
to 0.98 and collapses `notch` into a bar. On the polyfill path the module must
CLEAR `border-radius`: left in place it is a second clip intersected with the
outline, and a squircle comes out round. `tests/browser/squircle.mjs` compares
against the browser's own `corner-shape` by corner area and diagonal crossing,
never by horizontal edge distance — near the ends of a corner the curve is almost
horizontal, so the 2px slop in Chromium's hit test becomes tens of pixels there
and the number stops meaning anything.

`tests/help-coverage.mjs` now runs `demo/playground.js` and reads
`KinetoPlayground.fields` instead of parsing the first `FIELDS` literal, which
was 32 of 50 modules. The 110 options it uncovered without tooltips are listed
in `KNOWN_GAPS` as a ratchet: the list may only shrink, and an entry left in
after its tooltip is written fails the build.

Card Glow's `glass` and FLIP's `fold` are the same design decision as Squircle's
variant question, resolved the other way: both had a natural home, so neither
became a module. Glass is a surface treatment on a card that answers the pointer,
which is what Card Glow is; fold is a way of crossing the gap between two
layouts, which is what FLIP is, and ROADMAP §3 forbids a `layout` module that
overlaps it in as many words.

Two things about `glass` that will bite anyone who moves it. Card Glow sets
`isolation: isolate` for every other look, and a `backdrop-filter` inside an
isolated stacking context has no backdrop to filter — the pane comes out clear
while every computed style still reads correctly, so glass skips the isolation
and `tests/browser/card-glass.mjs` measures rendered pixels rather than styles
(decoded stripe contrast against a plain blur control; PNG compression size
is not a reliable blur metric). Headless engines may fail the plain control;
record that limitation instead of claiming pixel validation. Options are read INSIDE the
`mode === 'glass'` branch on purpose: read at the top of the factory,
`scripts/derive-variant-options.mjs` attributes them to every variant and the
drawer offers glass controls on the spotlight.

The refraction (`src/modules/surface/glass.js`) is a displacement map built per
pane from a signed distance field, applied through an SVG filter used as a
`backdrop-filter` — Chromium only today, dropped elsewhere. The filter element
lives inside the pane's own layer so its id cannot collide and destroy() takes
it along. CSS.supports accepts SVG URL syntax in engines that do not composite
it; the refraction gate also restricts it to Chromium-family user agents.
The demo uses low blur and a capsule shape; the public 14px blur default remains.

Dock packing must use a continuous anchor. A nearest-icon anchor jumps the row
44px on a 2px midpoint crossing in the previous implementation. The browser
regression checks both crossing directions; retain the last anchor while
leaving so returning to rest cannot introduce another discontinuity.

`fold` shares `crossfade`'s ghost path. The one thing that makes it a different
effect is the blur, so its test keeps `crossfade` running beside it as a control:
if the blur were ever dropped the two would become the same effect, and nothing
else would notice.

## Required end-of-task record

Every implementation commit must leave enough evidence for the next agent:

- tests encode the regression or behavior;
- affected contracts/docs/translations are synchronized;
- English and Korean bullets are added under the top `Unreleased` heading in
  `CHANGELOG.md`;
- the final response names the commit and verification command.

Do not use this file as a scratchpad for every tiny edit. Git commits and the
bilingual changelog are the append-only task history.

### When the agent cannot use Git

An agent without repository or Git integration must still finish with a
copy-paste command block. It must contain concrete paths and the actual
conventional commit message for that task—never placeholders such as
`<changed-files>`.

The block must:

1. enter the repository;
2. run the agreed verification command;
3. show the current status;
4. stage only the files that belong to the task;
5. create the commit.

Publishing commands are a separate block and are only included after the owner
has explicitly approved a release. Never combine ordinary verification and
`release:ship` into one unattended command.

The final handoff must distinguish completed, partially completed, and deferred
items. Include changed/added/deleted files, the important diff, checks and
measurements, compatibility risk, recommended semantic version, English then
Korean release-note drafts, and concrete validation/release commands.

## Release handoff

Release operations are documented in `docs/RELEASING.md`. A pushed
`vMAJOR.MINOR.PATCH` tag is the only automated publication trigger. Ordinary
commits and pushes run CI but never publish.
