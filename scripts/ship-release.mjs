import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.argv[2];
const fail = (message) => {
  console.error(`release-ship: ${message}`);
  process.exit(1);
};
const output = (command, args) => execFileSync(command, args, { cwd: root, encoding: 'utf8' }).trim();
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

if (!/^v\d+\.\d+\.\d+$/.test(tag || '')) fail('pass a tag such as v0.8.44');
if (output('git', ['status', '--porcelain'])) fail('working tree must be clean');
if (output('git', ['branch', '--show-current']) !== 'main') fail('release must be shipped from main');

run(process.execPath, [path.join(root, 'scripts', 'check-release.mjs'), tag]);

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

console.log(`Shipping ${tag}: push main, create annotated tag, push tag.`);
run('git', ['push', 'origin', 'main']);
run('git', ['tag', '-a', tag, '-m', `Kineto ${tag}`]);
run('git', ['push', 'origin', tag]);
console.log(`${tag} pushed. GitHub Actions will publish npm and create the bilingual GitHub Release.`);
