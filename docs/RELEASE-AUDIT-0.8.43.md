# Kineto v0.8.43 release audit

Date: 2026-07-27

## Decision

v0.8.43 is **not ready to tag or publish yet**. Do not prepare v0.8.44 until the
bundle-size regression and platform-complete verification below are resolved.

## Verified in this audit

The following checks passed against the supplied repository and committed dist:

- ESLint
- utility and SSR checks
- 51-module / 26-Core-API feature contract
- 48 owner-locked requirements
- generated documentation synchronization
- ESM, CommonJS, CSS, and adapter package surfaces
- release-package allowlist and package-size budget
- demo navigation and structure parity
- seven-locale copy/help/README synchronization
- lazy playground construction and public-option synchronization
- easing, reduced-motion, update, lifecycle, performance, dependency, engine,
  regression, site-deploy, and release-automation checks

## Release blocker

`npm run test:size` fails for `dist/kineto.min.js`:

- raw: 337,233 bytes (within the 330 KB raw ceiling)
- gzip: 98,431 bytes
- gzip ceiling: 98,304 bytes
- overage: **127 bytes**

Do not raise the budget merely to make this pass. Reduce the ESM bundle and
regenerate all dist artifacts from source.

## Environment-limited checks

The supplied ZIP contains macOS ARM native Node dependencies. This Linux audit
environment therefore cannot load Rolldown's Linux binding, rebuild Vite output,
or launch the supplied macOS Playwright browser. The following checks must run
on the owner's Mac after a clean dependency install:

```bash
rm -rf node_modules
npm ci
npm run verify
```

`npm run verify` includes build, Node tests, demo/browser QA, package install
verification, bundle budgets, and dependency audit.

## Release completion sequence

After the size regression is fixed and `npm run verify` passes on macOS:

```bash
npm run release:prepare -- patch
npm run verify
git add -A
git commit -m "release: prepare v0.8.44"
npm run release:ship -- v0.8.44
```

The final command pushes `main` and the annotated tag. The tag-triggered GitHub
workflow publishes npm with provenance and creates the bilingual GitHub Release.
Confirm both npm and GitHub before declaring the release complete.
