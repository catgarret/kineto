// Did CI finish green for one commit on main?
//
// `release:ship` asks this BEFORE it creates a release tag. A tag is permanent
// (docs/RELEASING.md: never move or delete a pushed tag), so a tag cut on a
// commit whose CI later fails uses up that version number for nothing — that
// is what happened to v0.12.0. Waiting here costs a few minutes; a burnt tag
// costs a version.
//
// Security notes (this is the only place release tooling talks to a network):
//   • Read-only GET to one fixed host (api.github.com). No token is read or
//     sent: the repository is public and the anonymous API is enough.
//   • The owner/repo come from `git remote get-url origin`, which can contain
//     credentials (https://user:token@github.com/...). Only the validated
//     owner/repo pair is used or printed — never the URL itself.
//   • Every value put into the request URL is validated and encoded.

export const CI_WORKFLOW_FILE = 'ci.yml';
const API_ORIGIN = 'https://api.github.com';
const NAME = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,99})$/;
const SHA = /^[0-9a-f]{40}$/;

/**
 * `origin` URL → `{ owner, repo }` for a github.com remote, otherwise null.
 * Accepts https (with or without embedded credentials) and ssh forms.
 */
export function githubRepo(remoteUrl) {
  const match = String(remoteUrl ?? '').trim()
    .match(/github\.com[:/]+([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i);
  if (!match) return null;
  const [, owner, repo] = match;
  return NAME.test(owner) && NAME.test(repo) ? { owner, repo } : null;
}

/**
 * The API's `workflow_runs` for a commit → one verdict:
 *   'success' | 'failure' | 'pending' | 'missing'
 * Only push runs on `main` for exactly this commit count; of those the newest
 * run decides (a later push of the same commit supersedes an older run).
 */
export function ciVerdict(runs, sha) {
  const relevant = (Array.isArray(runs) ? runs : []).filter((run) => run
    && run.head_sha === sha && run.event === 'push' && run.head_branch === 'main');
  if (!relevant.length) return 'missing';
  const newest = relevant.reduce((a, b) => (Number(b.id) > Number(a.id) ? b : a));
  if (newest.status !== 'completed') return 'pending';
  return newest.conclusion === 'success' ? 'success' : 'failure';
}

/** One read of the CI runs for `sha`. Returns the verdict, or throws with a readable reason. */
export async function readCiVerdict({ owner, repo, sha, fetchImpl = globalThis.fetch }) {
  if (!NAME.test(owner) || !NAME.test(repo)) throw new Error('invalid GitHub owner/repository name');
  if (!SHA.test(sha)) throw new Error('invalid commit SHA');
  const url = new URL(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
    + `/actions/workflows/${CI_WORKFLOW_FILE}/runs`, API_ORIGIN);
  url.searchParams.set('head_sha', sha);
  url.searchParams.set('per_page', '20');
  const response = await fetchImpl(url, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'kineto-release-ship' },
    redirect: 'error',
    signal: AbortSignal.timeout(15000)
  });
  if (response.status === 403 || response.status === 429) {
    throw new Error(`GitHub API rate limit (HTTP ${response.status}); wait a few minutes and run the command again`);
  }
  if (!response.ok) throw new Error(`GitHub API answered HTTP ${response.status}`);
  const body = await response.json();
  return ciVerdict(body?.workflow_runs, sha);
}

/**
 * Polls until CI for `sha` is no longer pending (or `timeoutMs` passes).
 * 'missing' is treated as pending for a short grace period: a run appears a few
 * seconds after the push.
 */
export async function waitForCi({
  owner, repo, sha, fetchImpl, log = () => {},
  // CI here is a Node job and then the Firefox/WebKit jobs: ~25 minutes when
  // green, longer when a lane retries. Give it room before giving up, and poll
  // every 90s so 75 minutes stay under the anonymous API limit (60 per hour).
  intervalMs = 90000, timeoutMs = 75 * 60 * 1000, missingGraceMs = 3 * 60 * 1000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), now = () => Date.now()
}) {
  const started = now();
  for (;;) {
    const verdict = await readCiVerdict({ owner, repo, sha, fetchImpl });
    const waited = now() - started;
    if (verdict === 'success' || verdict === 'failure') return verdict;
    if (verdict === 'missing' && waited > missingGraceMs) return 'missing';
    if (waited > timeoutMs) return 'timeout';
    log(`CI for ${sha.slice(0, 7)} is ${verdict === 'missing' ? 'not started yet' : 'running'} — checking again in ${Math.round(intervalMs / 1000)}s`);
    await sleep(intervalMs);
  }
}
