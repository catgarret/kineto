// Ship a release tag from a clean `main`: validate, push main, WAIT for CI to
// pass on that exact commit, then create and push the annotated tag. Which
// package the tag belongs to (and which validation runs first) comes from
// scripts/release-targets.mjs:
//   npm run release:ship -- v0.11.0       # @dong-gri/kineto
//   npm run release:ship -- mcp-v0.1.0    # @dong-gri/kineto-mcp
// Only run this after an explicit release request from the owner.
//
// Why wait: a pushed tag is never moved or deleted, so a tag cut on a commit
// whose CI then fails uses up the version number (v0.12.0). If CI fails here,
// no tag exists yet — fix main and run the same command again.
// `--skip-ci-wait` is for when you have already seen CI green for HEAD.
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELEASE_TARGETS, resolveReleaseTarget } from './release-targets.mjs';
import { githubRepo, waitForCi } from './ci-status.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.argv[2];
const skipCiWait = process.argv.slice(3).includes('--skip-ci-wait');
const fail = (message) => {
  console.error(`release-ship: ${message}`);
  process.exit(1);
};
const output = (command, args) => execFileSync(command, args, { cwd: root, encoding: 'utf8' }).trim();
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

const target = resolveReleaseTarget(tag);
if (!target) fail(`pass a tag such as ${RELEASE_TARGETS.map((entry) => entry.tagExample).join(' or ')}`);
if (output('git', ['status', '--porcelain'])) fail('working tree must be clean');
if (output('git', ['branch', '--show-current']) !== 'main') fail('release must be shipped from main');

run(process.execPath, [path.join(root, target.checkScript), tag]);

const localTagProbe = spawnSync(
  'git',
  ['show-ref', '--verify', '--quiet', `refs/tags/${tag}`],
  { cwd: root, encoding: 'utf8' }
);
if (localTagProbe.error) throw localTagProbe.error;
if (localTagProbe.status === 0) fail(`local tag ${tag} already exists`);
if (localTagProbe.status !== 1) {
  fail(`could not inspect local tag ${tag}: ${localTagProbe.stderr?.trim() || `git exited ${localTagProbe.status}`}`);
}

const remoteTag = output('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
if (remoteTag) fail(`remote tag ${tag} already exists`);

console.log(`Shipping ${target.label} ${tag}: push main, wait for CI, create annotated tag, push tag.`);
const sha = output('git', ['rev-parse', 'HEAD']);
// Another agent or machine may have pushed to main since this checkout was
// prepared. Say so plainly instead of letting `git push` fail with a raw
// "rejected (fetch first)" stack trace; nothing is pushed or tagged yet.
run('git', ['fetch', '--quiet', 'origin', 'main']);
const behind = output('git', ['rev-list', '--count', 'HEAD..origin/main']);
if (behind !== '0') {
  fail(`origin/main has ${behind} commit(s) this main does not contain (someone else pushed). Nothing was pushed or tagged. `
    + 'Integrate them first (git pull --rebase origin main, then npm run build and npm run test:node), then run this command again.');
}
run('git', ['push', 'origin', 'main']);

if (skipCiWait) {
  console.log('--skip-ci-wait: not checking CI for this commit.');
} else {
  // Only the parsed owner/repo is used: the remote URL itself may carry credentials.
  const repo = githubRepo(output('git', ['remote', 'get-url', 'origin']));
  if (!repo) fail('origin is not a github.com remote; check CI for HEAD yourself, then re-run with --skip-ci-wait');
  console.log(`Waiting for CI on ${repo.owner}/${repo.repo}@${sha.slice(0, 7)} (the demo site deploys from the same run)…`);
  let verdict;
  try {
    verdict = await waitForCi({ ...repo, sha, log: (line) => console.log(line) });
  } catch (error) {
    fail(`could not read CI status (${error.message}). No tag was created. Check CI for ${sha.slice(0, 7)} and re-run, with --skip-ci-wait if it is green.`);
  }
  if (verdict !== 'success') {
    fail(`CI for ${sha.slice(0, 7)} ended as "${verdict}". No tag was created, so ${tag} is still available: fix main and run this command again.`);
  }
  console.log(`CI passed for ${sha.slice(0, 7)}.`);
}

run('git', ['tag', '-a', tag, '-m', `${target.label} ${tag}`]);
run('git', ['push', 'origin', tag]);
console.log(`${tag} pushed. ${target.workflow} will publish npm and create the bilingual GitHub Release.`);
