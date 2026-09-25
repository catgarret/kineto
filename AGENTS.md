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

## Concurrent-agent branch policy

Assume another coding agent may be working at the same time.

1. Never make an implementation commit directly on `main`. Start from the
   latest `origin/main` in an isolated checkout/worktree and use a task branch.
2. One task owns one branch. Do not reuse another agent's branch or rewrite its
   history. Prefer an agent/task-qualified name such as
   `agent/<agent>/<short-task>` when creating a new branch.
3. Before editing, before the final commit, and again before opening/updating a
   pull request, fetch/recheck `origin/main` and inspect commits that landed
   since the task started.
4. If new upstream work touches the same files or behavior, re-read the current
   source and reconcile intentionally. Never blindly replay an older patch over
   newer agent work.
5. Finish through a pull request targeting `main`. CI on the PR is the
   integration authority; do not merge while required checks are failing or
   pending.
6. Do not force-push shared branches and never force-push or delete `main`.
   If a task branch must be rewritten, first verify no other agent or human is
   using it; otherwise merge/rebase without destructive history changes.
7. A request to "push" ordinary work means push the task branch / update its
   PR, not bypass the PR path by pushing directly to `main`. Releases remain
   subject to the separate release approval below.

This policy still applies if repository-side branch protection is temporarily
missing: agent behavior must not depend on GitHub accepting an unsafe write.

## Finish every implementation task

Unless the user explicitly asks for read-only analysis or says not to commit:

1. Implement the requested change without rewriting unrelated user work.
2. Add or update proportional automated tests.
3. Update affected module docs, contracts, demos, and translations.
4. Add concise release bullets to the top `CHANGELOG.md` `Unreleased` section:
   English first and the matching Korean translation second.
5. Run the smallest useful checks while iterating, `npm run verify:push`
   before every push (see below), and one integrated `npm run ci` before a
   release.
6. Stage only files belonging to the task and create a descriptive conventional
   commit. Never include unrelated dirty-worktree files.
7. Report the commit hash, checks run, and any environment not verified.

If the agent cannot use Git directly, replace steps 6–7 with a concrete,
copy-paste terminal block for the user. It must run verification, show status,
stage only the task's exact files, and use the actual conventional commit
message. Do not leave placeholders. Keep release/publish commands in a separate
block and include them only after explicit owner approval.

Use `fix:`, `feat:`, `docs:`, `test:`, `refactor:`, `perf:`, `build:`,
`ci:`, or `release:` prefixes. Do not push ordinary work unless the user asks.

Two separate approvals, because they have different consequences:

- **Push**: push the task branch and update/open its pull request. Merging the
  validated PR into `main` starts the authoritative main CI and, when CI
  passes, the Pages workflow redeploys the public demo site. Do not direct-push
  ordinary implementation commits to `main`.
- **Release** (`npm run release:ship -- v<version>`): also pushes the annotated
  tag, which publishes the npm package and creates the GitHub Release. Only an
  explicit "release/ship/publish" request covers this; a push request does not.
  The MCP server has its own tag (`npm run release:ship -- mcp-v<version>`,
  `release-mcp.yml`) under the same rule; the two packages are released
  separately.

Demo cards added to `demo/index.html` carry `data-demo-no-legacy-share` so the
historical `?kt=` v1 share ordinals of every existing card stay stable; the new
card still gets a semantic v2 share key. Run `npm run test:demo` to confirm.

Every public variant has to be reachable from the demo's **Compare all variants**
sheet. Adding a variant to `kineto.features.json` is not enough on its own: run
`npm run test:variant-compare`, and when it fails do one of the three things it
names — add demo material that satisfies the variant's requirement, tag the
control the demo already has with `data-demo-variant="<module>:<variant>"`, or
record in `scripts/generate-variant-catalog.mjs` why those variants cannot sit
side by side. Never hand-edit `demo/variant-catalog.js` or `docs/variant-compare.md`;
both are generated (`npm run catalog:variants`). Details: `docs/variant-compare.md`.

Integration program (one source, many generated artefacts): edit
`kineto.integrations.json` (schema: `kineto.integrations.schema.json`) and the
registry sources under `registry/`, then run `npm run integrations:build`. Never
hand-edit `docs/integrations/*.md`, `ai/`, `site/llms.txt`, `site/r/*.json`, or
`packages/kineto-mcp/contracts/*` / `packages/kineto-mcp/src/lib.mjs`; they are
regenerated by that command and `tests/integrations-contract.mjs` fails when
they drift. Every claim in the map must hold against the real library: extend
`tests/integrations/` (attachment / registry / Bootstrap QA) and the MCP test
(`packages/kineto-mcp/test`) with the change. Do not publish
`@dong-gri/kineto-mcp` without the owner's explicit request.

Browser suites locate a local Chromium through `KT_CHROME=<path>` when the
installed Playwright revision differs from the expected one (`MK_CHROMIUM` is
accepted as a legacy alias). Container Chromium builds without proprietary
codecs cannot play the H.264 demo video: the animated-media QA skips only that
video step there and says so, while CI (`CI=true`) must decode it and never
skips. Record any other environment-only failure instead of weakening the
checks.

## Before every push: CI is not a test runner

Most red CI runs come from checks that take minutes locally. Of 26 failed CI
runs reviewed on 2026-09-25, 15 were lint errors, a `ReferenceError`, or
generated files that were not regenerated or not committed; the other 11 were
browser tests that broke or flaked on one engine.

1. Run `npm run verify:push` (lint → build → generated-file check → every Node
   test → demo QA; about 4 minutes) and push only when it passes. When the
   build changed generated files it lists them — they are already regenerated;
   commit them.
2. When you add or change a browser test, or the code it covers, run that test
   several times with retries off before pushing:
   `node scripts/run-lane.mjs test:browser --only <name> --repeat 3`.
   For an engine-sensitive change, also run it in that engine:
   `KT_BROWSER=webkit node scripts/run-lane.mjs test:browser:cross --only <name> --repeat 3`.
3. Never push to find out whether CI passes, and never push a fix for a red CI
   run without reproducing the failure first. CI names the failing test and
   its assertion in public annotations (`tests/ci-annotate.mjs`), readable
   without signing in.
4. Assert on conditions, not on time: wait for the state with a bounded poll
   (`page.waitForFunction(check, arg, { timeout })`) instead of a fixed
   `waitForTimeout` before an assertion. A test that passes only on a retry is
   reported as **flaky** (a CI warning annotation and the lane summary) — fix
   it in the same task instead of raising the retry count.
5. `npm run hooks:install` (once per clone) adds a pre-push hook that runs
   `npm run verify:push -- --fast` automatically; skip it once with
   `git push --no-verify`.

Test lists live only in `package.json` (`test:node`, `test:browser`,
`test:browser:cross`, `test:release-package`). CI runs them through
`scripts/run-lane.mjs`, split into parallel shards, so a test added to a lane is
covered by CI without editing any workflow.

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
5. Confirm `npm run test:package-size` passes, then run `npm run verify`.
6. Commit the release preparation as `release: prepare v<version>`.
7. Run `npm run release:ship -- v<version>` only after explicit release
   authorization. This pushes `main` and the annotated tag.
8. The tag-triggered GitHub workflow requires CI's green result for the tagged
   commit on `main` (it does not re-run CI's test lanes), checks and packs the
   package, publishes to npm with provenance, and creates the GitHub Release
   using English notes followed by Korean notes. If CI was red because of a
   flake, re-run the failed CI jobs and then the release workflow; nothing was
   published, so the tag stays usable.
9. Confirm both the GitHub Release and npm version before reporting success.

Never hand-edit or move a tag after npm publication. If a published release is
wrong, fix forward with a new patch version.
