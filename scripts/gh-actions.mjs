// Small helpers for talking to GitHub Actions from our own scripts.
//
// Nothing here has side effects on import: it only builds strings and, when
// asked, writes one line. The test helpers (tests/ci-annotate.mjs,
// tests/retry-browser-test.mjs, scripts/retry-command.mjs, scripts/run-lane.mjs)
// share it so annotations are escaped the same way everywhere.
//
// Why annotations matter: GitHub shows a job's annotations to anyone through the
// public API, but its logs only to signed-in users. An annotation is how an
// agent without credentials learns WHICH test failed or flaked, and why.
import fs from 'node:fs';

/** True inside a GitHub Actions job. */
export const inGitHubActions = (env = process.env) => env.GITHUB_ACTIONS === 'true';

// Some tools exit non-zero by design and the caller judges the result itself:
// attw exits 1 for every finding, including the ones scripts/check-package-lint.mjs
// allows. tests/ci-annotate.mjs would otherwise publish that as a red
// "exited with code 1" annotation on a green job, and an agent reading the
// public annotations could not tell it from a real failure (every CI run from
// v0.13.0 on carried one). The caller passes `expectedExitEnv()` as the child's
// environment; the child — and anything it starts — stays silent.
const ANNOTATE_SWITCH = 'KT_CI_ANNOTATE';

/** An environment for a child process whose exit code the caller checks itself. */
export const expectedExitEnv = (env = process.env) => ({ ...env, [ANNOTATE_SWITCH]: 'off' });

/** True when the failure annotation hook should run in this process. */
export const failureAnnotationsEnabled = (env = process.env) => inGitHubActions(env) && env[ANNOTATE_SWITCH] !== 'off';

// Workflow-command escaping, as in the GitHub Actions toolkit (`escapeData`,
// `escapeProperty`). Without it a newline in a message could start a second,
// attacker-shaped workflow command.
export const escapeData = (text) => String(text).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
export const escapeProperty = (text) => escapeData(text).replace(/:/g, '%3A').replace(/,/g, '%2C');

/** One `::error` / `::warning` / `::notice` line (without the trailing newline). */
export function annotation(level, title, message) {
  if (!['error', 'warning', 'notice'].includes(level)) throw new Error(`unknown annotation level: ${level}`);
  return `::${level} title=${escapeProperty(title)}::${escapeData(message)}`;
}

/**
 * A test failed, then passed on a later attempt: it is flaky. Say so loudly
 * instead of silently passing — a retry that hides a flake today is tomorrow's
 * red release.
 *   • always: one console line;
 *   • in GitHub Actions: a public `::warning` annotation;
 *   • when run by scripts/run-lane.mjs: one line in KT_LANE_FLAKE_FILE, so the
 *     lane summary can list every flaky test.
 */
export function reportFlaky({ label, attempt, attempts, env = process.env, write = (line) => process.stderr.write(line) }) {
  const message = `${label} failed, then passed on attempt ${attempt}/${attempts}. Treat it as a bug in the test or the code, not as noise.`;
  write(`Flaky: ${message}\n`);
  if (inGitHubActions(env)) write(`${annotation('warning', `Flaky test ${label}`, message)}\n`);
  if (env.KT_LANE_FLAKE_FILE) {
    try { fs.appendFileSync(env.KT_LANE_FLAKE_FILE, `${label}\t${attempt}/${attempts}\n`); } catch { /* the summary is best-effort */ }
  }
}
