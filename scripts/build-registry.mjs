// Build the shadcn-compatible registry served from the demo site:
//
//   registry/registry.json + registry/items/**   →   site/r/registry.json
//                                                     site/r/<name>.json
//
// Each item JSON follows https://ui.shadcn.com/schema/registry-item.json with
// every file's `content` inlined, which is what `npx shadcn@latest add
// https://kineto.dongri.me/r/<name>.json` (or `@kineto/<name>` with the
// namespace configured) downloads. The output is a pure function of the
// sources, so scripts/build-demo-cdn.mjs regenerates it with the site and its
// `--check` can assert byte equality.
//
//   node scripts/build-registry.mjs           # write site/r/*
//   node scripts/build-registry.mjs --check   # fail if site/r/* is stale
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_URL = 'https://kineto.dongri.me/r';
const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const INDEX_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';
const FILE_TYPES = new Set(['registry:lib', 'registry:component', 'registry:ui', 'registry:hook', 'registry:file', 'registry:page', 'registry:block', 'registry:item']);

export function loadRegistry() {
  return JSON.parse(fs.readFileSync(path.join(root, 'registry/registry.json'), 'utf8'));
}

/** Validate the source registry; returns a list of problems (empty = ok). */
export function validateRegistry(registry) {
  const problems = [];
  if (registry.$schema !== INDEX_SCHEMA) problems.push('registry.json must declare the shadcn registry schema');
  if (!registry.name || !registry.homepage) problems.push('registry.json needs name and homepage');
  const names = new Set();
  for (const item of registry.items || []) {
    if (!/^[a-z0-9-]+$/.test(item.name || '')) problems.push(`item name "${item.name}" must be kebab-case`);
    if (names.has(item.name)) problems.push(`duplicate item ${item.name}`);
    names.add(item.name);
    if (!FILE_TYPES.has(item.type)) problems.push(`${item.name}: unsupported type ${item.type}`);
    if (!item.title || !item.description) problems.push(`${item.name}: title and description are required`);
    if (!Array.isArray(item.files) || !item.files.length) problems.push(`${item.name}: at least one file`);
    for (const file of item.files || []) {
      const source = path.join(root, file.path);
      if (!fs.existsSync(source)) problems.push(`${item.name}: missing file ${file.path}`);
      if (!FILE_TYPES.has(file.type)) problems.push(`${item.name}: file ${file.path} has unsupported type ${file.type}`);
      if ((file.type === 'registry:file' || file.type === 'registry:page') && !file.target) problems.push(`${item.name}: ${file.path} needs a target`);
      if (file.target && !/^~\//.test(file.target)) problems.push(`${item.name}: target ${file.target} must be project-root relative (~/…)`);
    }
    for (const dependency of item.registryDependencies || []) {
      const local = dependency.match(/^https:\/\/kineto\.dongri\.me\/r\/([a-z0-9-]+)\.json$/);
      if (!local) { problems.push(`${item.name}: registryDependencies must use the deployed URL form (${dependency})`); continue; }
      if (!(registry.items || []).some((other) => other.name === local[1])) problems.push(`${item.name}: depends on unknown item ${local[1]}`);
    }
    // Components import the shared helper through the user's lib alias, which
    // the shadcn CLI rewrites; the item must then declare that dependency.
    for (const file of item.files || []) {
      const source = path.join(root, file.path);
      if (!fs.existsSync(source) || !/\.(tsx?|jsx?)$/.test(file.path)) continue;
      const code = fs.readFileSync(source, 'utf8');
      if (code.includes("'@/lib/kineto-utils'") && !(item.registryDependencies || []).includes(`${REGISTRY_URL}/utils.json`)) {
        problems.push(`${item.name}: imports @/lib/kineto-utils but does not depend on ${REGISTRY_URL}/utils.json`);
      }
      if (/from ['"]kineto(\/|['"])/.test(code)) problems.push(`${item.name}: ${file.path} imports the unscoped "kineto" package`);
      if (file.type === 'registry:component' && !code.startsWith("'use client';")) problems.push(`${item.name}: ${file.path} must start with 'use client' for App Router installs`);
    }
    if (item.type !== 'registry:item' && !(item.dependencies || []).includes('@dong-gri/kineto')) problems.push(`${item.name}: must declare the @dong-gri/kineto dependency`);
  }
  return problems;
}

/** Render every deployed registry file as { 'site/r/<name>.json': content }. */
export function renderRegistrySite(registry = loadRegistry()) {
  const problems = validateRegistry(registry);
  if (problems.length) throw new Error(`registry is invalid:\n  - ${problems.join('\n  - ')}`);
  const files = {};
  const index = { $schema: INDEX_SCHEMA, name: registry.name, homepage: registry.homepage, items: [] };
  for (const item of registry.items) {
    const built = {
      $schema: ITEM_SCHEMA,
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      author: 'dongri <official@dongri.me>',
      ...(item.dependencies ? { dependencies: item.dependencies } : {}),
      ...(item.registryDependencies ? { registryDependencies: item.registryDependencies } : {}),
      files: item.files.map((file) => ({
        path: file.path,
        type: file.type,
        ...(file.target ? { target: file.target } : {}),
        content: fs.readFileSync(path.join(root, file.path), 'utf8')
      })),
      ...(item.docs ? { docs: item.docs } : {}),
      ...(item.categories ? { categories: item.categories } : {})
    };
    files[`site/r/${item.name}.json`] = JSON.stringify(built, null, 2) + '\n';
    const { files: _files, content: _content, ...summary } = item;
    void _files; void _content;
    index.items.push({ ...summary, files: item.files.map(({ path: filePath, type, target }) => ({ path: filePath, type, ...(target ? { target } : {}) })) });
  }
  files['site/r/registry.json'] = JSON.stringify(index, null, 2) + '\n';
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = renderRegistrySite();
  const check = process.argv.includes('--check');
  const stale = [];
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) stale.push(file);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  if (check && stale.length) { console.error(`build-registry --check FAILED — stale:\n  - ${stale.join('\n  - ')}`); process.exit(1); }
  console.log(`${check ? 'build-registry --check OK' : 'Built registry'} — ${Object.keys(files).length - 1} items → site/r/.`);
}
