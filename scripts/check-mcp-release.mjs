// Validate an `mcp-vX.Y.Z` tag before @dong-gri/kineto-mcp is published:
// the tag must match the package version, the bundled contract copies must be
// the current render of the repository contracts (so the server never ships a
// stale feature contract), and the changelog + bilingual release note must
// exist. Run by scripts/ship-release.mjs and .github/workflows/release-mcp.yml.
//
//   node scripts/check-mcp-release.mjs mcp-v0.1.0
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { MCP_PACKAGE_DIR, renderMcpPackage } from './build-mcp.mjs';
import { resolveReleaseTarget } from './release-targets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.argv[2] || process.env.GITHUB_REF_NAME || '';
const fail = (message) => {
  console.error(`mcp-release-check: ${message}`);
  process.exit(1);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const target = resolveReleaseTarget(tag);
if (!target || target.id !== 'kineto-mcp') fail('tag must match mcp-vMAJOR.MINOR.PATCH');
const { version } = target;

const pkg = JSON.parse(read(`${MCP_PACKAGE_DIR}/package.json`));
const lock = JSON.parse(read(`${MCP_PACKAGE_DIR}/package-lock.json`));
if (pkg.name !== '@dong-gri/kineto-mcp') fail(`unexpected package name ${pkg.name}`);
if (pkg.version !== version) fail(`${MCP_PACKAGE_DIR}/package.json is ${pkg.version}, tag is ${tag}`);
if (lock.version !== version || lock.packages?.['']?.version !== version) fail(`${MCP_PACKAGE_DIR}/package-lock.json is not ${version}`);
if (pkg.publishConfig?.access !== 'public') fail('publishConfig.access must be public for the scoped package');
if (!pkg.bin?.['kineto-mcp'] || !fs.existsSync(path.join(root, MCP_PACKAGE_DIR, pkg.bin['kineto-mcp']))) fail('bin/kineto-mcp entry is missing');

// Contract copies must be exactly what scripts/build-mcp.mjs renders today.
const rootPkg = JSON.parse(read('package.json'));
for (const [file, content] of Object.entries(renderMcpPackage())) {
  if (!fs.existsSync(path.join(root, file)) || read(file) !== content) fail(`${file} is stale — run npm run integrations:build`);
}
const meta = JSON.parse(read(`${MCP_PACKAGE_DIR}/contracts/meta.json`));
if (meta.kinetoVersion !== rootPkg.version) fail(`contracts/meta.json was generated for Kineto ${meta.kinetoVersion}, source is ${rootPkg.version}`);

const changelog = read(`${MCP_PACKAGE_DIR}/CHANGELOG.md`);
if (!new RegExp(`^## \\[${version.replaceAll('.', '\\.')}\\](?:\\s|$)`, 'm').test(changelog)) {
  fail(`${MCP_PACKAGE_DIR}/CHANGELOG.md has no ${version} section`);
}

const notePath = path.join(root, '.github', 'release-notes', `${tag}.md`);
if (!fs.existsSync(notePath)) fail(`missing .github/release-notes/${tag}.md`);
const note = fs.readFileSync(notePath, 'utf8');
const english = note.indexOf('## English');
const korean = note.indexOf('## 한국어');
if (english < 0 || korean < 0) fail('release note must contain English and 한국어 headings');
if (english > korean) fail('English release notes must appear before Korean notes');
if (!/-\s+\S/.test(note.slice(english, korean))) fail('English release notes are empty');
if (!/-\s+\S/.test(note.slice(korean))) fail('Korean release notes are empty');

console.log(`mcp-release-check OK — ${tag}, package ${pkg.name}@${version}, contracts current for Kineto ${meta.kinetoVersion}, English → 한국어 notes.`);
