# Security Policy

## Supported versions

Security fixes are provided for the latest published Kineto release. Older
versions receive fixes only when a maintainer explicitly confirms backporting.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Email the
maintainer through the contact address listed on the npm package or GitHub
repository profile, including a minimal reproduction, affected version, impact,
and any suggested mitigation.

We aim to acknowledge reports within 3 business days and to provide an initial
assessment within 7 business days. These are response targets, not a promise of
an immediate patch; reports requiring coordinated disclosure will receive an
agreed timeline before publication.

## Trust model for option values

Kineto options usually come from markup (`data-kt-*` attributes), and markup is
often filled from a CMS, a translation file, or user data. So:

- **Option values are text.** A value is written with `textContent`,
  `setAttribute`, or a CSS property — never parsed as HTML. This holds for every
  option except the ones below, and is tested in
  `tests/browser/markup-trust.mjs` (caret characters, ring colours, toast icons,
  and cursor ring text used to be interpolated into HTML strings).
- **HTML is opt-in and author-only.** Only options named for HTML accept it:
  `html` / `template` / `hoverTemplate` (Cursor), `uiTemplate` (Lightbox),
  `content` together with `html: true` (Tooltip), and Overflow Text items with
  its HTML flag. Never fill these from untrusted data; sanitize first if you
  must.
- **Page Transition injects only same-origin HTML.** A link, and the public
  `navigate()`, must be a same-origin http(s) URL; the response must come from
  this origin after redirects and be `text/html` (or XHTML). Anything else is
  handed to the browser as an ordinary navigation. Scripts in the fetched page
  run by default (`executeScripts`), which is why this boundary exists.

## Release integrity

- npm releases are published from the tag-triggered GitHub workflow with npm
  provenance enabled.
- Release verification checks the packed tarball allowlist, package-size budget,
  version/tag consistency, and generated release notes.
- Default CDN engine sources are pinned and protected with SHA-384 SRI. The
  loader only reuses a pre-existing `<script>` for an engine URL when that tag
  carries the same integrity value; an unverified tag is never adopted.
- The public demo treats `?kt=` settings links as untrusted input: fields a
  module renders as HTML and off-origin resource URLs are never restored from a
  link, and every other restored value must be one the settings panel itself
  could produce — a listed choice, a finite number, a boolean, a real CSS
  colour, or short text with no resource-fetching CSS (`url(`, `image-set(`,
  `@import` …) — see `docs/troubleshooting.md`.
- Dependency alerts are triaged as reproducible issue, patched dependency,
  accepted risk, or false positive with an evidence link in the relevant issue.
