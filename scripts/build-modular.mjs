// Tree-shakeable ESM distribution. The core and every module are separate
// entries in one code-split graph, so consumers download only the modules they
// import while shared helpers remain deduplicated.
import { readdir, rm } from 'node:fs/promises';
import { rolldown } from 'rolldown';

const root = new URL('..', import.meta.url);
const modulesDir = new URL('src/modules/', root);
const outDir = new URL('dist/modular/', root);
const moduleNames = (await readdir(modulesDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
  .map((entry) => entry.name.slice(0, -3))
  .sort();

const input = { core: new URL('src/core.js', root).pathname };
moduleNames.forEach((name) => { input[`modules/${name}`] = new URL(`src/modules/${name}.js`, root).pathname; });

await rm(outDir, { recursive: true, force: true });
const build = await rolldown({ input, moduleTypes: { '.css': 'empty' } });
await build.write({
  dir: outDir.pathname,
  format: 'es',
  minify: true,
  entryFileNames: '[name].js',
  chunkFileNames: 'chunks/[name]-[hash].js'
});
await build.close();

console.log(`Modular ESM: core + ${moduleNames.length} module entries.`);
