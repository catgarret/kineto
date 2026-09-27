// Minified distributables.
// - ESM: rolldown-minified (deps stay external, CSS ships separately).
// - UMD: the UMD build is already minified, so the .min.js is a byte copy —
//   guaranteeing the CDN drop-in is identical to the tested bundle.
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';
import { copyFile, writeFile } from 'node:fs/promises';
import { DEFAULT_ENTRY_NOTICE } from './entry-points.mjs';

const root = new URL('..', import.meta.url);
const rel = (p) => new URL(p, root).pathname;

const esm = await rolldown({
  input: rel('src/index.js'),
  external: ['gsap', 'gsap/ScrollTrigger.js', 'lenis'],
  moduleTypes: { '.css': 'empty' }
});
await esm.write({ file: rel('dist/kineto.min.js'), format: 'es', minify: true, exports: 'named' });
await esm.close();

// The default entry (`@dong-gri/kineto`) is a thin file over the full runtime:
// same module instance as `@dong-gri/kineto/all`, plus a KT_DEPRECATED notice
// (opt-in diagnostics only) saying the default becomes the on-demand core in
// 1.0. See src/defaultEntry.js; the wording comes from kineto.features.json.
await writeFile(rel('dist/kineto.default.js'), defaultEntrySource());

await copyFile(rel('dist/kineto.umd.js'), rel('dist/kineto.umd.min.js'));
await copyFile(rel('dist/kineto.css'), rel('dist/kineto.min.css'));

console.log('Minified: kineto.min.js (ESM), kineto.default.js (default entry), kineto.umd.min.js (UMD), kineto.min.css');

// dist/kineto.default.js is src/defaultEntry.js pointed at the minified full
// runtime, with the notice filled in. Both replacements must match exactly
// once, so a refactor of the source cannot silently ship an empty notice.
function defaultEntrySource() {
  const source = readFileSync(rel('src/defaultEntry.js'), 'utf8');
  const swaps = [
    [/'\.\/index\.js'/g, "'./kineto.min.js'", 2],
    [/\/\* __NOTICE__ \*\/ null/g, JSON.stringify(DEFAULT_ENTRY_NOTICE), 1]
  ];
  return swaps.reduce((code, [pattern, replacement, expected]) => {
    const found = code.match(pattern)?.length || 0;
    if (found !== expected) throw new Error(`src/defaultEntry.js: expected ${expected} × ${pattern}, found ${found}`);
    return code.replace(pattern, replacement);
  }, source);
}
