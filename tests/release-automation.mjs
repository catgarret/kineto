import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const pkg = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/release.yml');
const ciWorkflow = read('.github/workflows/ci.yml');
const demoWorkflow = read('.github/workflows/pages.yml');
const parityWorkflow = read('.github/workflows/live-site-parity.yml');
const agents = read('AGENTS.md');
const claude = read('CLAUDE.md');
const changelog = read('CHANGELOG.md');
const note = read(`.github/release-notes/v${pkg.version}.md`);
const security = read('SECURITY.md');
const supplyChain = read('docs/supply-chain.md');
const qaLocks = ['package-lock.json', 'tests/consumer-bundles/package-lock.json', 'tests/framework-qa/package-lock.json'];

assert.match(workflow, /tags:\s*\n\s*-\s*"v\[0-9\]\+\.\[0-9\]\+\.\[0-9\]\+"/);
assert.match(workflow, /id-token:\s*write/);
assert.match(workflow, /npm publish --access public --provenance/);
assert.match(workflow, /fetch-retries=3/);
for (const command of ['lint', 'build', 'test:demo', 'test:browser']) {
  assert.match(workflow, new RegExp(`retry-command\\.mjs npm run ${command}`), `release workflow must isolate ${command}`);
  assert.match(read('.github/workflows/ci.yml'), new RegExp(`retry-command\\.mjs npm run ${command}`), `CI workflow must isolate ${command}`);
}
for (const command of [
  'test:utils', 'test:diagnostics', 'test:states', 'test:presence', 'test:contract', 'test:requirements',
  'test:docs', 'test:docs-navigation', 'test:roadmap-readiness', 'test:readiness-gates', 'test:readiness-evidence', 'test:lockfile-boundary', 'test:module-metadata', 'test:module-status', 'test:mobile-device-manifest',
  'test:package', 'test:types', 'test:package-size', 'test:package-tarball',
  'test:consumer-bundles', 'test:framework', 'test:parity', 'test:structure', 'test:copy',
  'test:lazy', 'test:options', 'test:variants', 'test:help', 'test:inline', 'test:defaults',
  'test:variant-options', 'test:variant-distinctness', 'test:easings', 'test:reduced', 'test:update', 'test:audit',
  'test:leak', 'test:perf', 'test:deps', 'test:engine', 'test:sequence-sources',
  'test:regressions', 'test:site', 'test:release', 'test:size'
]) {
  assert.ok(workflow.includes(command), `release workflow must cover ${command}`);
  assert.ok(read('.github/workflows/ci.yml').includes(command), `CI workflow must cover ${command}`);
}
assert.match(workflow, /retry-command\.mjs npm pack --dry-run/);
assert.match(workflow, /retry-command\.mjs npm audit --audit-level=low/);
assert.match(read('.github/workflows/ci.yml'), /retry-command\.mjs npm pack --dry-run/);
assert.match(ciWorkflow, /tests\/browser\/demo-polish\.mjs/);
assert.match(ciWorkflow, /KT_BROWSER:\s*\$\{\{ matrix\.browser \}\}/);
assert.match(ciWorkflow, /matrix\.browser == 'firefox' \|\| matrix\.browser == 'webkit'/);
assert.match(ciWorkflow, /max-parallel:\s*1/);
assert.match(ciWorkflow, /MK_BROWSER_TEST_ATTEMPTS:\s*3/);
assert.match(ciWorkflow, /MK_BROWSER_TEST_TIMEOUT:\s*240000/);
assert.match(ciWorkflow, /Browser QA failed::test:browser/);
assert.match(workflow, /MK_BROWSER_TEST_TIMEOUT:\s*240000/);
assert.match(workflow, /MK_BROWSER_TEST_ATTEMPTS:\s*3/);
assert.match(workflow, /Browser QA failed::test:browser/);
assert.match(ciWorkflow, /timeout-minutes:\s*20/);
assert.match(ciWorkflow, /cross-browser-\$\{\{ matrix\.browser \}\}\.log/);
const demoPolish = read('tests/browser/demo-polish.mjs');
assert.doesNotMatch(demoPolish, /await image\.decode\(\)/, 'WebKit demo QA must not await an unbounded detached image decode');
assert.match(demoPolish, /Demo polish timeout/, 'WebKit demo QA must annotate the last checkpoint before a bounded retry timeout');
assert.match(demoPolish, /minimumHelpFields = browserName === 'chromium' \? 374 : 1/, 'cross-browser demo QA must retain Chromium full help coverage while bounding hosted-engine setup');
assert.match(pkg.scripts['test:framework'], /scripts\/npm-ci-retry\.mjs/);
assert.match(pkg.scripts['test:consumer-bundles'], /scripts\/npm-ci-retry\.mjs/);
assert.match(workflow, /npm run purge/);
assert.match(workflow, /--notes-file\s+"\.github\/release-notes\/\$GITHUB_REF_NAME\.md"/);
assert.match(workflow, /gh release create \"\$GITHUB_REF_NAME\"/);
assert.doesNotMatch(workflow, /softprops\/action-gh-release/);
assert.ok(agents.includes('English first') && agents.includes('Korean translation'));
assert.ok(claude.includes('AGENTS.md') && claude.includes('English first and Korean second'));
assert.match(changelog, /## \[Unreleased\]\s*\n+### English[\s\S]*### 한국어/);
assert.ok(note.indexOf('## English') < note.indexOf('## 한국어'));
assert.match(demoWorkflow, /workflows:\s*\[CI\]/);
assert.match(demoWorkflow, /workflow_run\.head_branch == 'main'/);
assert.match(demoWorkflow, /gh run view \"\$CI_RUN_ID\"/);
assert.match(demoWorkflow, /actions:\s*read/);
assert.match(demoWorkflow, /permissions:[\s\S]*pages:\s*write/);
assert.match(demoWorkflow, /uses:\s*actions\/configure-pages@v6/);
assert.match(demoWorkflow, /uses:\s*actions\/upload-pages-artifact@v4/);
assert.match(demoWorkflow, /uses:\s*actions\/deploy-pages@v4/);
assert.match(demoWorkflow, /path:\s*site/);
assert.match(demoWorkflow, /npm run test:live-site/);
assert.match(pkg.scripts['test:live-site'], /verify-live-site\.mjs/);
assert.match(pkg.scripts['test:live-site:parity'], /verify-live-site\.mjs --include-backup/);
assert.match(pkg.scripts['test:live-site-script'], /tests\/live-site-parity\.mjs/);
assert.match(parityWorkflow, /workflow_dispatch:/);
assert.match(parityWorkflow, /schedule:/);
assert.match(parityWorkflow, /cron:\s*"17 3 \* \* 1"/);
assert.match(parityWorkflow, /permissions:[\s\S]*contents:\s*read/);
assert.match(parityWorkflow, /timeout-minutes:\s*10/);
assert.match(parityWorkflow, /npm run test:live-site:parity/);
assert.doesNotMatch(parityWorkflow, /catgarret\/catgarret\.github\.io|rsync -a|workflow_run/);
assert.match(read('scripts/verify-live-site.mjs'), /KT_LIVE_BACKUP_URL/);
assert.match(read('scripts/verify-live-site.mjs'), /build marker mismatch/);
assert.doesNotMatch(demoWorkflow, /DEMO_SITE_TOKEN|catgarret\/catgarret\.github\.io|rsync -a/);
assert.match(security, /provenance/i);
assert.match(security, /3 business days/);
assert.match(supplyChain, /Socket/);
assert.match(supplyChain, /npm run verify/);
qaLocks.forEach((lock) => assert.doesNotMatch(read(lock), /\.internal\.api\.openai\.org|artifactory\/api\/npm/, `${lock} must not pin a private registry URL`));

execFileSync(process.execPath, [path.join(root, 'scripts/check-release.mjs'), `v${pkg.version}`], {
  cwd: root,
  stdio: 'inherit'
});

console.log('release-automation OK — agent handoff, bilingual notes, tag workflow, npm provenance.');
