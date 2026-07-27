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

The command validates the release, pushes `main`, creates an annotated tag, and
pushes the tag. The tag starts `.github/workflows/release.yml`, which:

1. checks version and bilingual release-note consistency;
2. runs full Node and browser verification;
3. packs and publishes the npm package with provenance;
4. creates a GitHub Release with English first and Korean second.

The publish step is idempotent: a workflow retry detects an already published
version and skips the duplicate npm publish.

## Existing prepared version

If the package version is already prepared, validate it directly:

```bash
npm run release:check -- v<version>
npm run verify
npm run release:ship -- v<version>
```

Never delete or move a published tag. Ship corrections as a new patch release.
