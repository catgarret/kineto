# Kineto v0.8.43 release audit

Date: 2026-07-29

## Decision

v0.8.43 is ready for the owner's release-approval checkpoint. Source changes,
the prepared version, distributable bundles, demos, documentation, translations,
and release automation have been verified. Commit, push, tag creation, npm
publication, and GitHub Release creation remain intentionally unexecuted until
the owner approves them.

## Verified scope

- 51 modules and 27 Core APIs
- 48 owner-locked requirements
- 182 demo playgrounds and 50 navigation sections
- source-derived option defaults and variant-specific option visibility
- 374 setting fields with help text in all seven supported locales
- demo-to-runtime defaults, public options, and settings-target parity
- zero inline style attributes, inline event handlers, or demo JS style writes
- ESM, CommonJS, UMD, CSS, React, Vue, and jQuery package surfaces
- lifecycle cleanup, reduced motion, SSR, accessibility roles, and mobile layout
- Scanner animation, determinate loading output, and Loader/Loading Indicator
  lifecycle separation
- GNB overview/dropdown/mega tabs and independently initialized settings targets
- Coverflow, Dissolve, Wipe, and Radial settings capability gating

## Verification results

`npm run ci` completed its build and complete Node test phase. The final demo and
browser groups were rerun after the last fixture corrections:

- demo QA: 182 playgrounds, lifecycle/UMD smoke, animated-media continuity
- browser navigation: 5/5 runtime and 11/11 navigation checks
- browser measurement: 27/27
- Loader core: 19/19
- drawer layout and capability gating: 23/23
- Loading Indicator, feedback components, demo polish, and navigation parity: pass
- npm audit: 0 vulnerabilities
- `git diff --check`: pass

## Distribution measurements

The npm dry-run tarball contains 11 allowlisted files:

- compressed package: 350,907 bytes (342.7 KiB)
- unpacked package: 1,206,731 bytes (1,178.4 KiB)

Consumer-facing compressed artifacts:

| Artifact | Raw | Gzip | Brotli |
| --- | ---: | ---: | ---: |
| `kineto.min.js` | 372.5 KB | 109.4 KB | 89.8 KB |
| `kineto.umd.min.js` | 370.7 KB | 108.7 KB | 89.4 KB |
| `kineto.min.css` | 41.8 KB | 8.7 KB | 7.7 KB |

All bundle and package budgets pass.

## Compatibility and deferred work

- Existing public imports, CDN paths, registration names, and default behavior
  remain compatible.
- Per-module entry points and tree-shaking are intentionally deferred. Adding
  them safely requires a separate package-surface design and compatibility
  review.
- Coverflow now has opt-in `activeShadow` and `activeShadowOpacity` options plus
  CSS custom properties. Its default remains off, preserving existing rendering.
- Five unreferenced demo-only CSS selectors were removed after repository-wide
  reference checks; no runtime or package entry was deleted.
- Safari/WebKit and physical iOS/Android devices remain recommended post-release
  smoke targets; Chromium desktop and responsive mobile layouts were verified.

## Approval sequence

After owner approval, follow `docs/RELEASING.md` for the existing prepared
version:

```bash
cd /Users/dongri/Documents/Develop/kineto
npm run release:check -- v0.8.43
npm run verify
git add -A
git commit -m "release: prepare v0.8.43"
npm run release:ship -- v0.8.43
```

The final command pushes `main` and the annotated tag. The tag-triggered GitHub
workflow publishes npm with provenance and creates the bilingual GitHub Release.
