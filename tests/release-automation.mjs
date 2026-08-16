import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const pkg = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/release.yml');
const demoWorkflow = read('.github/workflows/pages.yml');
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
assert.match(pkg.scripts['test:framework'], /scripts\/npm-ci-retry\.mjs/);
assert.match(pkg.scripts['test:consumer-bundles'], /scripts\/npm-ci-retry\.mjs/);
assert.match(workflow, /npm run purge/);
assert.match(workflow, /body_path:\s*"\.github\/release-notes\/\$\{\{ github\.ref_name \}\}\.md"/);
assert.ok(agents.includes('English first') && agents.includes('Korean translation'));
assert.ok(claude.includes('AGENTS.md') && claude.includes('English first and Korean second'));
assert.match(changelog, /## \[Unreleased\]\s*\n+### English[\s\S]*### 한국어/);
assert.ok(note.indexOf('## English') < note.indexOf('## 한국어'));
assert.match(demoWorkflow, /workflows:\s*\[CI\]/);
assert.match(demoWorkflow, /workflow_run\.conclusion == 'success'/);
assert.match(demoWorkflow, /permissions:[\s\S]*pages:\s*write/);
assert.match(demoWorkflow, /uses:\s*actions\/configure-pages@v6/);
assert.match(demoWorkflow, /uses:\s*actions\/upload-pages-artifact@v4/);
assert.match(demoWorkflow, /uses:\s*actions\/deploy-pages@v4/);
assert.match(demoWorkflow, /path:\s*site/);
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
