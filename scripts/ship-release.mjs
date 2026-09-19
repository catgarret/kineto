// Ship a release tag from a clean `main`: validate, push main, create the
// annotated tag, push the tag. Which package the tag belongs to (and which
// validation runs first) comes from scripts/release-targets.mjs:
//   npm run release:ship -- v0.11.0       # @dong-gri/kineto
//   npm run release:ship -- mcp-v0.1.0    # @dong-gri/kineto-mcp
// Only run this after an explicit release request from the owner.
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELEASE_TARGETS, resolveReleaseTarget } from './release-targets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.argv[2];
const fail = (message) => {
  console.error(`release-ship: ${message}`);
  process.exit(1);
};
const output = (command, args) => execFileSync(command, args, { cwd: root, encoding: 'utf8' }).trim();
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

const target = resolveReleaseTarget(tag);
if (!target) fail(`pass a tag such as ${RELEASE_TARGETS.map((entry) => entry.tagExample).join(' or ')}`);
if (output('git', ['status', '--porcelain'])) fail('working tree must be clean');
if (output('git', ['branch', '--show-current']) !== 'main') fail('release must be shipped from main');

run(process.execPath, [path.join(root, target.checkScript), tag]);

const localTagProbe = spawnSync(
  'git',
  ['show-ref', '--verify', '--quiet', `refs/tags/${tag}`],
  { cwd: root, encoding: 'utf8' }
);
if (localTagProbe.error) throw localTagProbe.error;
if (localTagProbe.status === 0) fail(`local tag ${tag} already exists`);
if (localTagProbe.status !== 1) {
  fail(`could not inspect local tag ${tag}: ${localTagProbe.stderr?.trim() || `git exited ${localTagProbe.status}`}`);
}

const remoteTag = output('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
if (remoteTag) fail(`remote tag ${tag} already exists`);

console.log(`Shipping ${target.label} ${tag}: push main, create annotated tag, push tag.`);
run('git', ['push', 'origin', 'main']);
run('git', ['tag', '-a', tag, '-m', `${target.label} ${tag}`]);
run('git', ['push', 'origin', tag]);
console.log(`${tag} pushed. ${target.workflow} will publish npm and create the bilingual GitHub Release.`);
