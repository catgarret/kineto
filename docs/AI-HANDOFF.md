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

## Current state

- Package: `@dong-gri/kineto`
- Current source version: `0.10.0`
- Latest published npm version at the time of this handoff: `0.9.9`
- Public surface: 52 modules and 28 Core APIs
- Primary branch: `main`
- Remote: `https://github.com/catgarret/kineto`

The exact current version and public surface are authoritative in
`package.json`, `kineto.features.json`, and `kineto.requirements.json`.

## How to recover project history

Read:

1. `CHANGELOG.md` — user-facing changes and pending bilingual release notes
2. `git log --oneline --decorate -30` — exact implementation sequence
3. `OWNER_REQUIREMENTS.md` and `kineto.requirements.json` — owner-locked intent
4. `FEATURE_CONTRACT.md` and `kineto.features.json` — public API contract
5. `docs/CONTEXT.md` — behavior that previous agents must not regress
6. `docs/QA_REPORT.md` and `docs/STABILIZATION_REPORT.md` — verified surfaces

At this handoff, the most recent completed work includes:

- settings and demo hardening across the 52-module playground;
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
requirement MK-LAZY-008 (49 total, requirements 3.2.0), feature contract 1.4.0
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

Environment note for agents: every browser suite locates a local Chromium
through `KT_CHROME` (`MK_CHROMIUM` remains a legacy alias for the demo /
animated-media / browser-smoke / nav-parity suites); set it when the installed
Playwright browser revision differs. `npx playwright install firefox webkit`
downloads the other two engines for `KT_BROWSER=firefox|webkit` runs.

Always verify this summary against Git history because later commits supersede
it.

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
