import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kineto-package-'));

try {
  const packed = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', temp], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  }))[0];
  const tarball = path.join(temp, packed.filename);
  fs.writeFileSync(path.join(temp, 'package.json'), '{"private":true,"type":"module"}\n');
  execFileSync('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--omit=peer',
    tarball
  ], { cwd: temp, stdio: 'pipe' });

  const esm = JSON.parse(execFileSync(process.execPath, [
    '--input-type=module',
    '--eval',
    "import Kineto from '@dong-gri/kineto'; console.log(JSON.stringify({version:Kineto.version,modules:Object.keys(Kineto.registry).length}))"
  ], { cwd: temp, encoding: 'utf8' }));
  assert.equal(esm.modules, 52);

  const cjs = JSON.parse(execFileSync(process.execPath, [
    '--input-type=commonjs',
    '--eval',
    "const Kineto=require('@dong-gri/kineto'); console.log(JSON.stringify({version:Kineto.version,modules:Object.keys(Kineto.registry).length}))"
  ], { cwd: temp, encoding: 'utf8' }));
  assert.deepEqual(cjs, esm);

  const modular = JSON.parse(execFileSync(process.execPath, [
    '--input-type=module',
    '--eval',
    "import Kineto from '@dong-gri/kineto/core'; import slider from '@dong-gri/kineto/modules/slider'; const before=Object.keys(Kineto.registry).length; Kineto.register('slider',slider); console.log(JSON.stringify({before,after:Object.keys(Kineto.registry),api:typeof Kineto.slider}))"
  ], { cwd: temp, encoding: 'utf8' }));
  assert.deepEqual(modular, { before: 0, after: ['slider'], api: 'function' });

  const cssPath = execFileSync(process.execPath, [
    '--input-type=commonjs',
    '--eval',
    "console.log(require.resolve('@dong-gri/kineto/style.css'))"
  ], { cwd: temp, encoding: 'utf8' }).trim();
  assert.ok(cssPath.endsWith('dist/kineto.min.css'));

  const installedPackage = JSON.parse(fs.readFileSync(path.join(temp, 'node_modules/@dong-gri/kineto/package.json'), 'utf8'));
  assert.equal(installedPackage.types, './types/index.d.ts');
  assert.equal(installedPackage.exports['./core'].types, './types/core.d.ts');
  assert.equal(installedPackage.exports['./modules/*'].types, './types/module.d.ts');
  assert.ok(!installedPackage.dependencies?.[installedPackage.name], 'installed package must not depend on itself');
  for (const declaration of ['index', 'core', 'module', 'react', 'vue', 'jquery']) {
    assert.ok(fs.existsSync(path.join(temp, `node_modules/@dong-gri/kineto/types/${declaration}.d.ts`)));
  }

  console.log(`package-tarball OK — ${packed.size} bytes; runtime, CSS, and TypeScript surfaces install cleanly without a self-dependency.`);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
