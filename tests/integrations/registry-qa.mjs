// Registry QA — the shadcn registry served from kineto.dongri.me/r must be
// consumable exactly the way the docs promise:
//   1. every component type-checks under strict TypeScript with the real
//      @types/react and the package's own declarations;
//   2. the built site/r/*.json files mirror registry/ sources byte for byte
//      and follow the registry-item shape the shadcn CLI expects;
//   3. `npx shadcn add` installs the items into a fresh project: the shared
//      lib lands under the lib alias, components under the components alias,
//      the AI rules under .cursor/rules and docs/, and @dong-gri/kineto is
//      added as a dependency.
// Run: npm --prefix tests/integrations run qa   (from the repository root)
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const registry = JSON.parse(read('registry/registry.json'));
const { renderRegistrySite, validateRegistry } = await import(path.join(root, 'scripts/build-registry.mjs'));

// 1. Sources are valid and the deployed copies are current.
assert.deepEqual(validateRegistry(registry), [], 'registry/registry.json must validate');
const rendered = renderRegistrySite(registry);
for (const [file, content] of Object.entries(rendered)) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} is missing — run npm run build`);
  assert.equal(read(file), content, `${file} is stale — run npm run build`);
}
for (const item of registry.items) {
  const built = JSON.parse(read(`site/r/${item.name}.json`));
  assert.equal(built.$schema, 'https://ui.shadcn.com/schema/registry-item.json');
  assert.equal(built.name, item.name);
  for (const [index, file] of built.files.entries()) {
    assert.equal(file.content, read(item.files[index].path), `${item.name}: ${file.path} content drifted from its source`);
    if (file.type === 'registry:file') assert.ok(file.target?.startsWith('~/'), `${item.name}: registry:file needs a project-root target`);
  }
}
const index = JSON.parse(read('site/r/registry.json'));
assert.deepEqual(index.items.map((item) => item.name), registry.items.map((item) => item.name), 'site/r/registry.json must list every item in order');
assert.ok(index.items.every((item) => !item.files.some((file) => 'content' in file)), 'the index must not inline file contents');

// 2. Strict type-check of every component against the real React types.
execFileSync(path.join(here, 'node_modules/.bin/tsc'), ['-p', path.join(here, 'tsconfig.registry.json')], { stdio: 'inherit' });

// 3. Install into a fresh consumer with the shadcn CLI. Registry dependencies
//    point at the deployed URL; the temporary copy rewrites them to local
//    files so the check does not depend on the live site having deployed yet.
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'kineto-shadcn-'));
try {
  fs.mkdirSync(path.join(consumer, 'r'));
  fs.mkdirSync(path.join(consumer, 'src/app'), { recursive: true });
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ name: 'kineto-shadcn-consumer', private: true, type: 'module', dependencies: { react: '^19.2.8', 'react-dom': '^19.2.8' } }, null, 2));
  fs.writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, baseUrl: '.', paths: { '@/*': ['./src/*'] } }, include: ['src'] }, null, 2));
  fs.writeFileSync(path.join(consumer, 'components.json'), JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: true, tsx: true,
    tailwind: { config: '', css: 'src/app/globals.css', baseColor: 'neutral', cssVariables: true },
    aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' }
  }, null, 2));
  fs.writeFileSync(path.join(consumer, 'src/app/globals.css'), '@import "tailwindcss";\n');
  for (const [file, content] of Object.entries(rendered)) {
    fs.writeFileSync(path.join(consumer, 'r', path.basename(file)), content.replaceAll('https://kineto.dongri.me/r/', './r/'));
  }
  const shadcn = path.join(here, 'node_modules/.bin/shadcn');
  // The CLI sends every registry fetch through `https_proxy` when it is set
  // and ignores `no_proxy`; the loopback registry in step 4 must bypass it.
  const { https_proxy: _proxy, ...envWithoutProxy } = process.env;
  void _proxy;
  // Async on purpose: step 4 serves the registry from this process, and a
  // synchronous spawn would block the event loop the server needs.
  const add = (...items) => promisify(execFile)(shadcn, ['add', ...items, '--yes', '--overwrite'], { cwd: consumer, encoding: 'utf8', timeout: 240000, env: envWithoutProxy });
  await add('./r/provider.json', './r/reveal.json', './r/counter.json');
  await add('./r/ai-rules.json');

  const installed = {
    provider: 'src/components/kineto-provider.tsx',
    reveal: 'src/components/kineto-reveal.tsx',
    counter: 'src/components/kineto-counter.tsx',
    utils: 'src/lib/kineto-utils.ts',
    cursorRule: '.cursor/rules/kineto.mdc',
    rules: 'docs/kineto-ai-rules.md'
  };
  for (const [label, file] of Object.entries(installed)) {
    assert.ok(fs.existsSync(path.join(consumer, file)), `shadcn add did not create ${file} (${label})`);
  }
  const reveal = fs.readFileSync(path.join(consumer, installed.reveal), 'utf8');
  assert.match(reveal, /from '@\/lib\/kineto-utils'/, 'the lib import must resolve to the consumer lib alias');
  assert.match(reveal, /from '@dong-gri\/kineto\/react'/);
  assert.equal(fs.readFileSync(path.join(consumer, installed.rules), 'utf8'), read('ai/kineto.rules.md'), 'the installed AI rules must equal the generated rules');
  const consumerPackage = JSON.parse(fs.readFileSync(path.join(consumer, 'package.json'), 'utf8'));
  assert.ok(consumerPackage.dependencies['@dong-gri/kineto'], 'shadcn add must add @dong-gri/kineto to dependencies');

  // 4. The namespaced form documented in components.json (`@kineto/<name>`):
  //    serve the built registry over HTTP and let the CLI resolve the template.
  const served = Object.fromEntries(Object.entries(rendered).map(([file, content]) => [`/${path.relative('site', file)}`, content]));
  const server = http.createServer((request, response) => {
    const body = served[new URL(request.url, 'http://localhost').pathname];
    if (!body) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(body.replaceAll('https://kineto.dongri.me/r/', `http://127.0.0.1:${server.address().port}/r/`));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const components = JSON.parse(fs.readFileSync(path.join(consumer, 'components.json'), 'utf8'));
    components.registries = { '@kineto': `http://127.0.0.1:${server.address().port}/r/{name}.json` };
    fs.writeFileSync(path.join(consumer, 'components.json'), JSON.stringify(components, null, 2));
    await add('@kineto/marquee');
    assert.ok(fs.existsSync(path.join(consumer, 'src/components/kineto-marquee.tsx')), 'the @kineto namespace must resolve through the registries template');
  } finally {
    server.close();
  }
} finally {
  fs.rmSync(consumer, { recursive: true, force: true });
}

console.log(`integrations registry OK — ${registry.items.length} items validated, strict TypeScript check passed, shadcn CLI installed provider/reveal/counter (+utils), the AI rules and @kineto/marquee (namespaced) into a fresh project.`);
