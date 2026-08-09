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
assert.match(demoWorkflow, /repository:\s*catgarret\/catgarret\.github\.io/);
assert.match(demoWorkflow, /secrets\.DEMO_SITE_TOKEN/);
assert.match(demoWorkflow, /if: env\.DEMO_SITE_TOKEN != ''/);
assert.doesNotMatch(demoWorkflow, /DEMO_SITE_TOKEN[\s\S]{0,300}exit 1/);
assert.match(demoWorkflow, /rsync -a --delete site\/ public-site\/example\/kineto\//);
assert.doesNotMatch(demoWorkflow, /configure-pages|deploy-pages/);
assert.match(security, /provenance/i);
assert.match(security, /3 business days/);
assert.match(supplyChain, /Socket/);
assert.match(supplyChain, /npm run verify/);

execFileSync(process.execPath, [path.join(root, 'scripts/check-release.mjs'), `v${pkg.version}`], {
  cwd: root,
  stdio: 'inherit'
});

console.log('release-automation OK — agent handoff, bilingual notes, tag workflow, npm provenance.');
