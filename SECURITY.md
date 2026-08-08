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

## Release integrity

- npm releases are published from the tag-triggered GitHub workflow with npm
  provenance enabled.
- Release verification checks the packed tarball allowlist, package-size budget,
  version/tag consistency, and generated release notes.
- Default CDN engine sources are pinned and protected with SHA-384 SRI.
- Dependency alerts are triaged as reproducible issue, patched dependency,
  accepted risk, or false positive with an evidence link in the relevant issue.
