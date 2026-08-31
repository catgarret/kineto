import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/supply-chain.yml'), 'utf8');
const dependabot = fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /cron:\s*"41 3 \* \* 1"/);
assert.match(workflow, /permissions:[\s\S]*contents:\s*read/);
assert.match(workflow, /timeout-minutes:\s*10/);
assert.match(workflow, /uses:\s*actions\/checkout@v6/);
assert.match(workflow, /uses:\s*actions\/setup-node@v6/);
assert.match(workflow, /node-version:\s*22/);
assert.match(workflow, /npm ci --ignore-scripts/);
assert.match(workflow, /npm run test:lockfile-boundary/);
assert.match(workflow, /npm audit --audit-level=low/);
assert.match(workflow, /npm audit --audit-level=low --json > artifacts\/npm-audit\.json/);
assert.match(workflow, /npm sbom --sbom-format=spdx/);
assert.match(workflow, /npm pack --dry-run/);
assert.match(workflow, /uses:\s*actions\/upload-artifact@v4/);
assert.match(workflow, /name:\s*supply-chain-reports/);
assert.match(workflow, /path:\s*artifacts\//);
assert.match(workflow, /retention-days:\s*14/);
assert.match(dependabot, /package-ecosystem:\s*npm/);
assert.match(dependabot, /package-ecosystem:\s*github-actions/);
assert.match(dependabot, /interval:\s*weekly/);
assert.match(dependabot, /timezone:\s*Asia\/Seoul/);
const lifecycleScripts = Object.keys(packageJson.scripts).filter((name) => /^(pre|post)?install$/.test(name));
assert.deepEqual(lifecycleScripts, [], 'package must not run install lifecycle scripts');
assert.match(packageJson.scripts['test:node'], /test:supply-chain-automation/);

console.log('supply-chain-automation OK — weekly/manual locked install, registry boundary, audit, SPDX SBOM, reports, Dependabot, and install-script policy are wired.');
