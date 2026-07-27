import process from 'node:process';
import { execFileSync } from 'node:child_process';
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

try {
  output('git', ['rev-parse', '--verify', `refs/tags/${tag}`]);
  fail(`local tag ${tag} already exists`);
} catch (error) {
  if (error?.status === 1 || error?.status === 128) {
    // Expected: the release tag does not exist locally.
  } else {
    throw error;
  }
}

const remoteTag = output('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
if (remoteTag) fail(`remote tag ${tag} already exists`);

console.log(`Shipping ${tag}: push main, create annotated tag, push tag.`);
run('git', ['push', 'origin', 'main']);
run('git', ['tag', '-a', tag, '-m', `Kineto ${tag}`]);
run('git', ['push', 'origin', tag]);
console.log(`${tag} pushed. GitHub Actions will publish npm and create the bilingual GitHub Release.`);
