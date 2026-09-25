// Release workflow gate: publish a tag only if CI passed on that exact commit
// on main.
//
//   (release.yml) node scripts/require-green-ci.mjs     env: GITHUB_TOKEN, GITHUB_REPOSITORY
//
// Why: CI (ci.yml) already runs lint, every Node test, demo QA and the
// Chromium/WebKit/Firefox browser lanes on each push to main. The release
// workflow used to run all of that AGAIN on the same commit — 25 more minutes,
// and a second chance for a flaky test to fail. v0.12.1 was exactly that: CI
// green, then the identical release re-run failed on a flake and the version
// was burnt. Now the release trusts CI's verdict for the commit and only
// re-checks what it publishes (the built package).
//
// A red CI is not final: re-run the failed CI jobs, then re-run this release
// workflow. Nothing was published, so the tag stays usable.
//
// Security: the token is the job's own short-lived GITHUB_TOKEN (the workflow
// grants it `actions: read` only). It is sent only to api.github.com by
// scripts/ci-status.mjs and never printed.
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { annotation, inGitHubActions } from './gh-actions.mjs';
import { waitForCi } from './ci-status.mjs';

const fail = (message) => {
  console.error(`require-green-ci: ${message}`);
  if (inGitHubActions()) console.error(annotation('error', 'Release needs green CI', message));
  process.exit(1);
};

const [owner, repo, extra] = String(process.env.GITHUB_REPOSITORY || '').split('/');
if (!owner || !repo || extra !== undefined) fail('GITHUB_REPOSITORY must look like owner/repo (this runs inside the release workflow)');
// The commit the checked-out tag points to (an annotated tag is an object of
// its own; `^{commit}` resolves it).
const sha = execFileSync('git', ['rev-parse', 'HEAD^{commit}'], { encoding: 'utf8' }).trim();
const token = process.env.GITHUB_TOKEN || null;

let verdict;
try {
  verdict = await waitForCi({
    owner, repo, sha, token,
    // With the token the limit is 1,000 requests per hour, so poll faster than
    // the anonymous release:ship does.
    intervalMs: 30000, timeoutMs: 45 * 60 * 1000, missingGraceMs: 5 * 60 * 1000,
    log: (line) => console.log(line)
  });
} catch (error) {
  fail(`could not read CI for ${sha.slice(0, 7)}: ${error.message}`);
}

const next = 'Re-run the failed CI jobs for this commit, then re-run this release workflow (nothing was published).';
if (verdict === 'success') console.log(`CI passed for ${sha.slice(0, 7)} on main — releasing it.`);
else if (verdict === 'missing') fail(`no CI run on main for ${sha.slice(0, 7)}. A release tag must point at a commit pushed to main (npm run release:ship does this).`);
else if (verdict === 'timeout') fail(`CI for ${sha.slice(0, 7)} did not finish within 45 minutes. ${next}`);
else fail(`CI for ${sha.slice(0, 7)} did not pass (${verdict}). ${next}`);
