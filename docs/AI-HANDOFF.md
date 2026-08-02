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
- Current source version: `0.8.50`
- Latest npm version at the time this workflow was added: `0.8.42`
- Public surface: 51 modules and 27 Core APIs
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

- settings and demo hardening across the 51-module playground;
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
