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

assert.match(workflow, /tags:\s*\n\s*-\s*"v\[0-9\]\+\.\[0-9\]\+\.\[0-9\]\+"/);
assert.match(prepareReleaseScript, /const roadmapPath = path\.join\(root, 'docs', 'ROADMAP\.md'\)/,
  'release preparation must target the roadmap explicitly');
assert.match(prepareReleaseScript, /roadmap\.replace\(roadmapBaseline, `\$1v\$\{next\}`\)/,
  'release preparation must synchronize only the roadmap baseline version');
assert.doesNotMatch(prepareReleaseScript, /versionFiles = \[[\s\S]*?'docs\/ROADMAP\.md'[\s\S]*?\];/,
  'release preparation must not rewrite historical roadmap version references');
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
assert.match(verifiedPackageUpload, /^\s+name:\s*verified-package-\$\{\{ github\.ref_name \}\}$/m);
assert.match(verifiedPackageUpload, /overwrite:\s*true/, 'a full workflow rerun must safely replace its prior verified artifact');
assert.match(verifiedPackageDownload, /^\s+name:\s*verified-package-\$\{\{ github\.ref_name \}\}$/m);
assert.match(verifiedPackageDownload, /actions\/download-artifact@[0-9a-f]{40}\s+# v7/);
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
for (const command of [
  'test:utils', 'test:diagnostics', 'test:states', 'test:presence', 'test:contract', 'test:requirements',
  'test:docs', 'test:docs-navigation', 'test:roadmap-readiness', 'test:readiness-gates', 'test:readiness-evidence', 'test:lockfile-boundary', 'test:supply-chain-automation', 'test:module-metadata', 'test:module-status', 'test:mobile-device-manifest',
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
assert.doesNotMatch(demoWorkflow, /gh run view|CI_RUN_ID|actions:\s*read/);
assert.match(demoWorkflow, /permissions:[\s\S]*pages:\s*write/);
assert.match(demoWorkflow, /uses:\s*actions\/configure-pages@[0-9a-f]{40}\s+# v6/);
assert.match(demoWorkflow, /uses:\s*actions\/upload-pages-artifact@[0-9a-f]{40}\s+# v4/);
assert.match(demoWorkflow, /uses:\s*actions\/deploy-pages@[0-9a-f]{40}\s+# v4/);
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

console.log('release-automation OK — gated least-privilege publish, verified tarball reuse, rerun safety, pinned actions, engine CI, and CDN failure handling.');
