# AI handoff — Kineto

This file is the stable starting point for a new Codex or Claude conversation.
It records where history lives and how work must be handed off without relying
on one vendor's chat context.

## Current state

- Package: `@dong-gri/kineto`
- Current source version: `0.8.43`
- Latest npm version at the time this workflow was added: `0.8.42`
- Public surface: 50 modules and 26 Core APIs
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

- settings and demo hardening across the 50-module playground;
- composable Tilt/Card Glow shadows;
- Cover Reveal single/pair/palette/automatic colour modes;
- CSS colour inputs that preserve HEX, RGB(A), HSL(A), and custom properties;
- full CI, browser, lifecycle, package, and bundle-budget coverage.
- a runtime-only npm allowlist with an enforced release tarball size budget.

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

## Release handoff

Release operations are documented in `docs/RELEASING.md`. A pushed
`vMAJOR.MINOR.PATCH` tag is the only automated publication trigger. Ordinary
commits and pushes run CI but never publish.
