import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertPinnedAction } from './workflow-action-pins.mjs';
import { ciVerdict, githubRepo, readCiVerdict, waitForCi } from '../scripts/ci-status.mjs';

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
const purgeScript = read('scripts/purge-cdn.mjs');
const prepareReleaseScript = read('scripts/prepare-release.mjs');
const shipReleaseScript = read('scripts/ship-release.mjs');
const qaLocks = ['package-lock.json', 'tests/consumer-bundles/package-lock.json', 'tests/framework-qa/package-lock.json'];
const consumerLock = JSON.parse(read(qaLocks[1]));
const frameworkLock = JSON.parse(read(qaLocks[2]));
const workflowFiles = fs.readdirSync(path.join(root, '.github/workflows')).filter((file) => /\.ya?ml$/.test(file));

function mappingBlock(source, key, indent = 2) {
  const lines = source.split('\n');
  const prefix = `${' '.repeat(indent)}${key}:`;
  const start = lines.findIndex((line) => line === prefix || line.startsWith(`${prefix} `));
  assert.notEqual(start, -1, `missing YAML block ${key}`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const leading = line.length - line.trimStart().length;
    if (leading <= indent) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

function stepBlock(job, name) {
  const lines = job.split('\n');
  const marker = `- name: ${name}`;
  const start = lines.findIndex((line) => line.trim() === marker);
  assert.notEqual(start, -1, `missing workflow step ${name}`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('      - name: ')) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

const verifyJob = mappingBlock(workflow, 'verify');
const releaseCrossBrowserJob = mappingBlock(workflow, 'cross-browser');
const publishJob = mappingBlock(workflow, 'publish');
const ciNodeCompatibilityJob = mappingBlock(ciWorkflow, 'node-compatibility');
const ciTestJob = mappingBlock(ciWorkflow, 'test');
const ciCrossBrowserJob = mappingBlock(ciWorkflow, 'cross-browser');
const verifiedPackageUpload = stepBlock(verifyJob, 'Upload the verified package');
const verifiedPackageDownload = stepBlock(publishJob, 'Download the verified package');
const artifactVerification = stepBlock(publishJob, 'Verify artifact digest');
const npmPublish = stepBlock(publishJob, 'Publish package with provenance');
const githubRelease = stepBlock(publishJob, 'Create GitHub Release');

for (const file of workflowFiles) {
  const source = read(`.github/workflows/${file}`);
  for (const [, action] of source.matchAll(/uses:\s*([^\s#]+)/g)) {
    if (action.startsWith('./')) continue;
    assert.match(action, /@[0-9a-f]{40}$/, `${file} must pin ${action} to an immutable full commit SHA`);
  }
}

const fixtureAction = 'actions/upload-pages-artifact';
const fixtureSha = 'a'.repeat(40);
for (const comment of ['', ' # v4', ' # v5.0.0', ' # reviewed upstream release']) {
  assert.doesNotThrow(() => assertPinnedAction(
    `steps:\n  - uses: ${fixtureAction}@${fixtureSha}${comment}\n`, fixtureAction
  ), 'changing or omitting an informational version comment must preserve a valid SHA pin');
}
for (const quote of ['\'', '"']) {
  assert.doesNotThrow(() => assertPinnedAction(
    `uses: ${quote}${fixtureAction}@${fixtureSha}${quote} # v5\n`, fixtureAction
  ), 'quoted YAML uses values retain the same pin');
}
for (const revision of ['v5', 'main', 'a'.repeat(39), 'a'.repeat(41), `${fixtureSha}-extra`, `${fixtureSha}#v5`, '${{ inputs.action_ref }}', '']) {
  assert.throws(() => assertPinnedAction(
    `uses: ${fixtureAction}@${revision} # v5\n`, fixtureAction
  ), /immutable full commit SHA/, `reject non-immutable or malformed revision ${revision}`);
}
assert.throws(() => assertPinnedAction(
  `# uses: ${fixtureAction}@${fixtureSha}\n`, fixtureAction
), /missing workflow action/, 'a commented-out uses line cannot satisfy a required action');
assert.throws(() => assertPinnedAction(
  `uses: ${fixtureAction}-extra@${fixtureSha}\n`, fixtureAction
), /missing workflow action/, 'an action with a matching name prefix is not the required action');
assert.throws(() => assertPinnedAction(
  `- uses: ${fixtureAction}@${fixtureSha}\n- uses: ${fixtureAction}@main\n`, fixtureAction
), /immutable full commit SHA/, 'every use of the required action must be pinned');

assert.match(workflow, /tags:\s*\n\s*-\s*"v\[0-9\]\+\.\[0-9\]\+\.\[0-9\]\+"/);
assert.match(prepareReleaseScript, /const roadmapPath = path\.join\(root, 'docs', 'ROADMAP\.md'\)/,
  'release preparation must target the roadmap explicitly');
assert.match(prepareReleaseScript, /roadmap\.replace\(roadmapBaseline, `\$1v\$\{next\}`\)/,
  'release preparation must synchronize only the roadmap baseline version');
assert.doesNotMatch(prepareReleaseScript, /versionFiles = \[[\s\S]*?'docs\/ROADMAP\.md'[\s\S]*?\];/,
  'release preparation must not rewrite historical roadmap version references');
for (const document of ['QA_REPORT', 'AI-HANDOFF']) {
  assert.doesNotMatch(prepareReleaseScript,
    new RegExp(`versionFiles = \\[[\\s\\S]*?'docs/${document}\\.md'[\\s\\S]*?\\];`),
    `release preparation must not rewrite historical ${document} evidence globally`);
}
assert.match(prepareReleaseScript, /updateReleaseDocumentVersion\(relative, source, current, next\)/,
  'release preparation must selectively update source labels in publication evidence documents');
execFileSync(process.execPath, [path.join(root, 'tests/release-document-versions.mjs')], { stdio: 'inherit' });
assert.match(prepareReleaseScript, /generate-module-metadata\.mjs/,
  'release preparation must regenerate versioned module metadata');
assert.match(shipReleaseScript, /spawnSync\([\s\S]*?'show-ref', '--verify', '--quiet'/,
  'release shipping must probe a missing local tag without emitting an expected git fatal');
assert.doesNotMatch(shipReleaseScript, /rev-parse[\s\S]*refs\/tags/,
  'release shipping must not use a noisy failing rev-parse as its missing-tag branch');
assert.equal(consumerLock.packages['../..'].version, pkg.version,
  'consumer fixture linked-root metadata must track the release version');
assert.equal(frameworkLock.packages['../..'].version, pkg.version,
  'framework fixture linked-root metadata must track the release version');
assert.match(workflow, /^permissions:\s*\n\s{2}contents:\s*read$/m);
assert.equal((workflow.match(/^\s+contents:\s*write$/gm) || []).length, 1, 'only publish may write repository contents');
assert.equal((workflow.match(/^\s+id-token:\s*write$/gm) || []).length, 1, 'only publish may request OIDC');
assert.doesNotMatch(verifyJob, /contents:\s*write|id-token:\s*write/);
assert.doesNotMatch(releaseCrossBrowserJob, /contents:\s*write|id-token:\s*write/);
assert.match(publishJob, /permissions:\s*\n\s+contents:\s*write\s*\n\s+id-token:\s*write/);
assert.match(publishJob, /needs:\s*\[verify, cross-browser\]/);
assert.doesNotMatch(publishJob, /if:\s*always\(\)/, 'publish must retain the default all-needs-succeeded gate');
assert.match(releaseCrossBrowserJob, /matrix:\s*\n\s*browser:\s*\[firefox, webkit\]/);
assert.match(ciCrossBrowserJob, /tests\/browser\/css-scroll\.mjs/,
  'CI cross-browser lanes must exercise cssScroll native/fallback progress');
assert.match(releaseCrossBrowserJob, /tests\/browser\/css-scroll\.mjs/,
  'release cross-browser lanes must exercise cssScroll native/fallback progress');
assert.match(ciCrossBrowserJob, /tests\/browser\/cursor-click-media\.mjs/,
  'CI cross-browser lanes must exercise one-shot animated cursor media');
assert.match(releaseCrossBrowserJob, /tests\/browser\/cursor-click-media\.mjs/,
  'release cross-browser lanes must exercise one-shot animated cursor media');
assert.match(verifiedPackageUpload, /^\s+name:\s*verified-package-\$\{\{ github\.ref_name \}\}$/m);
assert.match(verifiedPackageUpload, /overwrite:\s*true/, 'a full workflow rerun must safely replace its prior verified artifact');
assert.match(verifiedPackageDownload, /^\s+name:\s*verified-package-\$\{\{ github\.ref_name \}\}$/m);
assertPinnedAction(verifiedPackageDownload, 'actions/download-artifact');
assert.match(verifyJob, /mapfile -d '' -t tarballs/);
assert.match(verifyJob, /Expected exactly one package tarball/);
assert.match(verifyJob, /sha256sum -- "\$tarball" > "\$tarball\.sha256"/);
assert.match(artifactVerification, /id:\s*verified_artifact/);
assert.match(artifactVerification, /mapfile -d '' -t artifacts/);
assert.match(artifactVerification, /mapfile -d '' -t tarballs/);
assert.match(artifactVerification, /mapfile -d '' -t checksums/);
assert.match(artifactVerification, /"\$checksum" != "\$tarball\.sha256"/);
assert.match(artifactVerification, /sha256sum --check --strict --/);
assert.match(artifactVerification, /tarball=\.\/%s/,
  'the verified tarball output must remain an explicit local path so npm does not parse it as a Git spec');
assert.equal((publishJob.match(/\$\{\{ steps\.verified_artifact\.outputs\.tarball \}\}/g) || []).length, 2,
  'npm and GitHub must consume the same digest-verified tarball output');
assert.match(npmPublish, /npm publish "\$RELEASE_TARBALL" --access public --provenance/);
assert.match(githubRelease, /"\$RELEASE_TARBALL"/);
assert.doesNotMatch(publishJob, /release-artifact\/\*\.tgz|-print -quit/,
  'publish steps must not rediscover or wildcard a different tarball after digest verification');
assert.match(workflow, /fetch-retries=3/);
assert.match(ciNodeCompatibilityJob, /node:\s*\["20\.19\.0", "22\.12\.0"\]/);
assert.match(ciNodeCompatibilityJob, /Node \$\{\{ matrix\.node \}\} · public engine contract/);
assert.match(ciNodeCompatibilityJob, /node-version:\s*\$\{\{ matrix\.node \}\}/);
assert.match(ciNodeCompatibilityJob, /npm ci --ignore-scripts/);
for (const command of ['build', 'test:package', 'test:types', 'test:package-tarball']) {
  assert.ok(ciNodeCompatibilityJob.includes(command), `public engine job must run ${command}`);
}
assert.doesNotMatch(ciTestJob, /matrix\.browser/, 'the non-matrix Chromium job must not reference matrix.browser');
assert.match(ciCrossBrowserJob, /MK_BROWSER_TEST_ATTEMPTS:\s*\$\{\{ matrix\.browser == 'webkit' && 4 \|\| 3 \}\}/,
  'only the actual WebKit matrix lane receives the fourth bounded attempt');
assert.match(releaseCrossBrowserJob, /MK_BROWSER_TEST_ATTEMPTS:\s*\$\{\{ matrix\.browser == 'webkit' && 4 \|\| 3 \}\}/,
  'the release WebKit lane must retain the same bounded retry policy');
for (const command of ['lint', 'build', 'test:demo', 'test:browser']) {
  assert.match(workflow, new RegExp(`retry-command\\.mjs npm run ${command}`), `release workflow must isolate ${command}`);
  assert.match(read('.github/workflows/ci.yml'), new RegExp(`retry-command\\.mjs npm run ${command}`), `CI workflow must isolate ${command}`);
}
// Derive this manifest from the local suite instead of maintaining a second
// hand-written list that can silently omit a newly added regression gate.
for (const step of pkg.scripts['test:node'].split(' && ')) {
  assert.match(step, /^npm run test:[\w-]+$/, `unsupported Node test step: ${step}`);
  const command = step.slice('npm run '.length);
  const token = new RegExp(`(?:^|\\s)${command}(?=\\s|;|$)`, 'm');
  assert.match(workflow, token, `release workflow must cover ${command}`);
  assert.match(ciWorkflow, token, `CI workflow must cover ${command}`);
}
assert.match(workflow, /retry-command\.mjs npm pack --dry-run/);
function hasCrossBrowserCommand(source, file) {
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[ \\t]*node tests/retry-browser-test\\.mjs ${escaped} 2>&1(?:[ \\t]+\\|[ \\t]+tee -a [\\w.\\-/]*(?:\\$\\{\\{ matrix\\.browser \\}\\})?[\\w.\\-/]+)?[ \\t]*$`, 'm').test(source);
}
const crossBrowserFixture = 'tests/example.mjs';
assert.equal(hasCrossBrowserCommand('  node tests/retry-browser-test.mjs tests/example.mjs 2>&1 | tee -a ci.log', crossBrowserFixture), true);
assert.equal(hasCrossBrowserCommand('  node tests/retry-browser-test.mjs tests/example.mjs 2>&1', crossBrowserFixture), true);
for (const invalid of [
  '# node tests/retry-browser-test.mjs tests/example.mjs 2>&1',
  'echo "node tests/retry-browser-test.mjs tests/example.mjs 2>&1"',
  'node tests/retry-browser-test.mjs tests/exampleXmjs 2>&1',
  'node tests/retry-browser-test.mjs tests/example.mjs 2>&1 || true',
  'node tests/retry-browser-test.mjs tests/example.mjs 2>&1 | tee -a ci.log || true',
  'node tests/retry-browser-test.mjs tests/example.mjs 2>&1 | tee -a ci.log; exit 0'
]) assert.equal(hasCrossBrowserCommand(invalid, crossBrowserFixture), false);
for (const step of pkg.scripts['test:browser:cross'].split(' && ')) {
  assert.match(step, /^node tests\/[\w/-]+\.mjs$/, `unsupported cross-browser test step: ${step}`);
  const testFile = step.slice('node '.length);
  for (const [lane, source] of [['CI', ciCrossBrowserJob], ['release', releaseCrossBrowserJob]]) {
    assert.ok(hasCrossBrowserCommand(source, testFile),
      `${lane} cross-browser workflow must cover ${testFile}`);
  }
}
assert.match(workflow, /retry-command\.mjs npm run audit:lockfiles -- --output-dir release-audit/);
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
for (const publishedAlias of ['kineto.min.js', 'kineto.umd.cjs', 'kineto.umd.min.js', 'kineto.min.css']) {
  assert.ok(purgeScript.includes(`'${publishedAlias}'`), `CDN purge must include published alias ${publishedAlias}`);
}
assert.doesNotMatch(purgeScript, /'kineto\.js'|'kineto\.css'/, 'CDN purge must not claim unpublished development files');
assert.match(purgeScript, /throw new Error\(`jsDelivr purge failed for:/, 'partial CDN purge failures must fail the release');
assert.match(purgeScript, /process\.exitCode = 1/, 'the purge CLI must return a nonzero exit code after partial failure');
assert.match(purgeScript, /requestTimeout = 10000/, 'each CDN request must have a finite timeout');
assert.match(purgeScript, /attempts, 'attempts', \{ min: 1, max: 5 \}/, 'retry attempts must have a hard upper bound');
assert.match(workflow, /--notes-file\s+"\.github\/release-notes\/\$GITHUB_REF_NAME\.md"/);
assert.match(githubRelease, /gh release view "\$GITHUB_REF_NAME"/);
assert.match(githubRelease, /GitHub Release \$GITHUB_REF_NAME already exists; leaving the immutable release unchanged/);
assert.match(githubRelease, /gh release create "\$GITHUB_REF_NAME"/);
assert.doesNotMatch(githubRelease, /gh release (edit|upload|delete)/, 'reruns must not mutate an existing GitHub Release');
assert.match(npmPublish, /npm view "\$\{PACKAGE_NAME\}@\$\{PACKAGE_VERSION\}" dist\.integrity/);
assert.match(npmPublish, /"\$PUBLISHED_INTEGRITY" != "\$TARBALL_INTEGRITY"/,
  'a rerun must refuse an existing npm version whose bytes differ from the verified tarball');
assert.match(npmPublish, /is already published; skipping npm publish/);
assert.doesNotMatch(workflow, /softprops\/action-gh-release/);
assert.ok(agents.includes('English first') && agents.includes('Korean translation'));
assert.ok(claude.includes('AGENTS.md') && claude.includes('English first and Korean second'));
assert.match(changelog, /## \[Unreleased\]\s*\n+### English[\s\S]*### 한국어/);
assert.ok(note.indexOf('## English') < note.indexOf('## 한국어'));
assert.match(demoWorkflow, /workflows:\s*\[CI\]/);
assert.match(demoWorkflow, /workflow_run\.event == 'push'/);
assert.match(demoWorkflow, /workflow_run\.head_repository\.full_name == github\.repository/);
assert.match(demoWorkflow, /workflow_run\.head_branch == 'main'/);
assert.match(demoWorkflow, /workflow_run\.conclusion == 'success'/);
// Skipped workflow_run deploys (Dependabot/PR branches) must not share the
// concurrency group with a real main deploy, or they cancel it.
assert.match(demoWorkflow, /concurrency:\s*\n\s*group: demo-site-\$\{\{ \(github\.event_name == 'workflow_dispatch' \|\| \(github\.event\.workflow_run\.event == 'push' && github\.event\.workflow_run\.head_branch == 'main'\)\) && 'main' \|\| github\.run_id \}\}/,
  'only main deploys may share the demo-site concurrency group');
assert.doesNotMatch(demoWorkflow, /group: demo-site\s*$/m, 'a static demo-site group lets skipped runs cancel a real deploy');
assert.doesNotMatch(demoWorkflow, /gh run view|CI_RUN_ID|actions:\s*read/);
assert.match(demoWorkflow, /permissions:[\s\S]*pages:\s*write/);
assertPinnedAction(demoWorkflow, 'actions/configure-pages');
assertPinnedAction(demoWorkflow, 'actions/upload-pages-artifact');
assertPinnedAction(demoWorkflow, 'actions/deploy-pages');
assert.match(demoWorkflow, /path:\s*site/);
assert.match(demoWorkflow, /KT_EXPECTED_BUILD:\s*\$\{\{ github\.event\.workflow_run\.head_sha \|\| github\.sha \}\}/);
assert.match(demoWorkflow, /KT_LIVE_ATTEMPTS:\s*24/, 'Pages verification must tolerate bounded custom-domain propagation');
assert.match(demoWorkflow, /npm run test:live-site/);
assert.match(pkg.scripts['test:live-site'], /verify-live-site\.mjs/);
assert.match(pkg.scripts['test:live-site:parity'], /verify-live-site\.mjs --include-backup/);
assert.match(pkg.scripts['test:live-site-script'], /tests\/live-site-parity\.mjs/);
assert.match(parityWorkflow, /workflow_dispatch:/);
assert.match(parityWorkflow, /schedule:/);
assert.match(parityWorkflow, /cron:\s*"17 3 \* \* 1"/);
assert.match(parityWorkflow, /permissions:[\s\S]*contents:\s*read/);
assert.match(parityWorkflow, /timeout-minutes:\s*10/);
assert.match(parityWorkflow, /KT_EXPECTED_BUILD:\s*\$\{\{ github\.sha \}\}/);
assert.match(parityWorkflow, /npm run test:live-site:parity/);
assert.doesNotMatch(parityWorkflow, /catgarret\/catgarret\.github\.io|rsync -a|workflow_run/);
assert.match(read('scripts/verify-live-site.mjs'), /KT_LIVE_BACKUP_URL/);
assert.match(read('scripts/verify-live-site.mjs'), /build marker mismatch/);
assert.match(read('scripts/verify-live-site.mjs'), /KT_LIVE_REQUEST_TIMEOUT_MS/);
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
execFileSync(process.execPath, [path.join(root, 'tests/cdn-purge.mjs')], {
  cwd: root,
  stdio: 'inherit'
});

// ----------------------------------------------------------- MCP package release
// packages/kineto-mcp ships from `mcp-vX.Y.Z` tags through release-mcp.yml
// with the same shape as the root release: verify → single verified tarball →
// least-privilege publish with provenance → immutable GitHub Release.
const { RELEASE_TARGETS, resolveReleaseTarget } = await import('../scripts/release-targets.mjs');
const mcpPkg = JSON.parse(read('packages/kineto-mcp/package.json'));
const mcpWorkflow = read('.github/workflows/release-mcp.yml');
const mcpVerifyJob = mappingBlock(mcpWorkflow, 'verify');
const mcpPublishJob = mappingBlock(mcpWorkflow, 'publish');
const mcpNpmPublish = stepBlock(mcpPublishJob, 'Publish package with provenance');
const mcpGithubRelease = stepBlock(mcpPublishJob, 'Create GitHub Release');
const mcpArtifactVerification = stepBlock(mcpPublishJob, 'Verify artifact digest');

assert.deepEqual(RELEASE_TARGETS.map((target) => [target.id, target.packageDir, target.workflow]), [
  ['kineto', '.', '.github/workflows/release.yml'],
  ['kineto-mcp', 'packages/kineto-mcp', '.github/workflows/release-mcp.yml']
]);
assert.equal(resolveReleaseTarget(`v${pkg.version}`).id, 'kineto');
assert.equal(resolveReleaseTarget(`mcp-v${mcpPkg.version}`).id, 'kineto-mcp');
assert.equal(resolveReleaseTarget(`mcp-v${mcpPkg.version}`).version, mcpPkg.version);
for (const invalid of ['mcp-0.1.0', 'v0.1', 'mcp-v0.1.0-beta', 'kineto-mcp-v0.1.0', '']) {
  assert.equal(resolveReleaseTarget(invalid), null, `${invalid} must not resolve to a release target`);
}
assert.match(shipReleaseScript, /resolveReleaseTarget\(tag\)/, 'shipping must route the tag through the release-target table');
assert.match(shipReleaseScript, /target\.checkScript/, 'shipping must run the target-specific validation before pushing');
assert.doesNotMatch(shipReleaseScript, /check-release\.mjs'\), tag\]/, 'the root check must not be hard-wired for every tag');
assert.equal(pkg.scripts['release:check:mcp'], 'node scripts/check-mcp-release.mjs');
for (const target of RELEASE_TARGETS) assert.ok(fs.existsSync(path.join(root, target.checkScript)) && fs.existsSync(path.join(root, target.workflow)), `${target.id} check script and workflow must exist`);

assert.match(mcpWorkflow, /tags:\s*\n\s*- "mcp-v\[0-9\]\+\.\[0-9\]\+\.\[0-9\]\+"/);
assert.match(mcpWorkflow, /concurrency:\s*\n\s*group: release-mcp-\$\{\{ github\.ref \}\}\s*\n\s*cancel-in-progress: false/);
assert.match(mcpWorkflow, /^permissions:\s*\n\s{2}contents:\s*read$/m);
assert.equal((mcpWorkflow.match(/^\s+contents:\s*write$/gm) || []).length, 1, 'only the MCP publish job may write repository contents');
assert.equal((mcpWorkflow.match(/^\s+id-token:\s*write$/gm) || []).length, 1, 'only the MCP publish job may request OIDC');
assert.doesNotMatch(mcpVerifyJob, /contents:\s*write|id-token:\s*write/);
assert.match(mcpPublishJob, /needs:\s*\[verify\]/);
assert.doesNotMatch(mcpPublishJob, /if:\s*always\(\)/);
assert.match(mcpVerifyJob, /npm run release:check:mcp -- "\$GITHUB_REF_NAME"/);
for (const command of ['integrations:check', 'test:contract', 'tests/integrations-contract.mjs', 'test:mcp', 'audit:lockfiles', 'npm run lint']) {
  assert.ok(mcpVerifyJob.includes(command), `MCP verify must run ${command}`);
}
assert.match(mcpVerifyJob, /cd packages\/kineto-mcp && npm pack --pack-destination \.\.\/\.\.\/release-artifact/);
assert.match(mcpVerifyJob, /Expected exactly one package tarball/);
assert.match(mcpVerifyJob, /sha256sum -- "\$tarball" > "\$tarball\.sha256"/);
assert.match(stepBlock(mcpVerifyJob, 'Upload the verified package'), /name:\s*verified-mcp-package-\$\{\{ github\.ref_name \}\}/);
assert.match(stepBlock(mcpPublishJob, 'Download the verified package'), /name:\s*verified-mcp-package-\$\{\{ github\.ref_name \}\}/);
assertPinnedAction(mcpPublishJob, 'actions/download-artifact');
assert.match(mcpArtifactVerification, /sha256sum --check --strict --/);
assert.match(mcpArtifactVerification, /tarball=\.\/%s/);
assert.match(mcpNpmPublish, /require\('\.\/packages\/kineto-mcp\/package\.json'\)\.name/, 'the publish step must read the MCP package, not the root package');
assert.match(mcpNpmPublish, /npm view "\$\{PACKAGE_NAME\}@\$\{PACKAGE_VERSION\}" dist\.integrity/);
assert.match(mcpNpmPublish, /"\$PUBLISHED_INTEGRITY" != "\$TARBALL_INTEGRITY"/);
assert.match(mcpNpmPublish, /npm publish "\$RELEASE_TARBALL" --access public --provenance/);
assert.equal((mcpPublishJob.match(/\$\{\{ steps\.verified_artifact\.outputs\.tarball \}\}/g) || []).length, 2);
assert.match(mcpGithubRelease, /gh release view "\$GITHUB_REF_NAME"/);
assert.match(mcpGithubRelease, /gh release create "\$GITHUB_REF_NAME"/);
assert.match(mcpGithubRelease, /--title "Kineto MCP \$GITHUB_REF_NAME"/);
assert.match(mcpGithubRelease, /--notes-file "\.github\/release-notes\/\$GITHUB_REF_NAME\.md"/);
assert.doesNotMatch(mcpGithubRelease, /gh release (edit|upload|delete)/);
assert.doesNotMatch(mcpWorkflow, /npm run purge|softprops\/action-gh-release/, 'the MCP package is not served from the CDN aliases');
assert.equal(mcpPkg.publishConfig?.access, 'public');
assert.ok(mcpPkg.files.includes('CHANGELOG.md') && mcpPkg.files.includes('contracts'), 'the MCP tarball must ship its changelog and contract copies');
assert.match(read('docs/RELEASING.md'), /release:ship -- mcp-v/, 'RELEASING must document the MCP release path');
execFileSync(process.execPath, [path.join(root, 'scripts/check-mcp-release.mjs'), `mcp-v${mcpPkg.version}`], {
  cwd: root,
  stdio: 'inherit'
});

// release:ship cuts a tag only after CI passed on that exact commit. A tag is
// never moved, so a tag on a red commit burns the version (v0.12.0).
const pushAt = shipReleaseScript.indexOf("run('git', ['push', 'origin', 'main'])");
const waitAt = shipReleaseScript.indexOf('await waitForCi(');
const tagAt = shipReleaseScript.indexOf("run('git', ['tag', '-a'");
assert.ok(pushAt > 0 && waitAt > pushAt && tagAt > waitAt, 'release:ship must push main, then wait for CI, then create the tag');
assert.match(shipReleaseScript, /verdict !== 'success'[\s\S]*?fail\(/, 'release:ship must stop before tagging unless CI succeeded');
assert.doesNotMatch(shipReleaseScript, /console\.log\([^)]*get-url/, 'the origin URL can hold credentials and must never be printed');
const ciStatusScript = read('scripts/ci-status.mjs');
assert.doesNotMatch(ciStatusScript, /process\.env|authorization/i, 'the CI check must not read or send credentials');
assert.match(ciStatusScript, /redirect: 'error'/, 'the CI check must not follow redirects off the fixed API host');

assert.deepEqual(githubRepo('https://github.com/catgarret/kineto.git'), { owner: 'catgarret', repo: 'kineto' });
assert.deepEqual(githubRepo('https://someone:secret@github.com/catgarret/kineto'), { owner: 'catgarret', repo: 'kineto' });
assert.deepEqual(githubRepo('git@github.com:catgarret/kineto.git'), { owner: 'catgarret', repo: 'kineto' });
assert.equal(githubRepo('https://gitlab.com/catgarret/kineto.git'), null);
assert.equal(githubRepo('https://github.com/../etc'), null);

const SHA_A = 'a'.repeat(40);
const run = (id, extra) => ({ id, head_sha: SHA_A, event: 'push', head_branch: 'main', status: 'completed', conclusion: 'success', ...extra });
assert.equal(ciVerdict([], SHA_A), 'missing');
assert.equal(ciVerdict([run(1, { head_branch: 'feature' }), run(2, { event: 'pull_request' })], SHA_A), 'missing', 'only push runs on main count');
assert.equal(ciVerdict([run(1), run(2, { status: 'in_progress', conclusion: null })], SHA_A), 'pending', 'the newest run decides');
assert.equal(ciVerdict([run(3, { conclusion: 'failure' }), run(2)], SHA_A), 'failure');
assert.equal(ciVerdict([run(1, { conclusion: 'cancelled' })], SHA_A), 'failure', 'anything but success blocks the tag');
assert.equal(ciVerdict([run(1)], SHA_A), 'success');

{
  const requested = [];
  const answers = [[], [run(5, { status: 'in_progress', conclusion: null })], [run(5)]];
  const fakeFetch = async (url, init) => {
    requested.push({ url: String(url), init });
    return { ok: true, status: 200, json: async () => ({ workflow_runs: answers.shift() }) };
  };
  let clock = 0;
  const verdict = await waitForCi({ owner: 'catgarret', repo: 'kineto', sha: SHA_A, fetchImpl: fakeFetch, sleep: async (ms) => { clock += ms; }, now: () => clock });
  assert.equal(verdict, 'success', 'waitForCi polls through "not started" and "running" to the result');
  assert.equal(requested.length, 3);
  assert.equal(new URL(requested[0].url).origin, 'https://api.github.com');
  assert.equal(new URL(requested[0].url).searchParams.get('head_sha'), SHA_A);
  assert.equal(Object.keys(requested[0].init.headers).some((name) => /authorization/i.test(name)), false, 'no credentials are sent');
  await assert.rejects(readCiVerdict({ owner: 'catgarret', repo: 'kineto', sha: 'not-a-sha', fetchImpl: fakeFetch }), /invalid commit SHA/);
  await assert.rejects(readCiVerdict({ owner: 'catgarret', repo: 'kineto', sha: SHA_A, fetchImpl: async () => ({ ok: false, status: 403 }) }), /rate limit/);
  const neverStarts = await waitForCi({ owner: 'catgarret', repo: 'kineto', sha: SHA_A, fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ workflow_runs: [] }) }), sleep: async (ms) => { clock += ms; }, now: () => clock });
  assert.equal(neverStarts, 'missing', 'a commit CI never picked up does not get a tag');
}

console.log('release-automation OK — gated least-privilege publish, verified tarball reuse, rerun safety, pinned actions, engine CI, CDN failure handling, the mcp-v release path, and release:ship waiting for green CI before tagging.');
