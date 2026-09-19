// Loads the contract copies that scripts/build-mcp.mjs syncs into ./contracts.
// Everything the server answers comes from these files — never from the
// network and never from anywhere outside this package directory.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractsDir = path.join(packageRoot, 'contracts');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(contractsDir, file), 'utf8'));
}

/** Parse every contract once; the result is shared by all tools. */
export function loadContracts() {
  return {
    features: readJson('features.json'),
    integrations: readJson('integrations.json'),
    metadata: readJson('module-metadata.json'),
    meta: readJson('meta.json'),
    rules: fs.readFileSync(path.join(contractsDir, 'rules.md'), 'utf8'),
    pkg: JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'))
  };
}
