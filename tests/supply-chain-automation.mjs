import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/supply-chain.yml'), 'utf8');
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
assert.match(workflow, /npm pack --dry-run/);
assert.match(packageJson.scripts['test:node'], /test:supply-chain-automation/);

console.log('supply-chain-automation OK — weekly/manual locked install, registry boundary, npm audit, and package dry-run are wired.');
