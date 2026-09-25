// Turns a failing test process into a GitHub Actions annotation.
//
// Why: GitHub shows a workflow's *annotations* to anyone through the public API
// (`/repos/<owner>/<repo>/check-runs/<job id>/annotations`), but the job *logs*
// need a signed-in account. When CI failed, all an agent without credentials
// could see was "Run browser QA failed" — not which test, not why. v0.12.0 and
// the first v0.12.1 push both stalled on exactly that.
//
// How: CI loads this file into every Node process of a test step with
//   NODE_OPTIONS: --import <workspace>/tests/ci-annotate.mjs
// It does nothing outside GitHub Actions. Inside, it keeps the last lines the
// process printed and, if the process dies from an uncaught error or exits with
// a non-zero code, prints ONE `::error` line naming the script and the reason.
//
// Safety: the text is our own test output. Newlines, `%`, and (in the title)
// `:` and `,` are escaped as the workflow-command format requires, so a message
// can never start a second workflow command. Nothing from the environment is
// printed.
import path from 'node:path';
import process from 'node:process';
import { escapeData, escapeProperty, inGitHubActions } from '../scripts/gh-actions.mjs';

const entry = process.argv[1] || '';
// npm/npx only relay a child's exit code; the child reports for itself.
const isPackageManager = /(?:^|[\\/])(?:npm|npx)(?:-cli)?(?:\.js)?$/.test(entry);
// Our retry/lane wrappers print their own, more precise annotation (attempt
// counts, timeouts, the list of failing tests), so a generic "exited with
// code 1" from them would only be noise.
const WRAPPERS = new Set(['scripts/run-lane.mjs', 'scripts/retry-command.mjs', 'tests/retry-browser-test.mjs']);
const isWrapper = WRAPPERS.has(path.relative(process.cwd(), entry).split(path.sep).join('/'));

if (inGitHubActions() && !isPackageManager && !isWrapper) {
  const script = path.relative(process.cwd(), entry) || 'node';
  const MAX_LINES = 24;
  const MAX_CHARS = 3000;
  const recent = [];
  let reported = false;

  // Keep a short tail of what the test printed; the assertion message and the
  // lines just before it are what explain a failure.
  const remember = (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (!line.trim() || line.startsWith('::')) continue;
      recent.push(line);
      if (recent.length > MAX_LINES) recent.shift();
    }
  };
  for (const stream of [process.stdout, process.stderr]) {
    const write = stream.write.bind(stream);
    stream.write = (chunk, ...rest) => {
      try { remember(chunk); } catch { /* never break the test's own output */ }
      return write(chunk, ...rest);
    };
  }

  const report = (reason) => {
    if (reported) return;
    reported = true;
    const body = `${reason}\n--- last output ---\n${recent.join('\n')}`.slice(0, MAX_CHARS);
    process.stderr.write(`::error title=${escapeProperty(script)}::${escapeData(body)}\n`);
  };

  process.on('uncaughtExceptionMonitor', (error) => {
    report(String(error?.stack || error).split('\n').slice(0, 6).join('\n'));
  });
  process.on('exit', (code) => {
    if (code) report(`exited with code ${code}`);
  });
}
