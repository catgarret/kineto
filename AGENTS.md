# Kineto repository instructions

These rules apply to Codex, Claude, and every other coding agent working in this
repository.

## Read before changing code

Read these files in order:

1. `docs/AI-HANDOFF.md`
2. `OWNER_REQUIREMENTS.md`
3. `kineto.requirements.json`
4. `FEATURE_CONTRACT.md`
5. `kineto.features.json`
6. `docs/CONTEXT.md`
7. `docs/AGENTS.md`
8. The affected module source, demo, documentation, and tests

Chat history is not a source of truth. Recover prior decisions from the files
above, `CHANGELOG.md`, and `git log --oneline --decorate -30`.

## Finish every implementation task

Unless the user explicitly asks for read-only analysis or says not to commit:

1. Implement the requested change without rewriting unrelated user work.
2. Add or update proportional automated tests.
3. Update affected module docs, contracts, demos, and translations.
4. Add concise release bullets to the top `CHANGELOG.md` `Unreleased` section:
   English first and the matching Korean translation second.
5. Run the smallest useful checks while iterating, then one integrated
   `npm run ci` before handoff.
6. Stage only files belonging to the task and create a descriptive conventional
   commit. Never include unrelated dirty-worktree files.
7. Report the commit hash, checks run, and any environment not verified.

Use `fix:`, `feat:`, `docs:`, `test:`, `refactor:`, `perf:`, `build:`,
`ci:`, or `release:` prefixes. Do not push ordinary work unless the user asks.

## Release policy

A normal code request is not permission to publish. Only release when the user
explicitly asks to deploy, publish, ship, or release.

For a release:

1. Read `docs/RELEASING.md`.
2. Confirm the working tree is clean and all intended work is committed.
3. If preparing a new version, run one of:
   - `npm run release:prepare -- patch`
   - `npm run release:prepare -- minor`
   - `npm run release:prepare -- major`
4. Review generated versions, `CHANGELOG.md`, build artifacts, and
   `.github/release-notes/v<version>.md`.
5. Run `npm run verify`.
6. Commit the release preparation as `release: prepare v<version>`.
7. Run `npm run release:ship -- v<version>` only after explicit release
   authorization. This pushes `main` and the annotated tag.
8. The tag-triggered GitHub workflow validates, publishes to npm with provenance,
   and creates the GitHub Release using English notes followed by Korean notes.
9. Confirm both the GitHub Release and npm version before reporting success.

Never hand-edit or move a tag after npm publication. If a published release is
wrong, fix forward with a new patch version.
