# Releasing Kineto

Kineto uses a tag-triggered GitHub Actions release. The workflow runs the full
verification suite, publishes `@dong-gri/kineto` to npm with provenance, and
creates the GitHub Release.

## One-time repository setup

Configure npm Trusted Publishing for:

- npm package: `@dong-gri/kineto`
- GitHub owner: `catgarret`
- repository: `kineto`
- workflow: `release.yml`

The workflow requests `id-token: write`; no long-lived npm token is stored in
the repository. GitHub Actions also needs `contents: write`, which is declared
in the workflow.

The public demo is deployed directly from the Kineto repository's GitHub Pages
artifact. `pages.yml` accepts only a successful same-repository `push` CI run on
`main`, rebuilds that exact commit, and deploys `site/`; no cross-repository
token is required. The page executes the minified JavaScript and CSS copied from
the same tested `dist/` into the Pages artifact. Public installation snippets
still show the unversioned jsDelivr aliases, and the release workflow purges
only the four files actually shipped to npm after publication.

The canonical demo URL is `https://kineto.dongri.me`. Enable GitHub Pages for
the Kineto repository with the GitHub Actions source and keep
`kineto.dongri.me` as its Pages custom domain. The separate
`catgarret.github.io/example/kineto` copy is maintained by that repository's
`sync-kineto.yml`: every 15 minutes it selects the newest successful Kineto
`main` push CI commit, builds and verifies it in a read-only job, then passes the
artifact to a separate write-scoped job that replaces only `example/kineto`.
This avoids a cross-repository token in Kineto while keeping the backup
automatic. Do not change the `CNAME` file in `catgarret.github.io`, because that
would change the custom domain for the whole personal Pages site.

After Pages deploys, `npm run test:live-site` re-fetches the canonical URL and
checks the live response for the expected commit, version, module count, GTM,
and public CDN installation snippet. It also downloads the JavaScript and CSS
used by that page and compares their SHA-256 digests with the local tested
`dist/` files. This prevents a new HTML shell from silently executing an older
npm/CDN runtime. The Pages job permits a bounded two-minute propagation window
for the custom domain, while every HTML and asset request has its own finite
timeout.

After the backup sync finishes, run `npm run test:live-site:parity` to check the
canonical and backup URLs together, including their build markers and runtime
asset hashes.

`.github/workflows/live-site-parity.yml` runs the same check weekly and on manual
dispatch. It is intentionally independent of the Pages deploy workflow, so a
delayed or failed backup sync raises a separate signal instead of blocking a
canonical deploy.

## Preparing a version

Start from a clean `main` branch after all feature/fix commits are complete.
Every pending change must already be listed in both languages under the top
`CHANGELOG.md` `Unreleased` section.

```bash
npm run release:prepare -- patch
# or: minor / major / an explicit version such as 0.9.0
```

This command:

- bumps every tracked version source;
- moves bilingual Unreleased notes into the new dated changelog section;
- writes `.github/release-notes/v<version>.md`;
- regenerates contract documentation and distributable builds.
- checks that the npm/GitHub Release tarball contains only minimized runtime
  entry points and remains within its compressed, unpacked, and file-count
  budgets.

Preparation updates the current source labels in the QA report and AI handoff,
but preserves the last verified npm version, historical workflow runs, dates,
and artifact hashes. Record new publication and deployment evidence only after
the corresponding remote operations succeed.

Review the result, then run:

```bash
npm run verify
git add -A
git commit -m "release: prepare v<version>"
```

## Publishing

Publishing is an explicit external action:

```bash
npm run release:ship -- v<version>
```

The command validates the release, quietly checks that neither the local nor
remote tag exists, pushes `main`, creates an annotated tag, and pushes the tag.
The tag starts `.github/workflows/release.yml`, which:

1. checks version and bilingual release-note consistency;
2. runs lint, build, Node, demo, Chromium, package, and all-lockfile audit gates;
3. independently requires Firefox and WebKit smoke plus demo regression gates;
4. packs one verified tarball, records its SHA-256 digest, and passes that exact
   artifact to the permission-scoped publish job as an explicit `./`-prefixed
   local path so npm cannot reinterpret it as a Git package spec;
5. publishes the tarball to npm with provenance only after every browser gate;
6. creates a GitHub Release with the runner's built-in `gh` CLI, with English
   first and Korean second.

Third-party GitHub Actions are pinned to immutable full commit SHAs. Their
readable major-version comments are informational; update the SHA only after
reviewing the upstream action release.

The publish step is idempotent: a workflow retry detects an already published
version and skips the duplicate npm publish.

## Release package policy

The Git repository intentionally keeps full sources, demos, tests, translations,
and QA documents. They are not copied into the npm tarball. The published
package contains the minimized ESM, CommonJS, browser UMD and CSS entry points,
framework adapters, README, licence, package metadata, and logo.

Run the package-only budget check with:

```bash
npm run test:package-size
```

Do not widen the npm `files` allowlist for development convenience. Link to the
GitHub documentation or demo instead.

## Existing prepared version

If the package version is already prepared, validate it directly:

```bash
npm run release:check -- v<version>
npm run verify
npm run release:ship -- v<version>
```

Never delete or move a pushed release tag, including when its publish workflow
fails before npm publication. Ship corrections as a new patch release.
